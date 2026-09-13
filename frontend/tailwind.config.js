/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          base: '#EDE7DD',      // warm stone
          surface: '#F7F4EC',   // slightly lighter warm neutral
          surfaceHover: '#EFECE3',
          surfaceActive: '#E8E3D7',
          text: '#2B2621',      // warm charcoal
          muted: '#6B6258',     // muted secondary text
          border: '#D8D0C2',    // divider/border
          borderDark: '#C4BAA7',
          primary: '#3E5C55',   // deep slate-teal (control room)
          primaryHover: '#324B45',
          primaryLight: '#E8EFEA',
          secondary: '#B5762E', // muted ochre/brass (signal lamp)
          secondaryHover: '#986224',
          secondaryLight: '#F7EFE3',
          critical: '#9C4A3A',  // muted brick red (defects, hard conflicts)
          criticalLight: '#F7EAE8',
          warning: '#C08A2E',   // muted amber (overdue, soft constraints)
          warningLight: '#FAF3E5',
          success: '#5C7A5A',   // muted olive-green (scheduled, completed)
          successLight: '#EEF3EE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      }
    },
  },
  plugins: [],
}
