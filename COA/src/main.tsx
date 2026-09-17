import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"
import "./index.css"

// Boot-time theme persistence — runs before React mounts to prevent FOUC
;(function applyStoredTheme() {
  const stored = localStorage.getItem("theme")
  if (stored === "dark") {
    document.documentElement.classList.add("dark")
  } else if (stored === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark")
    }
  }
  // "light" or null → no dark class (default light is already correct)
})()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>,
)
