/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h2: {
              color: '#111827',
            },
            h3: {
              color: '#111827',
            },
            h4: {
              color: '#111827',
            },
            strong: {
              color: '#111827',
            },
            li: {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            }
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
