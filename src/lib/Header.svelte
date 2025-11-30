<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let deliveryMode = "Delivery"; // Delivery or Pickup
    let address = "New York, NY";
    export let isLoggedIn = false;
</script>

<header>
    <div class="header-content">
        <!-- Left: Logo & Address -->
        <div class="left-section">
            <div class="logo">Pronto</div>

            <div class="delivery-toggle">
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

            <div class="address-pill">
                <span class="icon">📍</span>
                <span class="text">{address} • Now</span>
                <span class="arrow">▾</span>
            </div>
        </div>

        <!-- Center: Search -->
        <div class="center-section">
            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search for food, coffee, etc..."
                />
            </div>
        </div>

        <!-- Right: Actions -->
        <div class="right-section">
            <button class="action-btn cart-btn">
                <span class="icon">🛒</span>
                <span class="label">Cart • 0</span>
            </button>

            <div class="auth-buttons">
                {#if isLoggedIn}
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
    </div>
</header>

<style>
    header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: var(--header-height);
        background-color: var(--bg-color);
        box-shadow: var(--shadow-sm);
        z-index: 1000;
        display: flex;
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .header-content {
        width: 100%;
        max-width: var(--container-width);
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }

    .left-section {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .logo {
        font-size: 24px;
        font-weight: 800;
        color: var(--primary-color);
        letter-spacing: -0.03em;
        cursor: pointer;
    }

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

    .center-section {
        flex: 1;
        max-width: 600px;
    }

    .search-bar {
        position: relative;
        width: 100%;
    }

    .search-bar input {
        width: 100%;
        padding: 12px 16px 12px 44px;
        border-radius: var(--radius-pill);
        border: 1px solid transparent;
        background-color: var(--bg-secondary);
        font-size: 15px;
        font-weight: 500;
        outline: none;
        transition: all 0.2s;
        box-sizing: border-box;
    }

    .search-bar input:focus {
        background-color: var(--bg-color);
        border-color: var(--text-primary);
        box-shadow: var(--shadow-md);
    }

    .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5;
    }

    .right-section {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .action-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 10px 20px;
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
    }

    .auth-btn.register {
        background-color: var(--secondary-color);
        color: white;
    }

    .auth-btn.register:hover {
        opacity: 0.9;
    }
</style>
