/* eslint-disable no-console */

const CDN_URL = "https://cdn.c360a.salesforce.com/beacon/c360a/c75fef21-9808-4a7d-839b-f730b3e68dc4/scripts/c360a.min.js";

export function injectWebSDK(url = CDN_URL) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
            console.log("WebSDK script already injected.");
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => {
            console.log("WebSDK script loaded successfully.");

            // Poll for SalesforceInteractions global
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds
            const interval = setInterval(() => {
                attempts++;
                // @ts-ignore
                if (window.SalesforceInteractions) {
                    clearInterval(interval);
                    console.log(`[WebSDK] SalesforceInteractions global found after ${attempts} attempts.`);
                    resolve(true);
                } else {
                    if (attempts % 10 === 0) console.log(`[WebSDK] Waiting for SalesforceInteractions... (${attempts}/${maxAttempts})`);
                    if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        console.warn("[WebSDK] SalesforceInteractions global NOT found after waiting.");
                        resolve(false);
                    }
                }
            }, 100);
        };
        script.onerror = (error) => {
            console.error("Failed to load WebSDK script:", error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = getUUID();
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

export function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = getUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

export function getSDKAnonymousId() {
    // @ts-ignore
    if (window.SalesforceInteractions && window.SalesforceInteractions.getAnonymousId) {
        // @ts-ignore
        return window.SalesforceInteractions.getAnonymousId();
    }
    return null;
}

function sendEvent(eventName, payload) {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if (window.SalesforceInteractions) {
            const fullPayload = {
                consents: [{
                    provider: "Pronto",
                    purpose: "Tracking", // Updated from "Analytics"
                    status: "Opt In" // Force Opt In for now to verify connectivity, or read from config if possible
                }]
            };

            // Check if payload has a 'user' property (for Profile events)
            if (payload.user) {
                fullPayload.user = payload.user;
            } else {
                // Default to interaction object (for Engagement events)
                fullPayload.interaction = {
                    name: eventName,
                    ...payload,
                    sessionId: getSessionId(),
                    deviceId: getDeviceId(),
                    dateTime: new Date().toISOString(),
                    eventId: getUUID()
                };
            }

            console.log(`[WebSDK] Sending ${eventName} event:`, fullPayload);

            try {
                // In a real implementation, we would call the SDK method here.
                // Assuming sendEvent might return a promise or we treat it as synchronous success
                // @ts-ignore
                const result = window.SalesforceInteractions.sendEvent(fullPayload);

                // If the SDK returns a promise, wait for it
                if (result && typeof result.then === 'function') {
                    result.then((response) => {
                        console.log(`[WebSDK] ${eventName} event sent successfully. Response:`, response);
                        resolve(response || fullPayload);
                    }).catch(err => {
                        console.error(`[WebSDK] Error sending ${eventName} event:`, err);
                        reject(err);
                    });
                } else {
                    // Otherwise assume synchronous success
                    console.log(`[WebSDK] ${eventName} event sent (synchronous).`);
                    resolve(fullPayload);
                }
            } catch (error) {
                console.error(`[WebSDK] Exception sending ${eventName} event:`, error);
                reject(error);
            }
        } else {
            console.warn("[WebSDK] SalesforceInteractions not initialized.");
            reject(new Error("SalesforceInteractions not initialized"));
        }
    });
}

export function initWebSDK(config) {
    console.log("Initializing WebSDK with config:", config);
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if (window.SalesforceInteractions && window.SalesforceInteractions.init) {
            // @ts-ignore
            window.SalesforceInteractions.setLoggingLevel('debug');
            const consentConfig = [{
                provider: "Pronto",
                purpose: "Tracking",
                status: config.consent ? "Opt In" : "Opt Out"
            }];

            // @ts-ignore
            const initResult = window.SalesforceInteractions.init({
                cookieDomain: window.location.hostname,
                consents: consentConfig
            });

            const handleInitSuccess = () => {
                console.log("[WebSDK] Init completed.");
                // Explicitly update consents to ensure they are set synchronously
                // because init() processes them asynchronously
                // @ts-ignore
                if (window.SalesforceInteractions.updateConsents) {
                    console.log("[WebSDK] Forcing consent update:", consentConfig);
                    // @ts-ignore
                    window.SalesforceInteractions.updateConsents(consentConfig);
                }

                // @ts-ignore
                console.log("[WebSDK] Current Consents after force update:", window.SalesforceInteractions.getConsents());
                resolve();
            };

            if (initResult && typeof initResult.then === 'function') {
                initResult.then(handleInitSuccess).catch(err => {
                    console.error("[WebSDK] Init failed:", err);
                    reject(err);
                });
            } else {
                handleInitSuccess();
            }
        } else {
            console.warn("[WebSDK] SalesforceInteractions not found during init.");
            resolve(); // Resolve anyway to not block app
        }
    });
}

