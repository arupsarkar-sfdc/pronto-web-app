<script>
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;
    export let mode = "login"; // 'login' or 'register'

    const dispatch = createEventDispatcher();

    let firstName = "";
    let lastName = "";
    let email = "";

    function close() {
        isOpen = false;
        dispatch("close");
    }

    function handleSubmit() {
        dispatch("submit", { mode, firstName, lastName, email });
        close();
    }
</script>

{#if isOpen}
    <div class="modal-backdrop" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <h2>{mode === "login" ? "Log In" : "Register"}</h2>

            <form on:submit|preventDefault={handleSubmit}>
                <div class="field">
                    <label for="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        bind:value={firstName}
                        required
                    />
                </div>

                <div class="field">
                    <label for="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        bind:value={lastName}
                        required
                    />
                </div>

                <div class="field">
                    <label for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                    />
                </div>

                <div class="actions">
                    <button type="button" class="cancel-btn" on:click={close}
                        >Cancel</button
                    >
                    <button type="submit" class="submit-btn"
                        >{mode === "login" ? "Log In" : "Register"}</button
                    >
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .modal-content {
        background-color: white;
        padding: 30px;
        border-radius: 12px;
        width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: "Inter", sans-serif;
    }

    h2 {
        margin-bottom: 20px;
        text-align: center;
        color: #333;
    }

    .field {
        margin-bottom: 15px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #555;
        font-size: 0.9rem;
    }

    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
        box-sizing: border-box; /* Important for padding */
    }

    input:focus {
        border-color: #0070d2;
        outline: none;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 25px;
    }

    button {
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        font-size: 0.95rem;
    }

    .cancel-btn {
        background-color: white;
        border: 1px solid #ddd;
        color: #555;
    }

    .submit-btn {
        background-color: #0070d2;
        color: white;
    }

    .submit-btn:hover {
        background-color: #005fb2;
    }
</style>
