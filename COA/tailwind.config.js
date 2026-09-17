/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				canvas: "var(--canvas)",
				surface: "var(--surface)",
				raised: "var(--raised)",
				line: "var(--border)",
				ink: "var(--text)",
				muted: "var(--text-muted)",
				accent: "var(--accent)",
				positive: "var(--positive)",
				attention: "var(--attention)",
				danger: "var(--danger)",
				caution: "var(--caution)",
				govNavy: "var(--gov-navy)",
				govNavy2: "var(--gov-navy-2)",
				accentSoft: "var(--accent-soft)",
				saffron: "var(--saffron)",
			},
			fontFamily: {
				sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
				heading: ["DM Sans", "sans-serif"],
				gov: ["Noto Serif", "Georgia", "serif"],
			},
			borderColor: { DEFAULT: "var(--border)" },
			boxShadow: { soft: "0 1px 3px rgba(22,35,58,0.08), 0 4px 14px rgba(22,35,58,0.06)" },
			keyframes: {
				fadeUp: { "0%": { opacity: 0, transform: "translateY(4px)" }, "100%": { opacity: 1, transform: "none" } },
				slideIn: { "0%": { transform: "translateX(18px)", opacity: 0 }, "100%": { transform: "none", opacity: 1 } },
				grow: { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
				pulseDot: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
			},
			animation: {
				fadeUp: "fadeUp 0.25s ease-out",
				slideIn: "slideIn 0.22s ease-out",
				grow: "grow 0.5s ease-out",
				pulseDot: "pulseDot 2.4s ease-in-out infinite",
			},
		},
	},
	plugins: [],
}
