<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    const categories = [
        { name: "Deals", icon: "🏷️" },
        { name: "Grocery", icon: "🥦" },
        { name: "Convenience", icon: "🏪" },
        { name: "Pizza", icon: "🍕" },
        { name: "American", icon: "🍔" },
        { name: "Mexican", icon: "🌮" },
        { name: "Sushi", icon: "🍣" },
        { name: "Asian", icon: "🍜" },
        { name: "Fast Food", icon: "🍟" },
        { name: "Dessert", icon: "🍦" },
        { name: "Drinks", icon: "🥤" },
        { name: "Coffee", icon: "☕" },
    ];

    function handleCategoryClick(category) {
        dispatch("categoryClick", category);
    }
</script>

<section class="hero-container">
    <!-- Category Pills Navigation -->
    <div class="category-section">
        <h3 class="section-title">Categories</h3>
        <div class="category-nav">
            {#each categories as category}
                <button
                    class="category-pill"
                    on:click={() => handleCategoryClick(category)}
                >
                    <div class="icon-wrapper">
                        <span class="icon">{category.icon}</span>
                    </div>
                    <span class="label">{category.name}</span>
                </button>
            {/each}
        </div>
    </div>

    <!-- Promotional Banner -->
    <div class="banner">
        <div class="banner-content">
            <h1>Crave it? Get it.</h1>
            <p>Free delivery on your first order.</p>
            <button class="cta-btn">Order Now</button>
        </div>
        <div class="banner-image">
            <div class="food-emoji">🍕🥗🍔</div>
        </div>
    </div>
</section>

<style>
    .hero-container {
        margin-bottom: 40px;
    }

    .category-section {
        margin-bottom: 32px;
    }

    .section-title {
        font-family: "Inter", sans-serif;
        font-weight: 800;
        font-size: 1.25rem; /* Match sidebar title size */
        margin: 0 0 16px 4px; /* Reset margin, alignment handled by layout padding */
        color: var(--text-primary);
    }

    /* Category Navigation */
    .category-nav {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding: 4px 4px 20px 4px;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
    }

    .category-nav::-webkit-scrollbar {
        display: none; /* Chrome Safari */
    }

    .category-pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-width: 72px;
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .category-pill:hover {
        transform: translateY(-2px);
    }

    .icon-wrapper {
        width: 64px;
        height: 64px;
        background-color: var(--bg-color);
        border-radius: 20px; /* Squircle */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s;
        border: 1px solid var(--border-color);
    }

    .category-pill:hover .icon-wrapper {
        background-color: var(--bg-color);
        border-color: var(--primary-color);
        box-shadow: var(--shadow-md);
    }

    .category-pill .label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
    }

    /* Banner */
    .banner {
        background: linear-gradient(
            135deg,
            #ff9a9e 0%,
            #fecfef 99%,
            #fecfef 100%
        );
        border-radius: var(--radius-lg);
        padding: 48px 64px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }

    .banner-content {
        z-index: 1;
        max-width: 50%;
    }

    h1 {
        font-size: 56px;
        font-weight: 800;
        color: #2d3436;
        margin: 0 0 16px 0;
        line-height: 1.1;
        letter-spacing: -0.02em;
    }

    p {
        font-size: 20px;
        color: #636e72;
        margin: 0 0 32px 0;
        font-weight: 500;
    }

    .cta-btn {
        background-color: var(--secondary-color);
        color: white;
        border: none;
        padding: 16px 40px;
        border-radius: var(--radius-pill);
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .cta-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }

    .banner-image {
        position: relative;
    }

    .food-emoji {
        font-size: 140px;
        filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15));
        animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
        0% {
            transform: translateY(0px) rotate(0deg);
        }
        50% {
            transform: translateY(-20px) rotate(2deg);
        }
        100% {
            transform: translateY(0px) rotate(0deg);
        }
    }

    @media (max-width: 768px) {
        .banner {
            flex-direction: column-reverse;
            text-align: center;
            padding: 40px 24px;
            gap: 32px;
        }

        .banner-content {
            max-width: 100%;
        }

        h1 {
            font-size: 36px;
        }

        p {
            font-size: 16px;
        }

        .food-emoji {
            font-size: 100px;
        }
    }
</style>
