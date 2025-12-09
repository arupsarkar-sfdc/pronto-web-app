<script>
    export let Header;
    export let Subheader;
    export let BackgroundImageUrl;
    export let CallToActionText;
    export let CallToActionUrl;

    import { fade } from "svelte/transition";
</script>

<div class="promo-card" in:fade>
    <div class="image-container">
        <img src={BackgroundImageUrl} alt={Header} class="bg-image" />
        <div class="overlay"></div>
    </div>

    <div class="content">
        <div class="text-group">
            <h3 class="title">{Header}</h3>
            <p class="subtitle">{Subheader}</p>
        </div>

        <a href={CallToActionUrl} target="_blank" class="cta-button">
            {CallToActionText}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg
            >
        </a>
    </div>
</div>

<style>
    .promo-card {
        position: relative;
        border-radius: var(--radius-lg, 24px);
        overflow: hidden;
        background: var(--bg-color, white);
        box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
        min-height: 320px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }

    .promo-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
    }

    .image-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    .bg-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }

    .promo-card:hover .bg-image {
        transform: scale(1.05);
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.2) 40%,
            rgba(0, 0, 0, 0.8) 100%
        );
    }

    .content {
        position: relative;
        z-index: 1;
        padding: 1.5rem;
        color: white;
        width: 100%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
        box-sizing: border-box;
    }

    .text-group {
        margin-bottom: 1.25rem;
    }

    .title {
        font-size: 1.75rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
        line-height: 1.1;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        font-family: "Outfit", "Inter", sans-serif; /* Use display font if available */
    }

    .subtitle {
        font-size: 1rem;
        margin: 0;
        opacity: 0.9;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .cta-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: var(--primary-color, #ff4500);
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-pill, 50px);
        font-weight: 600;
        text-decoration: none;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        backdrop-filter: blur(4px);
    }

    .cta-button:hover {
        background-color: white;
        color: var(--primary-color, #ff4500);
        transform: translateY(-2px);
    }

    .cta-button svg {
        transition: transform 0.2s ease;
    }

    .cta-button:hover svg {
        transform: translateX(4px);
    }
</style>
