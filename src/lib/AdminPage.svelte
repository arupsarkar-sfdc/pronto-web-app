<script>
    import {
        cart,
        user,
        authToken,
        fetchedPayloadData,
        tokenEndpoint,
        sourceRecordId,
    } from "./stores";
    import { fade, fly } from "svelte/transition";
    import { fetchToken, fetchDataGraph } from "./api";
    import { TokenService } from "./tokenService";
    import { getSDKAnonymousId } from "./websdk";
    import { onMount } from "svelte";
    import RecursiveValue from "./RecursiveValue.svelte";
    import AnalyticsDashboard from "./AnalyticsDashboard.svelte";

    // Subscribe to stores to display state (keeping this for potential future use or debugging)
    let cartItems = [];
    let currentUser = null;

    cart.subscribe((value) => {
        cartItems = value;
    });

    user.subscribe((value) => {
        currentUser = value;
    });

    // Local state for loading/error (transient)
    let isLoading = false;
    let isPayloadLoading = false;
    let error = null;
    let payloadError = null;
    let viewMode = "structured"; // 'json' | 'structured' | 'analytics'
    let selectedSectionId = "profile"; // Default section

    // OTP / Authentication State
    let isAuthenticated = false;
    let loginStep = "request"; // 'request' | 'verify'
    let loginUserId = "";
    let loginOtp = "";
    let loginError = null;
    let isLoginLoading = false;

    async function requestOtp() {
        if (!loginUserId) {
            loginError = "Please enter your User ID/Email.";
            return;
        }
        isLoginLoading = true;
        loginError = null;
        try {
            const res = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: loginUserId }),
            });
            const data = await res.json();
            if (res.ok) {
                loginStep = "verify";
            } else {
                loginError = data.error || "Failed to send OTP.";
            }
        } catch (e) {
            loginError = "Network error. Please try again.";
            console.error(e);
        } finally {
            isLoginLoading = false;
        }
    }

    async function verifyOtp() {
        if (!loginOtp) {
            loginError = "Please enter the OTP.";
            return;
        }
        isLoginLoading = true;
        loginError = null;
        try {
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: loginUserId, otp: loginOtp }),
            });
            const data = await res.json();
            if (res.ok) {
                isAuthenticated = true;
            } else {
                loginError = data.error || "Invalid OTP.";
            }
        } catch (e) {
            loginError = "Network error. Please try again.";
            console.error(e);
        } finally {
            isLoginLoading = false;
        }
    }

    async function handleGetToken() {
        isLoading = true;
        error = null;
        try {
            console.log("Fetching token from:", $tokenEndpoint);
            const data = await fetchToken($tokenEndpoint);
            console.log("Token response:", data);

            // Process and store token
            const processedToken = TokenService.processTokenResponse(data);
            authToken.set(processedToken);
        } catch (err) {
            error = err.message;
            console.error("Failed to fetch token:", err);
        } finally {
            isLoading = false;
        }
    }

    async function handleFetchPayload() {
        if (!$authToken || !$authToken.accessToken) {
            payloadError = "Please get a token first.";
            return;
        }

        isPayloadLoading = true;
        payloadError = null;
        fetchedPayloadData.set(null);

        try {
            console.log("Fetching data graph for:", $sourceRecordId);
            const data = await fetchDataGraph(
                $authToken.accessToken,
                $sourceRecordId,
            );
            console.log("Data graph response:", data);

            // Parse nested json_blob__c if present
            if (
                data &&
                data.data &&
                data.data.length > 0 &&
                data.data[0].json_blob__c
            ) {
                try {
                    const parsedBlob = JSON.parse(data.data[0].json_blob__c);
                    fetchedPayloadData.set(parsedBlob);
                } catch (e) {
                    console.warn("Failed to parse json_blob__c:", e);
                    fetchedPayloadData.set(data); // Fallback to original data
                }
            } else {
                fetchedPayloadData.set(data);
            }
        } catch (err) {
            payloadError = err.message;
            console.error("Failed to fetch data graph:", err);
        } finally {
            isPayloadLoading = false;
        }
    }

    // Helper to format keys for display
    function formatKey(key) {
        return key
            .replace(/ssot__/g, "")
            .replace(/__dlm/g, "")
            .replace(/__c/g, "")
            .replace(/([A-Z])/g, " $1")
            .trim();
    }

    // Helper to format values
    function formatValue(value) {
        if (
            typeof value === "string" &&
            !isNaN(Date.parse(value)) &&
            value.length > 10
        ) {
            return new Date(value).toLocaleString();
        }
        return value;
    }

    // Extract sections from the payload
    function extractSections(data) {
        if (!data) return [];

        const sections = [];
        const arraysMap = {}; // Map to store arrays by key

        // 1. Profile / Individual (Root fields + Individual DLM)
        const profileData = {};
        Object.keys(data).forEach((key) => {
            if (typeof data[key] !== "object") {
                profileData[key] = data[key];
            }
        });

        // Look for nested Individual data
        let individualArray = data.ssot__Individual__dlm || [];
        // Also check inside UnifiedLink if present
        if (data.UnifiedLinkssotIndividualI1__dlm) {
            data.UnifiedLinkssotIndividualI1__dlm.forEach((link) => {
                if (link.ssot__Individual__dlm) {
                    individualArray = [
                        ...individualArray,
                        ...link.ssot__Individual__dlm,
                    ];
                }
            });
        }

        if (Object.keys(profileData).length > 0 || individualArray.length > 0) {
            sections.push({
                id: "profile",
                title: "Unified Profile",
                icon: "user",
                data: profileData,
                type: "key-value",
            });
        }

        // 2. Recursive extraction of ALL arrays
        const traverse = (obj) => {
            if (!obj || typeof obj !== "object") return;

            Object.keys(obj).forEach((key) => {
                if (Array.isArray(obj[key])) {
                    // It's an array, add to map
                    if (!arraysMap[key]) {
                        arraysMap[key] = [];
                    }
                    arraysMap[key] = [...arraysMap[key], ...obj[key]];

                    // Recurse into array items
                    obj[key].forEach((item) => traverse(item));
                } else if (typeof obj[key] === "object") {
                    traverse(obj[key]);
                }
            });
        };

        traverse(data);

        // Convert map to sections
        Object.keys(arraysMap).forEach((key) => {
            // Skip Individual DLM as it's handled in profile (mostly)
            // But if we want comprehensive, maybe include it?
            // Let's exclude individual dlm from the list if it was merged,
            // but the user asked for "each and every key value pair".
            // So let's include everything found.

            let title = formatKey(key);
            let icon = "list";
            let id = key;

            if (key.includes("ShoppingCartEngagement")) {
                title = "Shopping Cart";
                icon = "cart";
                id = "cart";
            } else if (key.includes("ProductBrowseEngagement")) {
                title = "Product Browse History";
                icon = "eye";
                id = "browse";
            } else if (key.includes("ContactPointEmail")) {
                title = "Contact Info";
                icon = "mail";
                id = "email";
            }

            // Sort data by ssot__CreatedDate__c DESC
            const sortedData = [...arraysMap[key]].sort((a, b) => {
                const dateA = a.ssot__CreatedDate__c
                    ? new Date(a.ssot__CreatedDate__c).getTime()
                    : 0;
                const dateB = b.ssot__CreatedDate__c
                    ? new Date(b.ssot__CreatedDate__c).getTime()
                    : 0;
                return dateB - dateA;
            });

            sections.push({
                id: key, // Use original key as ID to ensure uniqueness
                title: title,
                icon: icon,
                data: sortedData,
                type: "list",
            });
        });

        // If no sections found (unlikely), fallback
        if (sections.length === 0 && !profileData) {
            sections.push({
                id: "raw",
                title: "Raw Data",
                icon: "code",
                data: data,
                type: "json",
            });
        }

        // Sort sections: Profile first, then others
        sections.sort((a, b) => {
            if (a.id === "profile") return -1;
            if (b.id === "profile") return 1;
            return a.title.localeCompare(b.title);
        });

        return sections;
    }

    // Reactive check for sections
    $: dataSections = extractSections($fetchedPayloadData);

    // Update selectedSectionId if it becomes invalid
    $: if (
        dataSections.length > 0 &&
        !dataSections.find((s) => s.id === selectedSectionId)
    ) {
        selectedSectionId = dataSections[0].id;
    }

    onMount(() => {
        // Poll for SDK Anonymous ID only if not already set
        const interval = setInterval(() => {
            const anonymousId = getSDKAnonymousId();
            if (anonymousId) {
                // Only update if store is empty to avoid overwriting user input or persisted state
                if (!$sourceRecordId) {
                    sourceRecordId.set(anonymousId);
                }
                clearInterval(interval);
            }
        }, 500);

        // Clear interval after 10 seconds to stop polling if SDK fails
        setTimeout(() => clearInterval(interval), 10000);
    });
