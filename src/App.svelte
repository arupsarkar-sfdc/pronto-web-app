<script>
  /* Layout Components */
  import RecommendationsSidebar from "./lib/RecommendationsSidebar.svelte"; // Keeping just in case or remove? Actually removing mostly, but PersonalizationZone uses it. App doesn't need it direct import anymore if not used.
  /* Removing direct imports of Sidebars from App, adding Zone */
  import PersonalizationZone from "./lib/PersonalizationZone.svelte";

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

  <div class="content-wrapper" class:admin-layout={currentPage === "admin"}>
    {#if currentPage !== "admin"}
      <!-- Left Sidebar (Stacked) -->
      <!-- Left Sidebar (Stacked) -->
      <aside class="sidebar-left">
        <div class="sidebar-section">
          <!-- Simulation of Handlebars Content (Replacing original JSON version) -->
          <PersonalizationZone
            point="Pronto"
            title="Recommended for You"
            autoLoad={false}
          />
        </div>

        <div class="sidebar-divider"></div>

        <div class="sidebar-section">
          <!-- Fallback to mock loop for Shops since "Pronto" is the only active API point -->
          <PersonalizationZone
            point="homepage_sidebar_shops"
            title="Stores near You"
            on:shopClick={handleShopClick}
          />
        </div>
      </aside>
    {/if}

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
    padding-top: 0; /* Handled by children for precise alignment */
    box-sizing: border-box;
    flex: 1;
  }

  .content-wrapper.admin-layout {
    grid-template-columns: 1fr;
    max-width: 1000px; /* Optional: Constrain admin width for readability */
    padding-top: calc(
      var(--header-height) + 24px
    ); /* Admin doesn't have sidebar, so global padding is fine */
  }

  main {
    min-width: 0; /* Prevents flex/grid blowouts */
    padding-top: calc(
      var(--header-height) + 8px
    ); /* Moves main content up slightly for alignment */
  }

  aside.sidebar-left {
    /* Sticky Container for the whole rail */
    height: 100vh; /* Full height to contain the padding */
    position: sticky;
    top: 0; /* Sticks to top of viewport */
    padding-top: calc(
      var(--header-height) + 24px
    ); /* Pushes content down below header */
    overflow-y: auto; /* Independent scrolling */

    /* Optional: Hide scrollbar for cleaner look */
    scrollbar-width: thin;
    -ms-overflow-style: none;

    background: transparent; /* Remove background color from rail itself, or keep? */
    /* Original had background white, radius lg. If height is 100vh, background looks weird. */
    /* Let's keep original visuals but adjust positioning. */
    /* Actually, if I change padding/height logic, the "Card" look of the sidebar might break if it was the aside itself. */
    /* Looking at original: aside had background white. */
    /* Using a wrapper div inside aside for the 'card' look would be safer, but for now let's assume transparent rail. */
    /* Reverting to transparent rail notion for aside, but checking previous CSS... */
    /* Previous: aside.sidebar-left { background: white; ... box-shadow } */
    /* If I stretch it to 100vh, the white bar goes top to bottom. That might be ugly. */
    /* Better approach for visuals: Keep top calc, add margin-top instead of padding? */
    /* No, user wanted to remove padding from main. */
    /* Let's stick to: Content Wrapper has 0 padding. */
    /* Aside has `margin-top: calc(var(--header-height) + 24px)` ? */
    /* If margin-top, it pushes it down. */
    /* Main has `margin-top: calc(var(--header-height) + 8px)`. */
    /* This preserves the Visual Box of the aside (bg white, shadow). */
  }

  aside.sidebar-left {
    /* Restoring Visual Box properties */
    height: fit-content;
    max-height: calc(100vh - var(--header-height) - 48px);
    position: sticky;
    top: calc(var(--header-height) + 24px);

    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    /* No extra margin needed if Wrapper is 0 but we rely on 'top' for sticky? */
    /* Wait, if Wrapper is 0, Layout starts at 0 (under header). */
    /* Sticky element with top: 100px will start at 0 but stick at 100px? No. */
    /* Relative/Static positioning places it at 0. */
    /* We need Margin to place it initially. */
    margin-top: calc(var(--header-height) + 24px);
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
