<script>
    import { onMount } from "svelte";
    import { getPersonalization } from "./websdk"; // Remove onMount if using reactive only? No, Keep it.
    import RecommendationsSidebar from "./RecommendationsSidebar.svelte";
    import ClosestShopsSidebar from "./ClosestShopsSidebar.svelte";
    import PromoBanner from "./PromoBanner.svelte";
    import HandlebarsContent from "./HandlebarsContent.svelte";
    import { fade } from "svelte/transition";
    import { authToken } from "./stores"; // Import store to react to changes

    export let point; // e.g. "homepage_sidebar_top"
    export let title = ""; // Optional title for the zone container

    // Component Registry: Maps JSON "type" to Svelte Component
    const COMPONENT_REGISTRY = {
        ProductRecommendations: RecommendationsSidebar,
        ClosestShops: ClosestShopsSidebar,
        PromoBanner: PromoBanner,
        HandlebarsContent: HandlebarsContent,
    };

    let componentToRender = null;
    let componentData = null;
    let loading = true;
    let error = null;

    // Reactive: Refetch when valid token appears or point changes
    $: if (point || $authToken) {
        loadPersonalization();
    }

    async function loadPersonalization() {
        loading = true;
        try {
            console.log(`[Zone] Loading content for ${point}...`);
            const decision = await getPersonalization(point);

            if (
                decision &&
                decision.type &&
                COMPONENT_REGISTRY[decision.type]
            ) {
                componentToRender = COMPONENT_REGISTRY[decision.type];
                componentData = decision.data;
            } else {
                console.warn(`No component found for type: ${decision?.type}`);
            }
        } catch (err) {
            console.error(`Failed to load zone: ${point}`, err);
            error = err;
        } finally {
            loading = false;
        }
    }
</script>

<div class="personalization-zone" data-zone={point}>
    {#if title}
        <div class="zone-header">
            <h3 class="zone-title">{title}</h3>
            <button
                class="refresh-btn"
                on:click={loadPersonalization}
                aria-label="Refresh Content"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><path d="M21 2v6h-6"></path><path
                        d="M3 12a9 9 0 0 1 15-6.7L21 8"
                    ></path><path d="M3 22v-6h6"></path><path
                        d="M21 12a9 9 0 0 1-15 6.7L3 16"
                    ></path></svg
                >
            </button>
        </div>
    {/if}

    {#if loading}
        <div class="zone-loading">
            <!-- Simple spinner or pulse -->
            <div class="spinner"></div>
        </div>
    {:else if componentToRender}
        <div in:fade>
            <svelte:component
                this={componentToRender}
                {...componentData}
                on:productClick
                on:shopClick
            />
        </div>
    {:else}
        <!-- Modern Empty State -->
        <div class="empty-state" in:fade>
            <div class="empty-icon">✨</div>
            <p>Recommendations will appear here...</p>
        </div>
    {/if}
</div>

<style>
    .personalization-zone {
        min-height: 50px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem; /* Space between header and content */
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
        background-color: #f8f9fa; /* Very light gray */
        border: 2px dashed #e9ecef; /* Dashed border for placeholder feel */
        border-radius: 16px;
        color: #adb5bd; /* Muted text */
        text-align: center;
        transition: all 0.3s ease;
    }

    .empty-state:hover {
        border-color: #dee2e6;
        color: #868e96;
    }

    .empty-icon {
        font-size: 24px;
        margin-bottom: 8px;
        opacity: 0.7;
    }

    .empty-state p {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .zone-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--accent-color, #ffc107);
    }

    .zone-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--secondary-color, #1a1a1a);
        margin: 0;
        letter-spacing: -0.02em;
    }

    .refresh-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        color: var(--text-secondary, #6c757d);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .refresh-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--primary-color, #ff4500);
        transform: rotate(180deg);
    }

    .zone-loading {
        display: flex;
        justify-content: center;
        padding: 2rem;
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: var(--primary-color, #ff4500);
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
