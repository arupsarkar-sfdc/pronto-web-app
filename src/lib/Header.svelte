<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { cart, user, isCartOpen } from "./stores";
    import { fade, slide } from "svelte/transition";

    const dispatch = createEventDispatcher();

    let deliveryMode = "Delivery"; // Delivery or Pickup
    let address = "New York, NY";
    let currentTime = new Date();
    let interval;
    let isMobileMenuOpen = false;

    $: cartCount = $cart.reduce((sum, item) => sum + item.quantity, 0);

    onMount(() => {
        interval = setInterval(() => {
            currentTime = new Date();
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    $: formattedTime = currentTime.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    function toggleCart() {
        $isCartOpen = !$isCartOpen;
        isMobileMenuOpen = false; // Close mobile menu if cart is opened
    }

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            isMobileMenuOpen = false;
        }
    }
</script>

<svelte:window on:resize={handleResize} />

<header>
    <div class="header-content">
        <!-- Left: Logo & Mobile Toggle -->
        <div class="left-section">
            <button class="mobile-menu-btn" on:click={toggleMobileMenu}>
                <span class="hamburger-icon">☰</span>
            </button>
            <div class="logo">🍔 Pronto</div>

            <div class="desktop-only delivery-toggle">
                <button
                    class="toggle-btn {deliveryMode === 'Delivery'
                        ? 'active'
                        : ''}"
                    on:click={() => (deliveryMode = "Delivery")}
                    >Delivery</button
                >
                <button
                    class="toggle-btn {deliveryMode === 'Pickup'
                        ? 'active'
                        : ''}"
                    on:click={() => (deliveryMode = "Pickup")}>Pickup</button
                >
            </div>

            <div class="desktop-only address-pill">
                <span class="icon">📍</span>
                <span class="text">{address} • Now</span>
                <span class="arrow">▾</span>
            </div>
            <a href="#/admin" class="admin-link desktop-only">Admin</a>
        </div>

        <!-- Center: Search (Desktop) -->
        <div class="center-section desktop-only">
            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search for food, coffee, etc..."
                />
            </div>
        </div>

        <!-- Right: Actions (Desktop) -->
        <div class="right-section desktop-only">
            <div class="current-time">
                {formattedTime}
            </div>

            {#if $user.isLoggedIn && $user.profile}
                <div class="welcome-msg">
                    Hi, {$user.profile.firstName}
                </div>
            {/if}

            <button class="action-btn cart-btn" on:click={toggleCart}>
                <span class="icon">🛒</span>
                <span class="label">Cart • {cartCount}</span>
            </button>

            <div class="auth-buttons">
                {#if $user.isLoggedIn}
                    <button
                        class="auth-btn login"
                        on:click={() => dispatch("logout")}>Log Out</button
                    >
                {:else}
                    <button
                        class="auth-btn login"
                        on:click={() => dispatch("login")}>Log In</button
                    >
                    <button
                        class="auth-btn register"
                        on:click={() => dispatch("register")}>Sign Up</button
                    >
                {/if}
            </div>
        </div>

        <!-- Mobile Cart Icon (Always Visible) -->
        <div class="mobile-only mobile-cart">
            <button class="icon-btn" on:click={toggleCart}>
                <span class="icon">🛒</span>
                {#if cartCount > 0}
                    <span class="badge">{cartCount}</span>
                {/if}
            </button>
        </div>
    </div>

    <!-- Mobile Menu Drawer -->
    {#if isMobileMenuOpen}
        <div class="mobile-menu" transition:slide={{ duration: 300 }}>
            <div class="mobile-header-row">
                <div class="mobile-time">{formattedTime}</div>
            </div>

            <div class="mobile-search">
                <div class="search-bar">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Search..." />
                </div>
            </div>

            <div class="mobile-nav-links">
                <div class="mobile-delivery-toggle">
                    <button
                        class="toggle-btn {deliveryMode === 'Delivery'
                            ? 'active'
                            : ''}"
                        on:click={() => (deliveryMode = "Delivery")}
                        >Delivery</button
                    >
                    <button
                        class="toggle-btn {deliveryMode === 'Pickup'
                            ? 'active'
                            : ''}"
                        on:click={() => (deliveryMode = "Pickup")}
                        >Pickup</button
                    >
                </div>

                <div class="mobile-address">
                    <span class="icon">📍</span>
                    <span class="text">{address}</span>
                </div>

                <a
                    href="#/admin"
                    class="mobile-link"
                    on:click={() => (isMobileMenuOpen = false)}
                    >Admin Dashboard</a
                >
            </div>

            <div class="mobile-auth">
                {#if $user.isLoggedIn}
                    <div class="user-info">
                        Signed in as <strong>{$user.profile.firstName}</strong>
                    </div>
                    <button
                        class="auth-btn login full-width"
                        on:click={() => {
                            dispatch("logout");
                            isMobileMenuOpen = false;
                        }}>Log Out</button
                    >
                {:else}
                    <button
                        class="auth-btn login full-width"
                        on:click={() => {
                            dispatch("login");
                            isMobileMenuOpen = false;
                        }}>Log In</button
                    >
                    <button
                        class="auth-btn register full-width"
                        on:click={() => {
                            dispatch("register");
                            isMobileMenuOpen = false;
                        }}>Sign Up</button
                    >
                {/if}
            </div>
        </div>
    {/if}
</header>

<style>
    header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: var(--header-height);
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow-sm);
        z-index: 1000;
        display: flex;
        flex-direction: column;
    }

    .header-content {
        width: 100%;
        max-width: var(--container-width);
        margin: 0 auto;
        height: var(--header-height);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
    }

    /* Left Section */
    .left-section {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-primary);
        padding: 0;
    }

    .logo {
        font-size: 24px;
        font-weight: 800;
        color: var(--primary-color);
        letter-spacing: -0.03em;
        cursor: pointer;
    }

    /* Delivery Toggle */
    .delivery-toggle {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-pill);
        padding: 4px;
        display: flex;
    }

    .toggle-btn {
        background: none;
        border: none;
        padding: 6px 16px;
        border-radius: var(--radius-pill);
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
    }

    .toggle-btn.active {
        background-color: var(--bg-color);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
    }

    /* Address Pill */
    .address-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: var(--radius-pill);
        background-color: var(--bg-secondary);
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .address-pill:hover {
        background-color: var(--bg-tertiary);
    }

    .address-pill .text {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .admin-link {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .admin-link:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
    }

    /* Center Section */
    .center-section {
        flex: 1;
        max-width: 500px;
        margin: 0 20px;
    }

    .search-bar {
        position: relative;
        width: 100%;
    }

    .search-bar input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border-radius: var(--radius-pill);
        border: 1px solid transparent;
        background-color: var(--bg-secondary);
        font-size: 14px;
        font-weight: 500;
        outline: none;
        transition: all 0.2s;
        box-sizing: border-box;
    }

    .search-bar input:focus {
        background-color: var(--bg-color);
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
    }

    .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5;
        font-size: 14px;
    }

    /* Right Section */
    .right-section {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .welcome-msg {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        white-space: nowrap;
    }

    .action-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .action-btn:hover {
        background-color: var(--primary-hover);
    }

    .auth-buttons {
        display: flex;
        gap: 8px;
    }

    .auth-btn {
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }

    .auth-btn.login {
        background: none;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }

    .auth-btn.login:hover {
        background-color: var(--bg-secondary);
        border-color: var(--text-primary);
    }

    .auth-btn.register {
        background-color: var(--secondary-color);
        color: white;
    }

    .auth-btn.register:hover {
        opacity: 0.9;
    }

    /* Mobile Styles */
    .mobile-only {
        display: none;
    }

    .mobile-menu {
        position: absolute;
        top: var(--header-height);
        left: 0;
        width: 100%;
        background-color: var(--bg-color);
        border-top: 1px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .mobile-nav-links {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .mobile-delivery-toggle {
        display: flex;
        background-color: var(--bg-tertiary);
        padding: 4px;
        border-radius: var(--radius-pill);
    }

    .mobile-delivery-toggle .toggle-btn {
        flex: 1;
    }

    .mobile-address {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
        font-weight: 500;
    }

    .mobile-link {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        text-decoration: none;
        padding: 12px;
        border-bottom: 1px solid var(--border-color);
    }

    .mobile-auth {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 10px;
    }

    .full-width {
        width: 100%;
        padding: 12px;
    }

    .user-info {
        text-align: center;
        margin-bottom: 8px;
        font-size: 14px;
    }

    .icon-btn {
        background: none;
        border: none;
        font-size: 24px;
        position: relative;
        cursor: pointer;
    }

    .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: var(--primary-color);
        color: white;
        font-size: 10px;
        font-weight: bold;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .current-time {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
        white-space: nowrap;
        margin-right: 8px;
    }

    .mobile-header-row {
        display: flex;
        justify-content: center;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 10px;
    }

    .mobile-time {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
    }

    /* Responsive Breakpoints */
    @media (max-width: 768px) {
        .desktop-only {
            display: none !important;
        }

        .mobile-only {
            display: block;
        }

        .mobile-menu-btn {
            display: block;
        }

        .header-content {
            padding: 0 16px;
        }
    }
</style>
