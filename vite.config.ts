import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
	plugins: [react()],
	resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
	server: {
		port: 5173,
		// If your backend runs locally and you hit CORS, uncomment this proxy and
		// set VITE_API_BASE_URL="" so requests go to /api/... on the same origin.
		// proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
	},
})
