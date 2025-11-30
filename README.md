# Pronto - Premium Food Delivery App

## 🎯 Objectives
**Pronto** is a high-fidelity, modern web application designed to demonstrate the power of **Salesforce Data Cloud** and **Interaction Studio (WebSDK)** integration. 

The primary goals of this project are:
1.  **Premium User Experience**: Deliver a visually stunning, responsive UI inspired by top-tier delivery platforms (DoorDash, UberEats).
2.  **Data Cloud Integration**: Seamlessly capture and send high-value user engagement events (Identity, Product Views, Add to Cart, Orders) to Salesforce.
3.  **Modern Architecture**: Showcase best practices in frontend development using **Svelte**, **Vite**, and **State Management**.

## 🚀 Process & Architecture
The application is built with a component-driven architecture, ensuring modularity and maintainability.

### Tech Stack
-   **Framework**: [Svelte](https://svelte.dev/) (v4)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: Svelte Stores (Native)
-   **Styling**: Vanilla CSS (Variables, Flexbox, Grid)
-   **Analytics**: Salesforce WebSDK (Interaction Studio)

### Key Components
-   **`App.svelte`**: Main application shell and layout orchestrator.
-   **`stores.js`**: Centralized state management for `cart` and `user` sessions.
-   **`websdk.js`**: Abstraction layer for Salesforce Interactions SDK, handling event payloads and consent.
-   **`CartModal.svelte`**: Dynamic shopping cart interface.
-   **`ProductGrid.svelte`**: Responsive grid displaying products with interactive elements.

## ⚙️ Operations & Features
The application supports a complete user journey:

1.  **Authentication**:
    -   User Registration and Login (Simulated).
    -   Identity resolution sent to Data Cloud.
2.  **Browsing**:
    -   Category navigation with "pills" UI.
    -   Product discovery with rich media and ratings.
3.  **Shopping**:
    -   **Add to Cart**: Real-time cart updates.
    -   **Cart Management**: Adjust quantities, view totals, and checkout.
4.  **Personalization**:
    -   Dynamic Hero Banner driven by user attributes (simulated via SDK).

## 🧪 Testing
We employ a rigorous verification process:

### Manual Verification
-   **UI/UX**: Visual inspection across different viewports (Desktop, Tablet, Mobile).
-   **Event Tracking**: Using the browser console and Network tab to verify `interaction` and `catalog` events sent to Salesforce.
-   **State Consistency**: Verifying that cart counts and login states persist correctly across component interactions.

### Automated Checks
-   **Linting**: `eslint` for code quality and style consistency.
-   **Build Checks**: `vite build` ensures all assets are optimized and free of compilation errors.

## 🛠️ Build & Run
Follow these steps to set up the project locally:

### Prerequisites
-   Node.js (v16+)
-   npm (v8+)

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### Development
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### Production Build
Create an optimized production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```
