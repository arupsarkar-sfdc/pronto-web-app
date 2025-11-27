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

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = getUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
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
                }],
                interaction: {
                    name: eventName,
                    ...payload,
                    sessionId: getSessionId(),
                    deviceId: getDeviceId(),
                    dateTime: new Date().toISOString(),
                    eventId: getUUID()
                }
            };

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
        eventType: "identity",
        category: "Profile",
        isAnonymous: false,
        userId: user.email,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };
    return sendEvent("identity", payload);
}

export function sendContactPointEmail(user) {
    const payload = {
        eventType: "contactPointEmail",
        category: "Profile",
        email: user.email,
        primaryFlag: true
    };
    return sendEvent("contactPointEmail", payload);
}

export function sendProductView(product) {
    const payload = {
        eventType: "catalog",
        category: "Engagement",
        type: "Product",
        id: product.id.toString(),
        interactionName: `View Product ${product.name}`,
        catalogObjectType: "Product",
        catalogObjectId: product.id.toString()
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
