import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
// In-memory OTP Store for Dev
const otpStore = new Map();

const otpPlugin = () => ({
	name: 'configure-server',
	configureServer(server) {
		server.middlewares.use(async (req, res, next) => {
			if (req.url.startsWith('/api/send-otp') && req.method === 'POST') {
				let body = '';
				req.on('data', chunk => body += chunk);
				req.on('end', async () => {
					try {
						const { userId } = JSON.parse(body);
						if (!userId) {
							res.statusCode = 400;
							res.end(JSON.stringify({ error: 'User ID is required' }));
							return;
						}
						const otp = Math.floor(100000 + Math.random() * 900000).toString();
						const expires = Date.now() + 5 * 60 * 1000;
						otpStore.set(userId, { code: otp, expires });

						// Send to Slack
						const webhookUrl = process.env.SLACK_WEBHOOK_URL;
						if (webhookUrl) {
							await fetch(webhookUrl, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ text: `🔐 [DEV] Admin Access Request\nUser: *${userId}*\nOTP: *${otp}*` })
							});
						}
						console.log(`[DEV OTP] Generated for ${userId}: ${otp}`);
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ success: true, message: 'OTP sent' }));
					} catch (e) {
						res.statusCode = 500;
						res.end(JSON.stringify({ error: 'Server Error' }));
					}
				});
				return;
			}

			if (req.url.startsWith('/api/verify-otp') && req.method === 'POST') {
				let body = '';
				req.on('data', chunk => body += chunk);
				req.on('end', () => {
					try {
						const { userId, otp } = JSON.parse(body);
						const record = otpStore.get(userId);
						if (!record || Date.now() > record.expires || record.code !== otp) {
							res.statusCode = 400;
							res.end(JSON.stringify({ error: 'Invalid or expired OTP' }));
							return;
						}
						otpStore.delete(userId);
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ success: true, message: 'OTP verified' }));
					} catch (e) {
						res.statusCode = 500;
						res.end(JSON.stringify({ error: 'Server Error' }));
					}
				});
				return;
			}
			next();
		});
	}
});

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	// Load env vars into process.env for the plugin to access
	process.env = { ...process.env, ...env };

	return {
		plugins: [svelte(), otpPlugin()],
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
