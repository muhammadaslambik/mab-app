import preset from '@mab/config/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './src/**/*.{astro,html,ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}', // class di package UI juga di-scan
  ],
};
