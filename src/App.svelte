<script>
  /* Layout Components */
  import RecommendationsSidebar from "./lib/RecommendationsSidebar.svelte";
  import ClosestShopsSidebar from "./lib/ClosestShopsSidebar.svelte";

  // ... existing imports ...
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

  // ... existing state ...
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

  // Handler for Sidebar events
  function handleRecommendationClick(event) {
    console.log("Recommendation clicked from Sidebar:", event.detail);
    // Can reuse existing product click handler or do specialized logic
    handleProductClick(event);
    // Maybe also add to cart directly or navigate?
    // For now just logging and treating as a view.
  }

  function handleShopClick(event) {
    console.log("Shop clicked:", event.detail);
    // Example: Set store location context
  }
</script>

<div class="app-container">
  <Header
    on:login={openLogin}
    on:register={openRegister}
    on:logout={handleLogout}
  />

  <div class="content-wrapper">
    <!-- Left Sidebar (Stacked) -->
    <aside class="sidebar-left">
      <div class="sidebar-section">
        <RecommendationsSidebar on:productClick={handleRecommendationClick} />
      </div>
      <div class="sidebar-divider"></div>
      <div class="sidebar-section">
        <ClosestShopsSidebar on:shopClick={handleShopClick} />
      </div>
    </aside>

    <!-- Main Content -->
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
  </div>

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
    --container-width: 1400px;
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

  .content-wrapper {
    display: grid;
    /* 2-Column Layout: Sidebar (Fixed) | Content (Flexible) */
    grid-template-columns: 340px 1fr;
    gap: 32px;
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 24px;
    padding-top: calc(var(--header-height) + 24px);
    box-sizing: border-box;
    flex: 1;
  }

  main {
    min-width: 0; /* Prevents flex/grid blowouts */
  }

  aside.sidebar-left {
    /* Sticky Container for the whole rail */
    height: fit-content;
    max-height: calc(100vh - var(--header-height) - 48px);
    position: sticky;
    top: calc(var(--header-height) + 24px);
    overflow-y: auto; /* Independent scrolling */

    /* Optional: Hide scrollbar for cleaner look */
    scrollbar-width: thin;
    -ms-overflow-style: none;

    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  aside.sidebar-left::-webkit-scrollbar {
    width: 6px;
  }

  aside.sidebar-left::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 4px;
  }

  .sidebar-section {
    /* Each component lives here */
  }

  .sidebar-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0 1.5rem;
  }

  @media (max-width: 1200px) {
    /* No specific change for 1200px breakpoint in new layout */
  }

  @media (max-width: 992px) {
    .content-wrapper {
      grid-template-columns: 1fr;
    }
    aside.sidebar-left {
      display: none; /* Mobile behavior TBD */
    }
  }
</style>