</script>

<div class="admin-page" in:fade={{ duration: 300 }}>
    {#if !isAuthenticated}
        <div class="login-overlay" in:fade>
            <div class="login-card">
                <div class="login-header">
                    <div class="login-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                            ></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"
                            ></path></svg
                        >
                    </div>
                    <h2>Admin Access</h2>
                    <p>Please authenticate to continue.</p>
                    <div class="info-badge">
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
                            ><circle cx="12" cy="12" r="10"></circle><line
                                x1="12"
                                y1="16"
                                x2="12"
                                y2="12"
                            ></line><line x1="12" y1="8" x2="12.01" y2="8"
                            ></line></svg
                        >
                        <span
                            >Please request access to <strong
                                >#pronto-sbx-otp</strong
                            > channel in Salesforce Sandbox slack workspace</span
                        >
                    </div>
                </div>

                <div class="login-body">
                    {#if loginStep === "request"}
                        <div class="input-group">
                            <label for="userId">User ID / Email</label>
                            <input
                                type="text"
                                id="userId"
                                bind:value={loginUserId}
                                placeholder="e.g. admin@pronto.com"
                                on:keydown={(e) =>
                                    e.key === "Enter" && requestOtp()}
                            />
                        </div>
                        <button
                            class="login-btn"
                            on:click={requestOtp}
                            disabled={isLoginLoading}
                        >
                            {isLoginLoading ? "Sending..." : "Send OTP"}
                        </button>
                    {:else}
                        <div class="input-group">
                            <label for="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                bind:value={loginOtp}
                                placeholder="6-digit code"
                                maxlength="6"
                                on:keydown={(e) =>
                                    e.key === "Enter" && verifyOtp()}
                            />
                            <div class="otp-hint">Sent to Slack channel</div>
                        </div>
                        <button
                            class="login-btn"
                            on:click={verifyOtp}
                            disabled={isLoginLoading}
                        >
                            {isLoginLoading ? "Verifying..." : "Verify Code"}
                        </button>
                        <button
                            class="link-btn"
                            on:click={() => (loginStep = "request")}
                            >Back</button
                        >
                    {/if}

                    {#if loginError}
                        <div class="login-error" in:fade>{loginError}</div>
                    {/if}
                </div>
            </div>
        </div>
    {:else}
        <div class="admin-container">
            <!-- Top Section: Configuration (Token & Device) -->
            <div
                class="token-section"
                in:fly={{ y: 20, duration: 400, delay: 100 }}
            >
                <div class="config-row">
                    <div class="input-wrapper">
                        <label class="input-label">Token Endpoint</label>
                        <div class="input-group">
                            <input
                                type="text"
                                bind:value={$tokenEndpoint}
                                class="token-input"
                                placeholder="Enter Token Endpoint"
                            />
                            <button
                                class="get-token-btn"
                                on:click={handleGetToken}
                                disabled={isLoading}
                            >
                                <span
                                    >{isLoading
                                        ? "Fetching..."
                                        : "Get Token"}</span
                                >
                                {#if !isLoading}
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
                                        ><path d="M5 12h14M12 5l7 7-7 7" /></svg
                                    >
                                {/if}
                            </button>
                        </div>
                    </div>

                    <div class="input-wrapper">
                        <label class="input-label">Device ID</label>
                        <div class="input-group">
                            <input
                                type="text"
                                bind:value={$sourceRecordId}
                                class="token-input"
                                placeholder="Enter Device ID"
                            />
                        </div>
                    </div>
                </div>

                <!-- Token Details (Compact) -->
                {#if $authToken}
                    <div class="token-details-compact" in:fade>
                        <div class="detail-item">
                            <span class="detail-label">Last 8:</span>
                            <span class="detail-value"
                                >{$authToken
                                    ? $authToken.last8Digits
                                    : "..."}</span
                            >
                        </div>
                        <div class="detail-divider"></div>
                        <div class="detail-item">
                            <span class="detail-label">Expires:</span>
                            <span class="detail-value"
                                >{$authToken
                                    ? $authToken.formattedExpiration
                                    : "..."}</span
                            >
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Bottom Section: Data Graph Payload -->
            {#if $authToken}
                <div
                    class="payload-section"
                    in:fly={{ y: 20, duration: 400, delay: 200 }}
                >
                    <div class="payload-header">
                        <div class="header-left">
                            <h3>Payload</h3>
                            {#if $fetchedPayloadData}
                                <div class="toggle-container">
                                    <button
                                        class="toggle-btn {viewMode === 'json'
                                            ? 'active'
                                            : ''}"
                                        on:click={() => (viewMode = "json")}
                                        >JSON</button
                                    >
                                    <button
                                        class="toggle-btn {viewMode ===
                                        'structured'
                                            ? 'active'
                                            : ''}"
                                        on:click={() =>
                                            (viewMode = "structured")}
                                        >Structured</button
                                    >
                                    <button
                                        class="toggle-btn {viewMode ===
                                        'analytics'
                                            ? 'active'
                                            : ''}"
                                        on:click={() =>
                                            (viewMode = "analytics")}
                                        >Analytics</button
                                    >
                                </div>
                            {/if}
                        </div>

                        <div class="header-right">
                            {#if $fetchedPayloadData && viewMode === "structured"}
                                <select
                                    bind:value={selectedSectionId}
                                    class="section-select"
                                >
                                    {#each extractSections($fetchedPayloadData) as section}
                                        <option value={section.id}
                                            >{section.title}</option
                                        >
                                    {/each}
                                </select>
                            {/if}
                            <button
                                class="fetch-payload-btn"
                                on:click={handleFetchPayload}
                                disabled={isPayloadLoading}
                            >
                                <span
                                    >{isPayloadLoading
                                        ? "Fetching..."
                                        : "Fetch"}</span
                                >
                                {#if !isPayloadLoading}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        ><path
                                            d="M21 12V7H5a2 2 0 0 1 0-4h14v4"
                                        /><path
                                            d="M3 5v14a2 2 0 0 0 2 2h16v-5"
                                        /><path
                                            d="M18 12a2 2 0 0 0 0 4h4v-4Z"
                                        /></svg
                                    >
                                {/if}
                            </button>
                        </div>
                    </div>
                    <div class="payload-content">
                        {#if isPayloadLoading}
                            <div class="placeholder-text">
                                Loading Data Graph...
                            </div>
                        {:else if payloadError}
                            <div class="error-text">Error: {payloadError}</div>
                        {:else if $fetchedPayloadData}
                            {#if viewMode === "json"}
                                <pre>{JSON.stringify(
                                        $fetchedPayloadData,
                                        null,
                                        2,
                                    )}</pre>
                            {:else if viewMode === "analytics"}
                                <AnalyticsDashboard
                                    data={$fetchedPayloadData}
                                />
                            {:else}
                                <div class="data-grid single-col">
                                    {#each extractSections($fetchedPayloadData) as section}
                                        {#if section.id === selectedSectionId}
                                            <div
                                                class="data-box"
                                                in:fade={{ duration: 200 }}
                                            >
                                                <div class="box-header">
                                                    <div class="box-icon">
                                                        {#if section.icon === "user"}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                ><path
                                                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                                                                /><circle
                                                                    cx="12"
                                                                    cy="7"
                                                                    r="4"
                                                                /></svg
                                                            >
                                                        {:else if section.icon === "cart"}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                ><circle
                                                                    cx="9"
                                                                    cy="21"
                                                                    r="1"
                                                                /><circle
                                                                    cx="20"
                                                                    cy="21"
                                                                    r="1"
                                                                /><path
                                                                    d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                                                                /></svg
                                                            >
                                                        {:else if section.icon === "eye"}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                ><path
                                                                    d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                                                                /><circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="3"
                                                                /></svg
                                                            >
                                                        {:else if section.icon === "mail"}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                ><rect
                                                                    width="20"
                                                                    height="16"
                                                                    x="2"
                                                                    y="4"
                                                                    rx="2"
                                                                /><path
                                                                    d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                                                                /></svg
                                                            >
                                                        {:else}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                ><polyline
                                                                    points="16 18 22 12 16 6"
                                                                /><polyline
                                                                    points="8 6 2 12 8 18"
                                                                /></svg
                                                            >
                                                        {/if}
                                                    </div>
                                                    <h4>{section.title}</h4>
                                                </div>
                                                <div class="box-body">
                                                    {#if section.type === "key-value"}
                                                        <div class="kv-list">
                                                            {#each Object.entries(section.data) as [key, value]}
                                                                <div
                                                                    class="kv-item"
                                                                >
                                                                    <span
                                                                        class="kv-key"
                                                                        >{formatKey(
                                                                            key,
                                                                        )}</span
                                                                    >
                                                                    <div
                                                                        class="kv-value-wrapper"
                                                                    >
                                                                        <RecursiveValue
                                                                            {value}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    {:else if section.type === "list"}
                                                        <div class="item-list">
                                                            {#each section.data as item}
                                                                <div
                                                                    class="list-item"
                                                                >
                                                                    {#each Object.entries(item) as [key, value]}
                                                                        <div
                                                                            class="kv-item compact"
                                                                        >
                                                                            <span
                                                                                class="kv-key"
                                                                                >{formatKey(
                                                                                    key,
                                                                                )}</span
                                                                            >
                                                                            <div
                                                                                class="kv-value-wrapper"
                                                                            >
                                                                                <RecursiveValue
                                                                                    {value}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    {/each}
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    {:else}
                                                        <pre>{JSON.stringify(
                                                                section.data,
                                                                null,
                                                                2,
                                                            )}</pre>
                                                    {/if}
                                                </div>
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            {/if}
                        {:else}
                            <div class="placeholder-text">
                                Click Fetch to get Data Graph.
                            </div>
                        {/if}
                        <!--
            {#if currentUser}
              <pre>{JSON.stringify(currentUser, null, 2)}</pre>
            {/if}
            -->
                    </div>
                </div>
            {/if}

            <div class="actions" in:fly={{ y: 20, duration: 400, delay: 300 }}>
                <button
                    class="back-btn"
                    on:click={() => (window.location.hash = "")}
                >
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
                        ><path d="M19 12H5M12 19l-7-7 7-7" /></svg
                    >
                    Back to App
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Login Overlay Styles */
    .login-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(248, 250, 252, 0.95);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .login-card {
        background: white;
        padding: 2.5rem;
        border-radius: 24px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .login-header {
        text-align: center;
    }

    .login-icon {
        width: 48px;
        height: 48px;
        background: #f1f5f9;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        color: #0f172a;
    }

    .login-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #0f172a;
    }

    .login-header p {
        margin: 0.5rem 0 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .login-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .login-body .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .login-body label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #475569;
    }

    .login-body input {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1rem;
        outline: none;
        transition: all 0.2s;
    }

    .login-body input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .login-btn {
        background: #0f172a;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .login-btn:hover {
        background: #1e293b;
        transform: translateY(-1px);
    }

    .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .link-btn {
        background: none;
        border: none;
        color: #64748b;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: underline;
    }

    .login-error {
        color: #ef4444;
        font-size: 0.9rem;
        text-align: center;
        background: #fef2f2;
        padding: 0.75rem;
        border-radius: 8px;
    }

    .otp-hint {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    :global(body) {
        margin: 0;
        padding: 0;
    }

    .admin-page {
        min-height: 100vh;
        background-color: #f8fafc; /* Slate 50 */
        padding: 2rem;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    .admin-container {
        width: 100%;
        max-width: 900px;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
    }

    /* Token Section */
    .token-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        background: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.05),
            0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .config-row {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
    }

    .input-wrapper {
        flex: 1;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .input-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
        margin-left: 0.5rem;
    }

    .input-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        position: relative;
    }

    .token-input {
        flex: 1;
        background-color: #f1f5f9; /* Slate 100 */
        border: 2px solid transparent;
        border-radius: 9999px; /* Pill shape */
        padding: 10px 24px;
        font-size: 0.95rem;
        color: #475569;
        font-weight: 500;
        outline: none;
        transition: all 0.2s ease;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
    }

    .token-input:focus {
        background-color: white;
        border-color: #e2e8f0;
        box-shadow: 0 0 0 4px rgba(226, 232, 240, 0.5);
    }

    .get-token-btn {
        background: linear-gradient(
            135deg,
            #34d399 0%,
            #10b981 100%
        ); /* Emerald Gradient */
        border: none;
        border-radius: 9999px;
        padding: 10px 24px;
        font-size: 0.9rem;
        font-weight: 600;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }

    .get-token-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }

    .get-token-btn:active {
        transform: translateY(1px);
    }

    /* Compact Token Details */
    .token-details-compact {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        background-color: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        align-self: flex-start;
    }

    .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .detail-label {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
    }

    .detail-value {
        font-size: 0.9rem;
        color: #334155;
        font-weight: 700;
        font-family: monospace;
    }

    .detail-divider {
        width: 1px;
        height: 16px;
        background-color: #cbd5e1;
    }

    /* Payload Section */
    .payload-section {
        background-color: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.05),
            0 8px 10px -6px rgba(0, 0, 0, 0.01);
        display: flex;
        flex-direction: column;
        min-height: 350px;
        border: 1px solid #f1f5f9;
    }

    .payload-header {
        background-color: #f8fafc;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-left,
    .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .toggle-container {
        display: flex;
        background: #e2e8f0;
        padding: 2px;
        border-radius: 6px;
    }

    .toggle-btn {
        background: transparent;
        border: none;
        padding: 4px 12px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .toggle-btn.active {
        background: white;
        color: #3b82f6;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .section-select {
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        font-size: 0.85rem;
        color: #334155;
        outline: none;
        background-color: white;
    }

    .payload-header h3 {
        margin: 0;
        font-size: 1rem;
        color: #334155;
        font-weight: 600;
    }

    .fetch-payload-btn {
        background-color: #3b82f6; /* Blue 500 */
        color: white;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.2s;
    }

    .fetch-payload-btn:hover {
        background-color: #2563eb; /* Blue 600 */
    }

    .payload-content {
        padding: 1.5rem;
        flex: 1;
        background-color: #f8fafc; /* Light gray background for the grid area */
        overflow-x: hidden;
        overflow-y: auto;
        max-height: 600px;
    }

    .data-grid {
        display: grid;
        grid-template-columns: 1fr; /* Default to single column for selective rendering */
        gap: 1.5rem;
        height: 100%;
    }

    .data-box {
        background: white;
        border-radius: 16px;
        box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border: 1px solid #e2e8f0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%; /* Take full height */
    }

    .box-header {
        padding: 1rem;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .box-icon {
        color: #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .box-header h4 {
        margin: 0;
        font-size: 0.95rem;
        color: #334155;
        font-weight: 600;
    }

    .box-body {
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
    }

    /* Scrollbar for box body */
    .box-body::-webkit-scrollbar {
        width: 6px;
    }
    .box-body::-webkit-scrollbar-track {
        background: transparent;
    }
    .box-body::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .kv-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .item-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .list-item {
        padding-bottom: 1rem;
        border-bottom: 1px solid #f1f5f9;
    }

    .list-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .kv-item {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 1rem;
        font-size: 0.9rem;
    }

    .kv-item.compact {
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
    }

    .kv-key {
        color: #64748b;
        font-weight: 500;
        flex-shrink: 0;
    }

    .kv-value-wrapper {
        text-align: right;
        flex: 1;
        display: flex;
        justify-content: flex-end;
    }

    .placeholder-text {
        color: #94a3b8;
        font-style: italic;
        text-align: center;
        margin-top: 3rem;
        font-size: 0.9rem;
    }

    .error-text {
        color: #ef4444;
        text-align: center;
        margin-top: 3rem;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .success-text {
        color: #10b981; /* Emerald 500 */
        text-align: center;
        margin-top: 3rem;
        font-weight: 600;
        font-size: 1rem;
    }

    .actions {
        text-align: center;
        margin-top: 1rem;
    }

    .back-btn {
        background: white;
        border: 1px solid #e2e8f0;
        color: #64748b;
        padding: 8px 16px;
        border-radius: 9999px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.85rem;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .back-btn:hover {
        background: #f8fafc;
        color: #334155;
        border-color: #cbd5e1;
        transform: translateY(-1px);
    }

    .info-badge {
        background-color: #eff6ff; /* Blue 50 */
        border: 1px solid #bfdbfe; /* Blue 200 */
        color: #1e40af; /* Blue 800 */
        padding: 0.75rem;
        border-radius: 8px;
        margin-top: 1rem;
        font-size: 0.85rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        text-align: left;
        line-height: 1.5;
    }

    .info-badge svg {
        flex-shrink: 0;
        margin-top: 2px;
    }

    .info-badge strong {
        font-weight: 600;
    }
</style>
