<script>
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;
    export let initialConsent = "Opt In";
    export let consent = false;
    export let cdnScript = "";

    const dispatch = createEventDispatcher();

    function toggle() {
        isOpen = !isOpen;
    }

    // Reactive statements to sync dropdown and toggle
    $: if (initialConsent === "Opt In") {
        console.log("User selected: Opt In");
        consent = true;
    } else if (initialConsent === "Opt Out") {
        console.log("User selected: Opt Out");
        consent = false;
    }

    // Watch for toggle changes to update dropdown (optional, but good for consistency)
    function handleToggleChange() {
        initialConsent = consent ? "Opt In" : "Opt Out";
    }

    function handleSave() {
        dispatch("save", { initialConsent, consent, cdnScript });
        isOpen = false;
    }
</script>

<div class="modal-container" class:open={isOpen}>
    <button class="toggle-btn" on:click={toggle}>
        <span class="icon">⚙️</span>
    </button>

    {#if isOpen}
        <div class="modal-content">
            <div class="row">
                <div class="field">
                    <label for="initial-consent">Initial Consent</label>
                    <select id="initial-consent" bind:value={initialConsent}>
                        <option value="Opt In">Opt In</option>
                        <option value="Opt Out">Opt Out</option>
                    </select>
                </div>

                <div class="field">
                    <label for="consent-toggle">Consent</label>
                    <div class="toggle-switch">
                        <input
                            type="checkbox"
                            id="consent-toggle"
                            bind:checked={consent}
                            on:change={handleToggleChange}
                        />
                        <label for="consent-toggle" class="slider"></label>
                    </div>
                    <span class="status"
                        >{consent ? "Consented" : "Opted Out"}</span
                    >
                </div>
            </div>

            <div class="field full-width">
                <label for="cdn-script" class="required"
                    >Change CDN Script</label
                >
                <textarea
                    id="cdn-script"
                    bind:value={cdnScript}
                    placeholder="No CDN Script Configured"
                ></textarea>
            </div>
        </div>
    {/if}
</div>

<style>
    .modal-container {
        position: fixed;
        bottom: 20px;
        left: 0;
        z-index: 1000;
        display: flex;
        align-items: flex-start;
        font-family: "Inter", sans-serif;
    }

    .toggle-btn {
        background-color: #0070d2; /* Salesforce Blue or similar */
        color: white;
        border: none;
        padding: 10px;
        border-radius: 0 8px 8px 0;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    }

    .modal-content {
        background-color: #f4f6f9;
        padding: 20px;
        border-radius: 0 0 8px 0; /* Rounded bottom-right */
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
        width: 400px;
        color: #333;
        border: 1px solid #ddd;
        border-left: none;
    }

    .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .field.full-width {
        width: 100%;
    }

    label {
        font-size: 0.9rem;
        font-weight: 500;
        color: #555;
    }

    .required::before {
        content: "* ";
        color: red;
    }

    select,
    textarea {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    textarea {
        resize: vertical;
        min-height: 60px;
    }

    /* Toggle Switch */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 20px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #2196f3;
    }

    input:checked + .slider:before {
        transform: translateX(20px);
    }

    .status {
        font-size: 0.8rem;
        color: #777;
        margin-top: 2px;
    }
</style>
