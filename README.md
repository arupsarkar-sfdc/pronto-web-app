# Pronto

Pronto is a reference implementation of a food delivery application built with Svelte. It demonstrates how to integrate **Salesforce Personalization** and **Data Cloud** for real-time event tracking.

## Overview

This project serves as a proof-of-concept for:
*   **Event Tracking**: capturing user interactions (Identity, Catalog Views, Cart actions) and sending them to Salesforce.
*   **Frontend Architecture**: using Svelte v4 with Vite for a performant, component-based UI.
*   **State Management**: utilizing native Svelte Stores for handling cart and session state.

## Tech Stack

*   **Framework**: Svelte 4
*   **Build**: Vite
*   **State**: Svelte Stores
*   **Analytics**: Salesforce Interactions SDK (WebSDK)

## Key Components

*   `src/lib/websdk.js`: Wrapper for the Salesforce SDK. Handles initialization and event payloads.
*   `src/lib/stores.js`: Centralized store for `cart` and `user` state.
*   `src/App.svelte`: Main layout and initialization logic.

## Setup

### Prerequisites
*   Node.js 16+
*   npm 8+

### Installation

```bash
git clone <repo>
npm install
```

### Development

Run the local dev server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

## Deployment

### Heroku

This project is configured to run on Heroku as a static site using `serve`.

1.  **Install the Heroku CLI**:
    [Download and install](https://devcenter.heroku.com/articles/heroku-cli) the Heroku CLI for your OS.

2.  **Login to Heroku**:
    ```bash
    heroku login
    ```

3.  **Create a new Heroku app**:
    ```bash
    heroku create
    ```

4.  **Deploy**:
    ```bash
    git push heroku main
    ```

5.  **Open the app**:
    ```bash
    heroku open
    ```

**Note**: The project uses a `Procfile` to execute `npm start`, which runs `serve -s dist -l $PORT`. Ensure your `dist` folder is built before local testing, but Heroku will handle the build automatically if `npm install` runs successfully.
