/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './app.js', './routes/*.js'],
  theme: {
    extend: {
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
      },
      colors: {
        binos: {
          navy:    '#0f172a',
          dark:    '#1e293b',
          slate:   '#334155',
          gray:    '#64748b',
          light:   '#f1f5f9',
          border:  '#e2e8f0',
          // Category colors from UI
          blue:    '#3b82f6',
          orange:  '#f97316',
          pink:    '#ec4899',
          purple:  '#8b5cf6',
          green:   '#10b981',
          cyan:    '#06b6d4',
          teal:    '#14b8a6',
          yellow:  '#eab308',
          red:     '#ef4444',
          // Sidebar
          'sidebar-bg': '#0f172a',
          'sidebar-hover': '#1e293b',
          'sidebar-active': '#334155',
          // Cards
          'card-bg': '#ffffff',
          'card-border': '#e2e8f0',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      borderRadius: {
        card: '0.75rem',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body:    ['Inter',   'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
