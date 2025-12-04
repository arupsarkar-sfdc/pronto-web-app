import { writable } from 'svelte/store';

function createCart() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        addToCart: (product) => update(items => {
            const existingItem = items.find(item => item.id === product.id);
            if (existingItem) {
                return items.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...items, { ...product, quantity: 1 }];
        }),
        removeFromCart: (productId) => update(items => {
            return items.filter(item => item.id !== productId);
        }),
        updateQuantity: (productId, delta) => update(items => {
            return items.map(item => {
                if (item.id === productId) {
                    const newQuantity = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0);
        }),
        clear: () => set([])
    };
}

export const cart = createCart();

function createUser() {
    const { subscribe, set, update } = writable({
        isLoggedIn: false,
        profile: null
    });

    return {
        subscribe,
        login: (profile) => set({ isLoggedIn: true, profile }),
        logout: () => set({ isLoggedIn: false, profile: null })
    };
}

export const user = createUser();

export const isCartOpen = writable(false);

export const authToken = writable(null);
export const fetchedPayloadData = writable(null);
export const tokenEndpoint = writable("/get-token");
export const sourceRecordId = writable("");
