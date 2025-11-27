<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    const products = [
        {
            id: 1,
            name: "Cheese Pizza",
            price: 10.99,
            rating: 4.4,
            time: "20 min",
            image: "🍕",
        },
        {
            id: 2,
            name: "Pepperoni Pizza",
            price: 12.99,
            rating: 4.6,
            time: "20 min",
            image: "🍕",
        },
        {
            id: 3,
            name: "Veggie Pizza",
            price: 11.99,
            rating: 4.2,
            time: "25 min",
            image: "🥦",
        },
        {
            id: 4,
            name: "Meat Pizza",
            price: 13.99,
            rating: 4.8,
            time: "30 min",
            image: "🍖",
        },
        {
            id: 5,
            name: "Mushroom Pizza",
            price: 11.49,
            rating: 4.3,
            time: "25 min",
            image: "🍄",
        },
    ];

    function handleProductClick(product) {
        dispatch("productClick", product);
    }
</script>

<section class="products">
    <div class="header">
        <h2>Best Sellers</h2>
        <a href="#">See All</a>
    </div>

    <div class="grid">
        {#each products as product}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="card" on:click={() => handleProductClick(product)}>
                <div class="image-container">
                    <span class="emoji">{product.image}</span>
                </div>
                <div class="details">
                    <h3>{product.name}</h3>
                    <div class="meta">
                        <span class="rating">★ {product.rating}</span>
                        <span class="time">{product.time}</span>
                    </div>
                    <div class="price">${product.price}</div>
                </div>
            </div>
        {/each}
    </div>
</section>

<style>
    .products {
        padding: 0 20px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    h2 {
        font-size: 1.5rem;
        color: #111;
        margin: 0;
    }

    a {
        color: #0070d2;
        text-decoration: none;
        font-weight: 500;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
    }

    .card {
        background: white;
        border-radius: 16px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 1px solid #f0f0f0;
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .image-container {
        background-color: #ffe4e1; /* Light pinkish background */
        border-radius: 12px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
    }

    .emoji {
        font-size: 3rem;
    }

    h3 {
        font-size: 1rem;
        margin: 0 0 5px;
        color: #333;
    }

    .meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #888;
        margin-bottom: 8px;
    }

    .rating {
        color: #f59e0b;
    }

    .price {
        font-weight: 700;
        font-size: 1.1rem;
        color: #111;
    }
</style>