export function sendConsent(status) {
    const payload = {
        eventType: "consentLog",
        category: "Engagement",
        status: status, // "OptIn" or "OptOut"
        purpose: "Analytics",
        provider: "Pronto"
    };
    return sendEvent("consentLog", payload);
}

export function sendIdentity(user) {
    const payload = {
        user: {
            attributes: {
                eventType: "identity",
                isAnonymous: 0, // Using 0 as requested, though boolean false is often standard
                email: user.email,
                userId: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        }
    };
    return sendEvent("identity", payload);
}



export function sendProductView(product) {
    const payload = {
        eventType: "catalog",
        category: "Engagement",
        type: "Product",
        id: product.name, // Updated to match catalogObjectId as requested
        interactionName: `View Product ${product.name}`,
        catalogObjectType: "Product",
        catalogObjectId: product.name
    };
    return sendEvent("catalog", payload);
}

export function sendCategoryView(categoryName) {
    const payload = {
        eventType: "catalog",
        category: "Engagement",
        type: "Category",
        id: categoryName,
        interactionName: `View Category ${categoryName}`,
        catalogObjectType: "Category",
        catalogObjectId: categoryName
    };
    return sendEvent("catalog", payload);
}

export function sendAddToCart(product) {
    const payload = {
        lineItem: {
            catalogObjectType: "Product",
            catalogObjectId: product.name, // Using name as requested
            quantity: 1,
            price: product.price,
            currency: "USD",
            attributes: product.attributes || {} // Include attributes if present
        }
    };
    // @ts-ignore
    const interactionName = window.SalesforceInteractions.CartInteractionName.AddToCart;

    console.log("Interaction name:", interactionName);
    console.log("Payload:", payload);
    return sendEvent(interactionName, payload);
}

/**
 * Mock Data for Personalization
 */
const MOCK_RECOMMENDATIONS = [
    {
        id: "rec1",
        name: "Spicy Tacos",
        image: "/images/spicy_tacos_1765223067041.png",
        price: 9.99,
        recommender: "Trending Now"
    },
    {
        id: "rec2",
        name: "Avocado Toast",
        image: "/images/avocado_toast_1765223081385.png",
        price: 12.50,
        recommender: "Trending Now"
    },
    {
        id: "rec3",
        name: "Berry Smoothie",
        image: "/images/berry_smoothie_1765223094679.png",
        price: 6.99,
        recommender: "Trending Now"
    }
];

const MOCK_SHOPS = [
    { id: "shop1", name: "Joe's Pizza", distance: "0.5 mi", rating: 4.8 },
    { id: "shop2", name: "Sushi World", distance: "1.2 mi", rating: 4.5 },
    { id: "shop3", name: "Burger King", distance: "2.0 mi", rating: 4.2 },
];

/**
 * Fetch Personalization Data
 * @param {string} pointName - The personalization point to fetch (e.g., "pronto_home_recs")
 * @param {object} [payload={}] - Optional context
 * @returns {Promise<any>}
 */
export function getPersonalization(pointName, payload = {}) {
    return new Promise((resolve) => {
        console.log(`[WebSDK] Requesting personalization for point: ${pointName}`, payload);

        // 1. Try Real SDK
        // @ts-ignore
        if (window.SalesforceInteractions && window.SalesforceInteractions.getPersonalization) {
            // This is a hypothetical simplified call.
            // The actual SDK usually uses .sitemap or campaign callbacks.
            // However, for this modular "fetch" approach, we simulate a direct request if the SDK supported it,
            // or we just return the mock because we can't easily configure the real campaign in this environment.
            console.log("[WebSDK] Simulated SDK call. Returning Mock Data for demo.");
        }

        // 2. Return Mock Data
        setTimeout(() => {
            if (pointName === "closest_shops") {
                resolve(MOCK_SHOPS);
            } else {
                resolve(MOCK_RECOMMENDATIONS);
            }
        }, 800); // Simulate network latency
    });
}
