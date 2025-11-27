<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    // Header logic if needed
</script>

<header>
    <div class="logo">Pronto</div>
    <nav>
        <a href="#" class="active">Home</a>
        <a href="#">Products <span>⌄</span></a>
        <a href="#">Cart <span>⌄</span></a>
        <a href="#">Orders</a>
    </nav>
    <div class="auth-links">
        <a href="#" on:click|preventDefault={() => dispatch("login")}>Log In</a>
        <a href="#" on:click|preventDefault={() => dispatch("register")}
            >Register</a
        >
    </div>
</header>

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 30px;
        background-color: white;
        border-bottom: 1px solid #eee;
        font-family: "Inter", sans-serif;
    }

    .logo {
        font-weight: 700;
        font-size: 1.2rem;
        color: #333;
    }

    nav {
        display: flex;
        gap: 20px;
    }

    nav a {
        text-decoration: none;
        color: #555;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    nav a.active {
        color: #0070d2;
        background-color: #f0f8ff;
        padding: 5px 10px;
        border-radius: 4px;
    }

    nav a span {
        font-size: 0.8rem;
    }

    .auth-links {
        display: flex;
        gap: 20px;
    }

    .auth-links a {
        text-decoration: none;
        color: #555;
        font-size: 0.9rem;
    }
</style>
