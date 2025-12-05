<script>
    import { onMount, afterUpdate, onDestroy } from "svelte";
    import Chart from "chart.js/auto";

    // Set global chart font
    Chart.defaults.font.family =
        "'Inter', system-ui, -apple-system, sans-serif";
    Chart.defaults.color = "#64748b";
    Chart.defaults.scale.grid.color = "#f1f5f9";

    // Common chart options
    const commonOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: { size: 12, weight: 500 },
                    usePointStyle: true,
                    padding: 20,
                },
            },
            title: {
                display: true,
                font: { size: 16, weight: 600, family: "'Inter', sans-serif" },
                padding: { bottom: 20 },
                color: "#1e293b",
            },
        },
    };

    export let data = null;

    let browseChartCanvas;
    let cartChartCanvas;
    let browseChart;
    let cartChart;
    let timelineChartCanvas;
    let timelineChart;

    // Helper to extract data safely
    function extractAnalyticsData(payload) {
        let browseHistory = [];
        let cartItems = [];

        if (!payload) return { browseHistory, cartItems };

        // Recursive traversal to find specific arrays
        const traverse = (obj) => {
            if (!obj || typeof obj !== "object") return;

            Object.keys(obj).forEach((key) => {
                // Check for Browse History (matching AdminPage.svelte logic)
                if (
                    (key.includes("ProductBrowseEngagement") ||
                        key.includes(
                            "UnifiedLinkssotGoodsProductBrowseHistory__dlm",
                        )) &&
                    Array.isArray(obj[key])
                ) {
                    browseHistory = [...browseHistory, ...obj[key]];
                }
                // Check for Cart Items (matching AdminPage.svelte logic)
                else if (
                    (key.includes("ShoppingCartEngagement") ||
                        key.includes("UnifiedLinkssotCartItem__dlm")) &&
                    Array.isArray(obj[key])
                ) {
                    cartItems = [...cartItems, ...obj[key]];
                }

                // Recurse
                if (Array.isArray(obj[key])) {
                    obj[key].forEach((item) => traverse(item));
                } else if (typeof obj[key] === "object") {
                    traverse(obj[key]);
                }
            });
        };

        // Handle array or object payload
        if (Array.isArray(payload)) {
            payload.forEach((item) => traverse(item));
        } else {
            traverse(payload);
        }

        return { browseHistory, cartItems };
    }

    // Reactive extraction
    $: extracted = extractAnalyticsData(data);
    $: browseHistory = extracted.browseHistory;
    $: cartItems = extracted.cartItems;

    function processBrowseData(browseHistory) {
        // Count views per product
        const productCounts = {};
        browseHistory.forEach((item) => {
            // Use ProductId as fallback if Name is missing
            const name =
                item.ssot__GoodsProduct__dlm?.[0]?.ssot__Name__c ||
                item.ssot__ProductId__c ||
                "Unknown Product";
            productCounts[name] = (productCounts[name] || 0) + 1;
        });
        return {
            labels: Object.keys(productCounts),
            datasets: [
                {
                    label: "Product Views",
                    data: Object.values(productCounts),
                    backgroundColor: "rgba(59, 130, 246, 0.6)", // Blue 500
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                },
            ],
        };
    }

    function processCartData(cartItems) {
        // Count items or sum quantity
        const productQuantities = {};
        cartItems.forEach((item) => {
            // Try to find a name, fallback to ID
            const name =
                item.ssot__GoodsProduct__dlm?.[0]?.ssot__Name__c ||
                item.ssot__ProductId__c ||
                item.ssot__Id__c ||
                "Unknown Item";
            const qty = item.ssot__Quantity__c || 1; // Default to 1 if quantity missing
            productQuantities[name] = (productQuantities[name] || 0) + qty;
        });

        return {
            labels: Object.keys(productQuantities),
            datasets: [
                {
                    label: "Cart Quantity",
                    data: Object.values(productQuantities),
                    backgroundColor: [
                        "rgba(16, 185, 129, 0.6)", // Emerald
                        "rgba(245, 158, 11, 0.6)", // Amber
                        "rgba(239, 68, 68, 0.6)", // Red
                        "rgba(99, 102, 241, 0.6)", // Indigo
                        "rgba(139, 92, 246, 0.6)", // Violet
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }

    function processTimelineData(browseHistory, cartItems) {
        // Group by Date -> Product -> Count
        const timeline = {};
        const allProducts = new Set();

        const addToTimeline = (item, type) => {
            if (!item.ssot__CreatedDate__c) return;
            const date = new Date(
                item.ssot__CreatedDate__c,
            ).toLocaleDateString();
            const name =
                item.ssot__GoodsProduct__dlm?.[0]?.ssot__Name__c ||
                item.ssot__ProductId__c ||
                (type === "Cart" ? item.ssot__Id__c : "Unknown");

            if (!timeline[date]) timeline[date] = {};
            timeline[date][name] = (timeline[date][name] || 0) + 1;
            allProducts.add(name);
        };

        browseHistory.forEach((item) => addToTimeline(item, "Browse"));
        cartItems.forEach((item) => addToTimeline(item, "Cart"));

        const dates = Object.keys(timeline).sort(
            (a, b) => new Date(a) - new Date(b),
        );
        const products = Array.from(allProducts);

        const datasets = products.map((product, index) => ({
            label: product,
            data: dates.map((date) => timeline[date][product] || 0),
            backgroundColor: `hsl(${(index * 360) / products.length}, 70%, 60%)`,
        }));

        return { labels: dates, datasets };
    }

    function renderCharts() {
        if (!data) return;

        // Destroy existing charts if they exist
        if (browseChart) browseChart.destroy();
        if (cartChart) cartChart.destroy();
        if (timelineChart) timelineChart.destroy();

        // Render Browse Chart
        if (browseChartCanvas && browseHistory.length > 0) {
            const browseData = processBrowseData(browseHistory);
            browseChart = new Chart(browseChartCanvas, {
                type: "bar",
                data: browseData,
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: { display: false },
                        title: {
                            ...commonOptions.plugins.title,
                            text: "Most Viewed Products",
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: { size: 11 } },
                        },
                        x: { ticks: { font: { size: 11 } } },
                    },
                },
            });
        }

        // Render Cart Chart
        if (cartChartCanvas && cartItems.length > 0) {
            const cartData = processCartData(cartItems);
            cartChart = new Chart(cartChartCanvas, {
                type: "doughnut",
                data: cartData,
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            ...commonOptions.plugins.legend,
                            position: "bottom",
                        },
                        title: {
                            ...commonOptions.plugins.title,
                            text: "Cart Composition",
                        },
                    },
                },
            });
        }

        // Render Timeline Chart
        if (
            timelineChartCanvas &&
            (browseHistory.length > 0 || cartItems.length > 0)
        ) {
            const timelineData = processTimelineData(browseHistory, cartItems);
            timelineChart = new Chart(timelineChartCanvas, {
                type: "bar",
                data: timelineData,
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            ...commonOptions.plugins.legend,
                            position: "bottom",
                        },
                        title: {
                            ...commonOptions.plugins.title,
                            text: "Activity Timeline",
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: { display: false },
                            ticks: { font: { size: 11 } },
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: { size: 11 } },
                        },
                    },
                },
            });
        }
    }

    // React to data changes
    $: if (data) {
        // Use setTimeout to ensure DOM is ready if switching views
        setTimeout(renderCharts, 0);
    }

    onDestroy(() => {
        if (browseChart) browseChart.destroy();
        if (cartChart) cartChart.destroy();
    });
</script>

<div class="analytics-dashboard">
    <div class="chart-container full-width">
        <canvas bind:this={timelineChartCanvas}></canvas>
        {#if !data || (browseHistory.length === 0 && cartItems.length === 0)}
            <div class="no-data">No activity data available</div>
        {/if}
    </div>
    <div class="chart-container">
        <canvas bind:this={browseChartCanvas}></canvas>
        {#if !data || browseHistory.length === 0}
            <div class="no-data">No browse history available</div>
        {/if}
    </div>
    <div class="chart-container">
        <canvas bind:this={cartChartCanvas}></canvas>
        {#if !data || cartItems.length === 0}
            <div class="no-data">Cart is empty</div>
        {/if}
    </div>
</div>

<style>
    .analytics-dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        padding: 1rem;
        width: 100%;
    }

    .chart-container {
        background: white;
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        min-height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .full-width {
        grid-column: 1 / -1;
        min-height: 400px;
    }

    canvas {
        width: 100% !important;
        height: 100% !important;
        max-height: 300px;
    }

    .full-width canvas {
        max-height: 400px;
    }

    .no-data {
        position: absolute;
        color: #94a3b8;
        font-style: italic;
        font-size: 0.9rem;
    }
</style>
