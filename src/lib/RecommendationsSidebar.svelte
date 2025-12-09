<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { getPersonalization } from "./websdk";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();

    export let title = "Recommended for You";
    export let pointName = "pronto_home_recs";

    let recommendations = [];
    let loading = true;

    onMount(async () => {
        try {
            recommendations = await getPersonalization(pointName);
        } catch (err) {
            console.error("Failed to load recommendations", err);
        } finally {
            loading = false;
        }
    });

    function handleClick(item) {
        // Dispatch event to parent
        dispatch("productClick", item);
    }
</script>

<div class="sidebar-container">
    <h3 class="header">{title}</h3>

    {#if loading}
        <div class="loading">Loading...</div>
    {:else if recommendations.length === 0}
        <div class="empty">No recommendations yet.</div>
    {:else}
        <div class="list">
            {#each recommendations as item}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="card"
                    on:click={() => handleClick(item)}
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
        color: var(--text-primary, #333);
        margin-bottom: 2rem;
        font-size: 1.25rem;
        letter-spacing: -0.02em;
        border-bottom: 2px solid var(--primary-color, #ff4500);
        padding-bottom: 0.5rem;
        display: inline-block;
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
