/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-tertiary': '#1a1a25',
        'accent': '#ff6b4a',
        'accent-hover': '#ff8a6b',
        'text-primary': '#f5f5f7',
        'text-secondary': '#8b8b9e',
        'border-custom': 'rgba(255, 255, 255, 0.08)',
        'message-other': '#1e1e2a',
        'success': '#4ade80',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
