import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [svelte()],
		server: {
			port: process.env.PORT || 3000, // Use Heroku's port or default to 3000
			host: true,
			proxy: {
				'/get-token': {
					target: env.TOKEN_ENDPOINT_URL || 'https://acme-dcunited-connector-app-58a61db33e61.herokuapp.com',
					changeOrigin: true,
					secure: false,
				},
				'/api': {
					target: env.SALESFORCE_PROXY_URL || 'https://mnrw0zbyh0yt0mldmmytqzrxg0.c360a.salesforce.com',
					changeOrigin: true,
					secure: false,
				}
			}
		}
	}
})
