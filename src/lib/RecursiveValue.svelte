<script>
    export let value;
    export let depth = 0;

    function formatKey(key) {
        return key
            .replace(/ssot__/g, "")
            .replace(/__dlm/g, "")
            .replace(/__c/g, "")
            .replace(/([A-Z])/g, " $1")
            .trim();
    }

    function formatValue(val) {
        if (
            typeof val === "string" &&
            !isNaN(Date.parse(val)) &&
            val.length > 10
        ) {
            return new Date(val).toLocaleString();
        }
        return val;
    }

    function isObject(val) {
        return val && typeof val === "object" && !Array.isArray(val);
    }
</script>

<div class="recursive-value" style="margin-left: {depth * 10}px">
    {#if Array.isArray(value)}
        {#if value.length === 0}
            <span class="empty">[]</span>
        {:else}
            <div class="array-container">
                {#each value as item, i}
                    <div class="array-item">
                        <span class="index">#{i + 1}</span>
                        <svelte:self value={item} depth={depth + 1} />
                    </div>
                {/each}
            </div>
        {/if}
    {:else if isObject(value)}
        {#if Object.keys(value).length === 0}
            <span class="empty">{"{}"}</span>
        {:else}
            <div class="object-container">
                {#each Object.entries(value) as [key, val]}
                    <div class="kv-row">
                        <span class="key">{formatKey(key)}:</span>
                        <svelte:self value={val} depth={depth + 1} />
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <span class="primitive">{formatValue(value)}</span>
    {/if}
</div>

<style>
    .recursive-value {
        font-size: 0.9em;
    }
    .array-container,
    .object-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 4px;
        border-left: 2px solid #e2e8f0;
        padding-left: 8px;
    }
    .array-item {
        margin-bottom: 8px;
    }
    .kv-row {
        display: flex;
        flex-direction: column; /* Stack key and value for better readability in nested */
        gap: 2px;
    }
    .key {
        font-weight: 600;
        color: #64748b;
        font-size: 0.85em;
    }
    .index {
        font-size: 0.75em;
        color: #94a3b8;
        font-weight: bold;
        margin-bottom: 2px;
        display: block;
    }
    .primitive {
        color: #334155;
        word-break: break-word;
    }
    .empty {
        color: #94a3b8;
        font-style: italic;
    }
</style>
