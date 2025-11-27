<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Hero logic
    const categories = [
        { name: "Meat", icon: "🍖" },
        { name: "Fast Food", icon: "🍔" },
        { name: "Sushi", icon: "🍣" },
        { name: "Drinks", icon: "🥤" },
    ];

    function handleCategoryClick(category) {
        dispatch("categoryClick", category);
    }
</script>

<section class="hero">
    <div class="categories">
        {#each categories as category}
            <button
                class="category-btn"
                on:click={() => handleCategoryClick(category)}
            >
                <span class="icon">{category.icon}</span>
                <span class="label">{category.name}</span>
            </button>
        {/each}
    </div>

    <div class="hero-content">
        <div class="text-content">
            <span class="offer">New Year Offer</span>
            <h1>30% OFF</h1>
            <p class="date">16 - 31 Dec</p>
            <button class="cta-btn">Get Now</button>
        </div>
        <div class="image-content">
            <!-- Placeholder for pizza image from design -->
            <div class="pizza-slice">🍕</div>
        </div>
    </div>
</section>

<style>
    .hero {
        padding: 0 20px; /* Removed top/bottom padding to let margins handle it */
        margin-bottom: 30px;
    }

    /* Categories Styles */
    .categories {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 25px;
        overflow-x: auto;
        padding-bottom: 5px; /* For scrollbar if needed */
    }

    .category-btn {
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 20px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 80px;
        flex: 1;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .category-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        border-color: #e0e0e0;
    }

    .category-btn .icon {
        font-size: 2rem;
        margin-bottom: 8px;
    }

    .category-btn .label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #333;
    }

    /* Hero Banner Styles */
    .hero-content {
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        border-radius: 24px;
        padding: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        position: relative;
        overflow: hidden;
        min-height: 180px;
        box-shadow: 0 10px 20px rgba(34, 197, 94, 0.2);
    }

    .text-content {
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .offer {
        display: block;
        font-size: 1rem;
        margin-bottom: 5px;
        opacity: 0.95;
        font-weight: 500;
    }

    h1 {
        font-size: 3rem;
        font-weight: 800;
        margin: 0;
        line-height: 1.1;
    }

    .date {
        margin: 8px 0 20px;
        opacity: 0.9;
        font-size: 0.9rem;
    }

    .cta-btn {
        background-color: white;
        color: #22c55e;
        border: none;
        padding: 10px 24px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.1s;
    }

    .cta-btn:active {
        transform: scale(0.95);
    }

    .pizza-slice {
        font-size: 7rem;
        transform: rotate(15deg);
        filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.2));
    }
</style>
