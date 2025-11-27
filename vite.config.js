import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
	server: {
		port: process.env.PORT || 3000, // Use Heroku's port or default to 3000
		host: true
	}  
})
