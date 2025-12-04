<script>
    import { cart, isCartOpen } from "./stores";
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    const dispatch = createEventDispatcher();

    function close() {
        $isCartOpen = false;
    }

    function increment(item) {
        cart.updateQuantity(item.id, 1);
    }

    function decrement(item) {
        cart.updateQuantity(item.id, -1);
    }

    $: total = $cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
</script>

{#if $isCartOpen}
    <!-- Backdrop -->
    <div
        class="drawer-backdrop"
        on:click={close}
        transition:fade={{ duration: 200 }}
    ></div>

    <!-- Drawer -->
    <div
        class="drawer"
        transition:fly={{ x: 400, duration: 300, opacity: 1, easing: cubicOut }}
        on:click|stopPropagation
    >
        <div class="drawer-header">
            <h2>Your Cart <span class="count">({$cart.length})</span></h2>
            <button class="close-btn" on:click={close}>
                <span class="icon">✕</span>
            </button>
        </div>

        <div class="drawer-body">
            {#if $cart.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything yet.</p>
                    <button class="start-shopping-btn" on:click={close}
                        >Start Shopping</button
                    >
                </div>
            {:else}
                <div class="cart-items">
                    {#each $cart as item (item.id)}
                        <div
                            class="cart-item"
                            transition:fly={{ y: 20, duration: 200 }}
                        >
                            <div class="item-image">
                                {item.image}
                            </div>

                            <div class="item-info">
                                <h3>{item.name}</h3>
                                <p class="price">${item.price}</p>
                            </div>

                            <div class="quantity-controls">
                                <button
                                    class="qty-btn"
                                    on:click={() => decrement(item)}>−</button
                                >
                                <span class="qty">{item.quantity}</span>
                                <button
                                    class="qty-btn"
                                    on:click={() => increment(item)}>+</button
                                >
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="drawer-footer">
            <div class="total-row">
                <span class="label">Total</span>
                <span class="value">${total.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" disabled={$cart.length === 0}>
                Go to Checkout
            </button>
        </div>
    </div>
{/if}

<style>
    .drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        z-index: 2000;
    }

    .drawer {
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        max-width: 400px;
        height: 100%;
        background-color: var(--bg-color);
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
        z-index: 2001;
        display: flex;
        flex-direction: column;
    }

    .drawer-header {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
    }

    .drawer-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
    }

    .count {
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 20px;
    }

    .close-btn {
        background: var(--bg-secondary);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--text-primary);
    }

    .close-btn:hover {
        background-color: var(--bg-tertiary);
        transform: rotate(90deg);
    }

    .drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
    }

    /* Empty State */
    .empty-state {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--text-secondary);
    }

    .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    .empty-state h3 {
        font-size: 20px;
        color: var(--text-primary);
        margin: 0 0 8px 0;
    }

    .start-shopping-btn {
        margin-top: 24px;
        padding: 12px 24px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: var(--radius-pill);
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .start-shopping-btn:hover {
        background-color: var(--primary-hover);
    }

    /* Cart Items */
    .cart-items {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .cart-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
        gap: 16px;
    }

    .item-image {
        width: 64px;
        height: 64px;
        background-color: white;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        box-shadow: var(--shadow-sm);
    }

    .item-info {
        flex: 1;
    }

    .item-info h3 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .item-info .price {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
    }

    .quantity-controls {
        display: flex;
        align-items: center;
        background-color: white;
        border-radius: var(--radius-pill);
        padding: 4px;
        box-shadow: var(--shadow-sm);
    }

    .qty-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: transparent;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .qty-btn:hover {
        background-color: var(--bg-tertiary);
    }

    .qty {
        min-width: 24px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
    }

    /* Footer */
    .drawer-footer {
        padding: 24px;
        border-top: 1px solid var(--border-color);
        background-color: var(--bg-color);
    }

    .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .total-row .label {
        font-size: 18px;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .total-row .value {
        font-size: 24px;
        font-weight: 800;
        color: var(--text-primary);
    }

    .checkout-btn {
        width: 100%;
        padding: 16px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: var(--radius-pill);
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(255, 69, 0, 0.2);
    }

    .checkout-btn:disabled {
        background-color: var(--bg-tertiary);
        color: var(--text-secondary);
        cursor: not-allowed;
        box-shadow: none;
    }

    .checkout-btn:not(:disabled):hover {
        background-color: var(--primary-hover);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(255, 69, 0, 0.3);
    }
</style>
