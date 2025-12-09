<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();

    export let title = "Recommended for You";
    export let products = []; // Received from Parent (PersonalizationZone)

    function handleProductClick(product) {
        dispatch("productClick", product);
    }
</script>

<div class="sidebar-container">
    {#if products.length === 0}
        <div class="empty">No recommendations yet.</div>
    {:else}
        <div class="list">
            {#each products as item}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="card"
                    on:click={() => handleProductClick(item)}
                    transition:fade
                >
                    <div class="image-wrapper">
                        <img src={item.image} alt={item.name} />
                    </div>
                    <div class="info">
                        <div class="name">{item.name}</div>
                        <div class="price">${item.price}</div>
                        {#if item.recommender}
                            <div class="badge">{item.recommender}</div>
                        {/if}
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
    }

    .header {
        font-weight: 800;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--secondary-color);
        margin: 0;
        letter-spacing: -0.02em;
    }

    .refresh-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        color: var(--text-secondary);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .refresh-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--primary-color);
        transform: rotate(180deg);
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
        gap: 1.5rem;
    }

    .card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08); /* Soft modern shadow */
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
        border-color: rgba(0, 0, 0, 0.08);
    }

    .image-wrapper {
        height: 160px; /* Taller image */
        width: 100%;
        background: #f8f9fa;
        position: relative;
        overflow: hidden;
    }

    .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }

    .card:hover .image-wrapper img {
        transform: scale(1.05);
    }

    .info {
        padding: 1rem;
    }

    .name {
        font-weight: 700;
        font-size: 1rem;
        margin-bottom: 0.25rem;
        color: var(--text-primary, #1a1a1a);
        line-height: 1.4;
    }

    .price {
        color: var(--primary-color, #ff4500);
        font-weight: 800;
        font-size: 1.1rem;
    }

    .badge {
        display: inline-block;
        background: rgba(255, 69, 0, 0.1);
        color: var(--primary-color, #ff4500);
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 8px;
        border-radius: 100px;
        margin-top: 8px;
    }
</style>
