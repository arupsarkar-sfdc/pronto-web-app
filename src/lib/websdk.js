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
    // 1. Prioritize the Salesforce SDK ID if available (Single Source of Truth)
    const sdkId = getSDKAnonymousId();
    if (sdkId) {
        // Sync to local storage for persistence if SDK fails later
        localStorage.setItem('deviceId', sdkId);
        return sdkId;
    }

    // 2. Fallback to Local Storage
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
        if (window.SalesforceInteractions) {

            // 1. Initialize Personalization Module (MUST be done before main init)
            // https://developer.salesforce.com/docs/marketing/einstein-personalization/guide/initialize-einstein-personalization-module.html
            // @ts-ignore
            if (window.SalesforceInteractions.Personalization && window.SalesforceInteractions.Personalization.Config) {
                console.log("[WebSDK] Initializing Einstein Personalization Module...");
                // @ts-ignore
                window.SalesforceInteractions.Personalization.Config.initialize({
                    personalizationExperienceConfigs: [], // Placeholder
                    customFlickerDefenseConfig: {} // Placeholder
                });
            } else {
                console.log("[WebSDK] Personalization Module not found (Mocking initialization log).");
            }

            // 2. Main SDK Init
            // @ts-ignore
            if (window.SalesforceInteractions.init) {
                // @ts-ignore
                window.SalesforceInteractions.setLoggingLevel('debug');
                const consentConfig = [{
                    provider: "Pronto",
                    purpose: "Tracking", // Updated from "Analytics"
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
                // Fallback if init is missing but object exists
                console.warn("[WebSDK] SalesforceInteractions.init not found.");
                resolve();
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
const MOCK_RECOMMENDATIONS_DATA = [
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
        recommender: "Healthy Choice"
    },
    {
        id: "rec3",
        name: "Berry Smoothie",
        image: "/images/berry_smoothie_1765223094679.png",
        price: 6.99,
        recommender: "Refreshers"
    }
];

const MOCK_SHOPS_DATA = [
    { id: "s1", name: "Joe's Pizza", rating: 4.8, distance: "0.5 mi" },
    { id: "s2", name: "Sushi World", rating: 4.6, distance: "1.2 mi" },
    { id: "s3", name: "Burger King", rating: 4.2, distance: "2.0 mi" }
];

/**
 * Simulates the Einstein Personalization Engine.
 * Returns a "Decision" object: { type: string, data: object }
 */
import { get } from "svelte/store";
import { authToken } from "./stores";

/**
 * Simulates the Einstein Personalization Engine Decisioning API.
 * Endpoint: POST /personalization/v1/decisions
 * Documentation: https://developer.salesforce.com/docs/marketing/einstein-personalization/guide/decisioning-api-request-personalization.html
 * @param {string} pointName - The personalization point name (e.g. "homepage_sidebar_recs")
 * @param {object} [context={}] - Additional context (anchor, etc.)
 */
let interactionCount = 0; // Simulate server-side learning state
export async function getPersonalization(pointName, context = {}) {
    // 1. Construct the Request Payload
    const deviceId = getDeviceId();
    const tokenData = get(authToken);

    // For debugging/demo: If we are asking for "shops", specifically force the fallback 
    // because we know we haven't configured that in Salesforce yet.
    if (pointName === "homepage_sidebar_shops") {
        console.log(`[WebSDK] ℹ️ Skipping API for ${pointName} (Mock Mode - Shops)`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    type: "ClosestShops",
                    data: {
                        title: "Closest Shops",
                        shops: MOCK_SHOPS_DATA
                    }
                });
            }, 500);
        });
    }

    // Track interactions for "Learning Phase" simulation
    if (pointName === "Pronto") {
        interactionCount++;
        console.log(`[WebSDK] Interaction Tracking: ${interactionCount}/5 for ${pointName}`);
    }

    const requestPayload = {
        personalizationPoints: [
            {
                name: pointName,
                id: "",
                decisionId: ""
            }
        ],
        individualId: deviceId,
        context: {
            ...context,
            individualId: deviceId
        }
    };

    // @ts-ignore
    const BASE_URL = import.meta.env.VITE_SALESFORCE_PROXY_URL || "https://mnrw0zbyh0yt0mldmmytqzrxg0.c360a.salesforce.com";
    const ENDPOINT = `${BASE_URL}/personalization/v1/decisions`;

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    if (tokenData && tokenData.accessToken) {
        headers["Authorization"] = `Bearer ${tokenData.accessToken}`;
    }

    console.log(`[WebSDK] 📡 Calling Decisioning API: POST ${ENDPOINT}`);
    console.log(`[WebSDK] 📦 Request Payload:`, JSON.stringify(requestPayload, null, 2));

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestPayload)
        });

        console.log(`[WebSDK] 📥 API Response Status: ${response.status}`);

        if (response.ok) {
            const json = await response.json();
            console.log(`[WebSDK] 📥 API Response Data:`, json);

            if (json.personalizations && json.personalizations.length > 0) {
                const firstDecision = json.personalizations[0];
                if (firstDecision.attributes) {
                    return {
                        type: "PromoBanner",
                        data: firstDecision.attributes
                    };
                }
            }
            console.warn("[WebSDK] Valid response but no actionable personalization found.");
        } else {
            console.warn(`[WebSDK] API Request failed. Status: ${response.status}.`);
        }
    } catch (error) {
        console.error(`[WebSDK] API Network Error:`, error);
    }

    // FALLBACK / SIMULATION:
    // If API returned nothing (or failed), AND we satisfy the demo learning threshold, return the Mock Pizza.
    if (pointName === "Pronto" && interactionCount >= 5) {
        console.log(`[WebSDK] ℹ️ API Empty/Failed, but Learning Threshold Met (${interactionCount}/5). Returning Mock Content.`);

        // Data derived from User's provided JSON
        const data = {
            Header: "Pizza",
            Subheader: "Artisan Pizza",
            BackgroundImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1381&auto=format&fit=crop",
            CallToActionText: "Best Artisan Pizza in town.",
            CallToActionUrl: "https://www.yelp.com/biz/cheezys-artisan-pizza-san-francisco"
        };

        const mockHtml = `
            <style>
                .hb-container {
                    position: relative;
                    width: 100%;
                    height: 320px;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
                    font-family: 'Inter', sans-serif;
                    color: white;
                    cursor: pointer;
                    transition: box-shadow 0.3s ease;
                }
                .hb-container:hover {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .hb-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url('${data.BackgroundImageUrl}');
                    background-size: cover;
                    background-position: center;
                    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .hb-container:hover .hb-bg {
                    transform: scale(1.1);
                }
                .hb-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.9) 100%);
                }
                .hb-content {
                    position: absolute;
                    bottom: 0; left: 0; width: 100%;
                    padding: 24px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transform: translateY(0);
                    transition: transform 0.3s ease;
                }
                .hb-container:hover .hb-content {
                    transform: translateY(-4px);
                }
                .hb-cta {
                    margin-top: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #ff4500;
                    color: white;
                    text-decoration: none;
                    padding: 12px 28px;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 14px;
                    width: fit-content;
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
                    transition: all 0.2s ease;
                }
                .hb-cta:hover {
                    background-color: #e63900;
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(255, 69, 0, 0.5);
                }
            </style>
            
            <div class="hb-container">
                <div class="hb-bg"></div>
                <div class="hb-overlay"></div>
                <div class="hb-content">
                    <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; opacity: 0.9;">
                        ${data.Subheader}
                    </span>
                    
                    <h2 style="font-size: 32px; font-weight: 800; margin: 4px 0 0 0; line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                        ${data.Header}
                    </h2>
                    
                    <a href="${data.CallToActionUrl}" class="hb-cta">
                        ${data.CallToActionText} &rarr;
                    </a>
                </div>
            </div>
        `;

        return {
            type: "HandlebarsContent",
            data: { html: mockHtml }
        };
    } else if (pointName === "Pronto") {
        console.log(`[WebSDK] ℹ️ API Empty and Threshold (${interactionCount}/5) not met. Showing Empty State.`);
    }

    return null;
}
