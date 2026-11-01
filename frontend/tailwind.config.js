/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EXACT CIVICSPOT EMERALD FOREST + NEON GLOW + CHAMPAGNE GOLD SPECIFICATION
        civic: {
          // Core backgrounds
          base: '#0B1F16',        // Primary background
          slate: '#0F2F22',       // Secondary background
          navy: '#163B2E',        // Elevated background
          surface1: '#163B2E',    // Elevated background
          surface2: '#1E4D3A',    // Card background
          surface3: '#265C47',    // High-elevated surface
          surfaceHover: '#225742',
          border: 'rgba(34, 197, 94, 0.25)',     // Subtle emerald border
          borderSubtle: 'rgba(34, 197, 94, 0.15)',
          borderGlow: '#22C55E',                  // Active neon green border
          card: '#1E4D3A',

          // Accents
          green: '#22C55E',       // Primary green
          primary: '#22C55E',
          jade: '#34D399',        // Jade accent
          accent: '#34D399',
          gold: '#FAC615',        // Champagne gold
          amber: '#FAC615',
          orange: '#FB923C',      // Warm orange
          coral: '#FB923C',
          red: '#EF4444',         // Alert red
          rose: '#EF4444',
          cyan: '#38BDF8',
          violet: '#22C55E',      // Backward-compat mapping to primary emerald
          indigo: '#1E4D3A',

          // Text Hierarchy
          textPrimary: '#F8FAF5',
          textSecondary: '#D1E7D6',
          textMuted: '#94B7A8',
          textSubtle: '#6A9280',
        },

        // Aliases for unified Emerald Forest palette
        aurora: {
          bg: '#0B1F16',
          bgDark: '#07150E',
          surface: '#0F2F22',
          card: '#1E4D3A',
          elevated: '#163B2E',
          surface2: '#1E4D3A',
          surface3: '#265C47',
          border: 'rgba(34, 197, 94, 0.25)',
          borderSubtle: 'rgba(34, 197, 94, 0.15)',
          borderHighlight: '#22C55E',
        },
        forest: {
          midnight: '#0B1F16',
          deep: '#0F2F22',
          DEFAULT: '#163B2E',
          rich: '#1E4D3A',
          surface: '#0F2F22',
          card: '#1E4D3A',
          cardElevated: '#163B2E',
          border: 'rgba(34, 197, 94, 0.25)',
          borderLight: '#22C55E',
          emerald: '#22C55E',
          jade: '#34D399',
          moss: '#163B2E',
          light: '#34D399',
          subtle: '#0F2F22',
        },
        textLight: {
          primary: '#F8FAF5',
          secondary: '#D1E7D6',
          muted: '#94B7A8',
          subtle: '#6A9280',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(34, 197, 94, 0.1)',
        'premium-glow': '0 0 35px -5px rgba(34, 197, 94, 0.45), 0 20px 30px -10px rgba(0, 0, 0, 0.6)',
        'emerald-glow': '0 0 25px rgba(34, 197, 94, 0.45)',
        'jade-glow': '0 0 25px rgba(52, 211, 153, 0.45)',
        'gold-glow': '0 0 25px rgba(250, 198, 21, 0.45)',
        'amber-glow': '0 0 25px rgba(250, 198, 21, 0.45)',
        'cyan-glow': '0 0 25px rgba(56, 189, 248, 0.4)',
        'coral-glow': '0 0 25px rgba(251, 146, 60, 0.4)',
        'radar-glow': '0 0 35px rgba(34, 197, 94, 0.35)',
        'card-glow': '0 8px 32px rgba(11, 31, 22, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'inner-sheen': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'luxury-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'glow-violet': '0 0 25px rgba(34, 197, 94, 0.45)',
        'glow-cyan': '0 0 25px rgba(52, 211, 153, 0.45)',
        'glow-emerald': '0 0 25px rgba(34, 197, 94, 0.45)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at 65% 15%, rgba(34, 197, 94, 0.3) 0%, rgba(15, 47, 34, 0.6) 45%, #0B1F16 85%)',
        'card-gradient': 'linear-gradient(180deg, rgba(30, 77, 58, 0.85) 0%, rgba(22, 59, 46, 0.85) 100%)',
        'elevated-gradient': 'linear-gradient(180deg, rgba(22, 59, 46, 0.9) 0%, rgba(15, 47, 34, 0.9) 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'jade-gradient': 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FAC615 0%, #FB923C 100%)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'beacon': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'shimmer': 'shimmer 8s linear infinite',
        'beacon': 'beacon 2.5s infinite',
      }
    },
  },
  plugins: [],
}
