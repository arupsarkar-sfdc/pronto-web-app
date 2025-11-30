<script>
    import { cart, isCartOpen } from "./stores";
    import { createEventDispatcher } from "svelte";

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
    <div class="modal-backdrop" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <h2>Your Cart</h2>
                <button class="close-btn" on:click={close}>&times;</button>
            </div>

            <div class="cart-items">
                {#if $cart.length === 0}
                    <div class="empty-cart">
                        <span class="empty-icon">🛒</span>
                        <p>Your cart is empty</p>
                    </div>
                {:else}
                    {#each $cart as item}
                        <div class="cart-item">
                            <div class="item-image">{item.image}</div>
                            <div class="item-details">
                                <h3>{item.name}</h3>
                                <p class="item-price">${item.price}</p>
                            </div>
                            <div class="item-controls">
                                <button
                                    class="qty-btn"
                                    on:click={() => decrement(item)}>-</button
                                >
                                <span class="qty">{item.quantity}</span>
                                <button
                                    class="qty-btn"
                                    on:click={() => increment(item)}>+</button
                                >
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>

            <div class="modal-footer">
                <div class="total-row">
                    <span>Total</span>
                    <span class="total-price">${total.toFixed(2)}</span>
                </div>
                <button class="checkout-btn" disabled={$cart.length === 0}>
                    Checkout
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background-color: white;
        padding: 24px;
        border-radius: 20px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .cart-items {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 20px;
    }

    .empty-cart {
        text-align: center;
        padding: 40px 0;
        color: #888;
    }

    .empty-icon {
        font-size: 48px;
        display: block;
        margin-bottom: 10px;
    }

    .cart-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
    }

    .item-image {
        font-size: 24px;
        width: 40px;
        height: 40px;
        background: #f5f5f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
    }

    .item-details {
        flex: 1;
    }

    .item-details h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
    }

    .item-price {
        margin: 4px 0 0;
        font-size: 13px;
        color: #666;
    }

    .item-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f5f5f5;
        padding: 4px;
        border-radius: 20px;
    }

    .qty-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: white;
        cursor: pointer;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .qty {
        font-size: 13px;
        font-weight: 600;
        min-width: 16px;
        text-align: center;
    }

    .modal-footer {
        border-top: 1px solid #eee;
        padding-top: 20px;
    }

    .total-row {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        font-size: 18px;
        margin-bottom: 16px;
    }

    .checkout-btn {
        width: 100%;
        padding: 14px;
        background-color: #e31837;
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .checkout-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .checkout-btn:not(:disabled):hover {
        background-color: #c4122d;
    }
</style>
