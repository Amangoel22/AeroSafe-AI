/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Severity border colors (used dynamically via getSeverityBorderColor)
    'border-l-red-600',
    'border-l-orange-500',
    'border-l-amber-400',
    'border-l-slate-300',
    // Severity badge backgrounds (used dynamically via getSeverityColor)
    'bg-red-600',
    'bg-orange-500',
    'bg-amber-400',
    'bg-slate-400',
    // Status badge backgrounds (used dynamically via getStatusColor)
    'bg-gray-400',
    'bg-blue-600',
    'bg-green-600',
    'bg-yellow-500',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#1e293b',
      },
    },
  },
  plugins: [],
}
