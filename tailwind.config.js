/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',    // Noir pour le texte principal
        defensive: '#2563eb',  // Bleu pour défensif
        general: '#16a34a',    // Vert pour général
        offensive: '#dc2626',  // Rouge pour offensive
        'task-bg': '#ffffff',  // Fond des tâches (blanc)
        'column-bg': '#f3f4f6', // Fond des colonnes (gris léger)
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f3f4f6, #ffffff)',
      },
      boxShadow: {
        'custom': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'custom-hover': '0 4px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 