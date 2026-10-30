/**
 * Shared Tailwind preset — satu sumber kebenaran untuk design tokens MAB-App.
 * Dipakai oleh semua app/package: presets: [require('@mab/config/tailwind')]
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: { 950: '#05060b', 900: '#0a0c14', 800: '#10131f', 700: '#181c2c' },
        brand: { violet: '#7c5cff', cyan: '#22d3ee', pink: '#f472b6' },
      },
      fontFamily: {
        // Variable fonts dari @fontsource-variable (Google Fonts, self-hosted)
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
};
