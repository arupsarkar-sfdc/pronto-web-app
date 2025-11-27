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
        <h2>Categories</h2>
        <div class="category-nav">
            {#each categories as category}
                <button
                    class="category-pill"
                    on:click={() => handleCategoryClick(category)}
                >
                    <span class="icon">{category.icon}</span>
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
            <!-- Placeholder for a delicious food image -->
            <div class="food-emoji">🍕🥗🍔</div>
        </div>
    </div>
</section>

<style>
    .hero-container {
        margin-bottom: 40px;
    }

    .category-section {
        margin-bottom: 24px;
    }

    .category-section h2 {
        font-size: 24px;
        color: var(--secondary-color);
        margin-bottom: 16px;
    }

    /* Category Navigation */
    .category-nav {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding: 4px 4px 20px 4px; /* Added padding to avoid cutting off shadows/borders */
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
        min-width: 80px;
        background: none;
        border: none;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .category-pill:hover {
        transform: translateY(-2px);
    }

    .category-pill .icon {
        width: 60px;
        height: 60px;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        transition:
            background-color 0.2s,
            border-color 0.2s;
        border: 1px solid #808080; /* Deep gray border */
    }

    .category-pill:hover .icon {
        background-color: var(--bg-tertiary);
        border-color: var(--primary-color);
    }

    .category-pill .label {
        font-size: 13px;
        font-weight: 600;
    }

    /* Banner */
    .banner {
        background-color: #fdf4f5; /* Light Red/Pink tint */
        border-radius: var(--radius-lg);
        padding: 40px 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
    }

    .banner-content {
        z-index: 1;
        max-width: 50%;
    }

    h1 {
        font-size: 48px;
        color: var(--secondary-color);
        margin-bottom: 12px;
        line-height: 1.1;
    }

    p {
        font-size: 18px;
        color: var(--text-secondary);
        margin-bottom: 24px;
    }

    .cta-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: var(--radius-pill);
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .cta-btn:hover {
        background-color: var(--primary-hover);
    }

    .banner-image {
        position: relative;
    }

    .food-emoji {
        font-size: 120px;
        filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));
        animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
        0% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-15px);
        }
        100% {
            transform: translateY(0px);
        }
    }

    @media (max-width: 768px) {
        .banner {
            flex-direction: column-reverse;
            text-align: center;
            padding: 30px 20px;
            gap: 20px;
        }

        .banner-content {
            max-width: 100%;
        }

        h1 {
            font-size: 32px;
        }

        .food-emoji {
            font-size: 80px;
        }
    }
</style>
