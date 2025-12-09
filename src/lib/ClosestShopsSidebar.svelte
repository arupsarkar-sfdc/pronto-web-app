<script>
    import { createEventDispatcher } from "svelte";
    import { fade, slide } from "svelte/transition";

    const dispatch = createEventDispatcher();

    export let title = "Closest Shops";
    export let shops = []; // Received from Parent

    function handleShopClick(shop) {
        dispatch("shopClick", shop);
    }
</script>

<div class="sidebar-container">
    {#if shops.length === 0}
        <div class="loading">Finding shops...</div>
    {:else}
        <div class="list">
            {#each shops as shop}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="shop-card"
                    on:click={() => handleShopClick(shop)}
                    transition:slide
                >
                    <div class="shop-header">
                        <span class="shop-name">{shop.name}</span>
                        <span class="shop-rating">★ {shop.rating}</span>
                    </div>
                    <div class="shop-details">
                        <span class="distance">{shop.distance} away</span>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .sidebar-container {
        padding: 1.5rem 1rem;
        font-family: "Inter", sans-serif;
        overflow-y: auto;
    }

    .header {
        font-weight: 800;
        color: var(--text-primary, #333);
        margin-bottom: 2rem;
        font-size: 1.25rem;
        letter-spacing: -0.02em;
        border-bottom: 2px solid var(--accent-color, #ffc107);
        padding-bottom: 0.5rem;
        display: inline-block;
        /* Reset rotation/alignment */
        transform: none;
        text-align: left;
        width: 100%;
    }

    .loading,
    .empty {
        color: var(--text-secondary, #666);
        font-size: 0.9rem;
        text-align: center;
        margin-top: 2rem;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .shop-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.04);
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
    }

    .shop-card::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--accent-color, #ffc107);
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .shop-card:hover {
        transform: translateX(4px);
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .shop-card:hover::before {
        opacity: 1;
    }

    .shop-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .shop-name {
        font-weight: 700;
        color: var(--text-primary, #1a1a1a);
        font-size: 1rem;
    }

    .shop-rating {
        background: #fff8e1;
        color: #f57f17;
        font-weight: 700;
        font-size: 0.8rem;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .shop-details {
        font-size: 0.85rem;
        color: var(--text-secondary, #6c757d);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .distance {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    /* Add icon via CSS or Emoji if needed */
    .distance::before {
        content: "📍";
        font-size: 0.9em;
        opacity: 0.7;
    }
</style>
