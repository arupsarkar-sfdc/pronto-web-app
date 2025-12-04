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
    sendAddToCart,
  } from "./lib/websdk";

  import { cart, user, isCartOpen } from "./lib/stores";
  import CartModal from "./lib/CartModal.svelte";
  import AdminPage from "./lib/AdminPage.svelte";

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

  // Routing State
  let currentPage = "home"; // 'home' | 'admin'

  function handleHashChange() {
    const hash = window.location.hash;
    if (hash === "#/admin") {
      currentPage = "admin";
    } else {
      currentPage = "home";
    }
  }

  onMount(() => {
    // Set initial page based on hash
    handleHashChange();
    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

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
        user.login(event.detail);
      })
      .catch((err) => console.error("Failed to send identity event", err));
    isAuthModalOpen = false;
  }

  function handleLogout() {
    user.logout();
    console.log("User logged out");
  }

  function handleProductClick(event) {
    console.log("Product clicked:", event.detail);
    // Send Product View Event
    sendProductView(event.detail)
      .then(() => console.log("Product view event sent successfully"))
      .catch((err) => console.error("Failed to send product view event", err));
  }

  function handleAddToCart(event) {
    const product = event.detail;
    cart.addToCart(product);
    // Send Add To Cart Event
    sendAddToCart(product)
      .then(() => console.log("Add to Cart event sent successfully"))
      .catch((err) => console.error("Failed to send Add to Cart event", err));
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
    on:login={openLogin}
    on:register={openRegister}
    on:logout={handleLogout}
  />

  <main>
    {#if currentPage === "admin"}
      <AdminPage />
    {:else}
      <Hero on:categoryClick={handleCategoryClick} />
      <ProductGrid
        on:productClick={handleProductClick}
        on:addToCart={handleAddToCart}
      />
    {/if}
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

  <CartModal />
</div>

<style>
  :global(:root) {
    /* Modern Color Palette */
    --primary-color: #ff4500; /* Vibrant Orange-Red */
    --primary-hover: #e03e00;
    --secondary-color: #1a1a1a; /* Dark Charcoal */
    --accent-color: #ffc107; /* Amber/Gold for ratings/highlights */

    /* Backgrounds */
    --bg-color: #ffffff;
    --bg-secondary: #f8f9fa; /* Very light gray */
    --bg-tertiary: #e9ecef;

    /* Text */
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --text-light: #ffffff;

    /* Borders & Shadows */
    --border-color: #dee2e6;
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

    /* Layout */
    --header-height: 72px;
    --container-width: 1200px;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 24px;
    --radius-pill: 50px;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 24px;
    padding-top: calc(var(--header-height) + 24px);
    box-sizing: border-box;
  }
</style>
