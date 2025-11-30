<script>
  import { onMount } from "svelte";
  import Header from "./lib/Header.svelte";
  import Hero from "./lib/Hero.svelte";
  import ProductGrid from "./lib/ProductGrid.svelte";
  import Modal from "./lib/Modal.svelte";
  import AuthModal from "./lib/AuthModal.svelte";
  import {
    injectWebSDK,
    initWebSDK,
    sendConsent,
    sendIdentity,
    sendProductView,
    sendCategoryView,
  } from "./lib/websdk";

  // Modal State
  let isModalOpen = false;
  let initialConsent = "Opt In";
  let consent = true;
  // Default CDN URL
  let cdnScript =
    "https://cdn.c360a.salesforce.com/beacon/c360a/c75fef21-9808-4a7d-839b-f730b3e68dc4/scripts/c360a.min.js";

  // Auth Modal State
  let isAuthModalOpen = false;
  let authMode = "login";
  let isLoggedIn = false;

  onMount(() => {
    // Initialize WebSDK on mount with default or existing config
    if (cdnScript) {
      injectWebSDK(cdnScript)
        .then(() => {
          initWebSDK({ consent, initialConsent }).then(() => {
            // Send initial consent event ONLY after init is done
            sendConsent(consent ? "Opt In" : "Opt Out")
              .then(() => console.log("Initial consent sent successfully"))
              .catch((err) =>
                console.error("Failed to send initial consent", err),
              );
          });
        })
        .catch((err) => console.error("Error injecting WebSDK:", err));
    }
  });

  function handleSave(event) {
    const config = event.detail;
    initialConsent = config.initialConsent;
    consent = config.consent;

    // Sync logic: if user changed dropdown, update boolean.
    // Ideally, the Modal should handle this, but we can enforce it here or just rely on the boolean 'consent'
    // which is what the toggle controls.
    // The issue is that 'initialConsent' is just a string and 'consent' is the boolean that drives the logic.
    // We should probably just use 'consent' for everything or make sure they match.

    if (config.cdnScript) {
      cdnScript = config.cdnScript;
    }

    console.log("Configuration saved:", config);

    // Inject and Init WebSDK
    if (cdnScript) {
      injectWebSDK(cdnScript)
        .then(() => {
          initWebSDK({ consent, initialConsent });
          // Send initial consent event
          sendConsent(consent ? "Opt In" : "Opt Out")
            .then(() => console.log("Consent update sent successfully"))
            .catch((err) =>
              console.error("Failed to send consent update", err),
            );
        })
        .catch((err) => console.error("Error injecting WebSDK:", err));
    }
  }

  function openLogin() {
    authMode = "login";
    isAuthModalOpen = true;
  }

  function openRegister() {
    authMode = "register";
    isAuthModalOpen = true;
  }

  function handleAuthSubmit(event) {
    console.log("Auth submitted:", event.detail);
    // Send Identity Event
    sendIdentity(event.detail)
      .then(() => {
        console.log("Identity event sent successfully");
        isLoggedIn = true;
      })
      .catch((err) => console.error("Failed to send identity event", err));
    isAuthModalOpen = false;
  }

  function handleLogout() {
    isLoggedIn = false;
    console.log("User logged out");
    // Optional: Send a logout event if supported by SDK, or clear session
  }

  function handleProductClick(event) {
    console.log("Product clicked:", event.detail);
    // Send Product View Event
    sendProductView(event.detail)
      .then(() => console.log("Product view event sent successfully"))
      .catch((err) => console.error("Failed to send product view event", err));
  }

  function handleCategoryClick(event) {
    console.log("Category clicked:", event.detail);
    // Send Category View Event
    sendCategoryView(event.detail.name)
      .then(() => console.log("Category view event sent successfully"))
      .catch((err) => console.error("Failed to send category view event", err));
  }
</script>

<div class="app-container">
  <Header
    {isLoggedIn}
    on:login={openLogin}
    on:register={openRegister}
    on:logout={handleLogout}
  />

  <main>
    <Hero on:categoryClick={handleCategoryClick} />
    <ProductGrid on:productClick={handleProductClick} />
  </main>

  <Modal
    bind:isOpen={isModalOpen}
    bind:initialConsent
    bind:consent
    bind:cdnScript
    on:save={handleSave}
  />

  <AuthModal
    bind:isOpen={isAuthModalOpen}
    mode={authMode}
    on:submit={handleAuthSubmit}
  />
</div>

<style>
  .app-container {
    font-family: "Inter", sans-serif;
    color: #333;
    background-color: #f9f9f9;
    min-height: 100vh;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    padding-top: calc(var(--header-height) + 20px);
  }
</style>
