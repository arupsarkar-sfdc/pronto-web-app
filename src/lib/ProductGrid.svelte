<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    const products = [
        {
            id: 1,
            name: "Margherita Pizza",
            price: 10.99,
            rating: 4.5,
            time: "25-35 min",
            fee: "$0.49 delivery",
            image: "🍕",
        },
        {
            id: 2,
            name: "Pepperoni Pizza",
            price: 12.99,
            rating: 4.6,
            time: "20-30 min",
            fee: "$1.49 delivery",
            image: "🍕",
        },
        {
            id: 3,
            name: "Veggie Burger",
            price: 9.99,
            rating: 4.3,
            time: "15-25 min",
            fee: "Free delivery",
            image: "🍔",
        },
        {
            id: 4,
            name: "Chicken Wings",
            price: 8.99,
            rating: 4.7,
            time: "30-40 min",
            fee: "$2.99 delivery",
            image: "🍗",
        },
        {
            id: 5,
            name: "Mushroom Pizza",
            price: 13.99,
            rating: 4.8,
            time: "25-35 min",
            fee: "$0.99 delivery",
            image: "🍄",
        },
        {
            id: 6,
            name: "Caesar Salad",
            price: 8.49,
            rating: 4.4,
            time: "15-25 min",
            fee: "Free delivery",
            image: "🥗",
        },
    ];

    function handleProductClick(product) {
        dispatch("productClick", product);
    }
</script>

<section class="product-grid-container">
    <div class="header">
        <h2>Best Sellers</h2>
        <a href="#" class="see-all">See All</a>
    </div>

    <div class="grid">
        {#each products as product}
            <div
                class="product-card"
                on:click={() => handleProductClick(product)}
            >
                <div class="image-container">
                    <div class="food-emoji">{product.image}</div>
                    <div class="rating-badge">
                        <span class="star">★</span>
                        <span class="score">{product.rating}</span>
                    </div>
                    <button class="add-btn" on:click|stopPropagation>
                        <span class="plus">+</span>
                    </button>
                </div>

                <div class="info">
                    <div class="header-row">
                        <h3>{product.name}</h3>
                    </div>
                    <div class="meta-row">
                        <span class="time">{product.time}</span>
                        <span class="dot">•</span>
                        <span class="fee">{product.fee}</span>
                    </div>
                    <div class="price-row">
                        <span class="price">${product.price}</span>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>

<style>
    .product-grid-container {
        margin-bottom: 60px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    h2 {
        font-size: 24px;
        color: var(--secondary-color);
    }

    .see-all {
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        padding: 8px 16px;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-pill);
        transition: background-color 0.2s;
    }

    .see-all:hover {
        background-color: var(--bg-tertiary);
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
    }

    .product-card {
        background-color: var(--bg-color);
        border-radius: var(--radius-md);
        overflow: hidden;
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        border: 1px solid #808080; /* Deep gray border */
    }

    .product-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary-color); /* Optional: Highlight on hover */
    }

    .image-container {
        height: 180px;
        background-color: var(--bg-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .food-emoji {
        font-size: 80px;
        transition: transform 0.3s;
    }

    .product-card:hover .food-emoji {
        transform: scale(1.1);
    }

    .rating-badge {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 4px 8px;
        border-radius: var(--radius-pill);
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: var(--shadow-sm);
    }

    .star {
        color: #ffd700;
    }

    .add-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: white;
        border: 2px solid var(--primary-color); /* Red circular border */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.2s;
        box-shadow: var(--shadow-sm);
    }

    .product-card:hover .add-btn {
        opacity: 1;
        transform: scale(1);
    }

    .add-btn:hover {
        background-color: var(--primary-color);
        color: white;
    }

    .plus {
        font-size: 20px;
        font-weight: 300;
        line-height: 1;
    }

    .info {
        padding: 16px 12px;
    }

    .header-row h3 {
        font-size: 16px;
        margin-bottom: 4px;
        color: var(--text-primary);
    }

    .meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 8px;
    }

    .price-row .price {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
    }
</style>
