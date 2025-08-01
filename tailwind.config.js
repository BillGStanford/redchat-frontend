/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'redchat': {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc1c1',
          300: '#ff9a9a',
          400: '#ff6b6b',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        'dark': {
          50: '#e4e7eb',
          100: '#c4c9d0',
          200: '#a3abb6',
          300: '#828c9c',
          400: '#616e82',
          500: '#414e66',
          600: '#2e3a50',
          700: '#252e42',
          800: '#1a2333',
          900: '#111827',
          950: '#0b121f',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700,
        extrabold: 800,
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 2.5s infinite',
        'spin-slow': 'spin 2s linear infinite',
        'loader': 'loader 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        loader: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '6px',
        md: '10px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 10px rgba(244, 63, 94, 0.3)',
        'glow-sm': '0 0 6px rgba(244, 63, 94, 0.2)',
      },
      screens: {
        'xs': '475px',
        '2xl': '1400px',
      },
      zIndex: {
        '50': '50',
        '60': '60',
        '70': '70',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      minHeight: {
        'screen-80': '80vh',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(145deg, #0b121f 0%, #881337 40%, #111827 70%, #0b121f 100%)',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme('colors.dark.600')} ${theme('colors.dark.900')}`,
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme('colors.dark.900'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme('colors.dark.600'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme('colors.dark.500'),
          },
        },
        '.loader': {
          width: '48px',
          height: '48px',
          border: `4px solid ${theme('colors.redchat.500')}`,
          borderBottomColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          boxSizing: 'border-box',
          animation: 'loader 1.2s linear infinite',
        },
        '.form-checkbox': {
          appearance: 'none',
          width: '1rem',
          height: '1rem',
          border: `1px solid ${theme('colors.dark.600')}`,
          borderRadius: theme('borderRadius.sm'),
          backgroundColor: theme('colors.dark.800'),
          cursor: 'pointer',
          '&:checked': {
            backgroundColor: theme('colors.redchat.500'),
            borderColor: theme('colors.redchat.500'),
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 5l-6 6L4 9' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          },
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.redchat.500')}40`,
          },
        },
      };

      const newComponents = {
        '.btn': {
          padding: `${theme('spacing.2.5')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-out',
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.redchat.500')}40`,
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.redchat.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.redchat.700'),
          },
          '&:disabled': {
            backgroundColor: theme('colors.dark.600'),
            cursor: 'not-allowed',
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.dark.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.dark.500'),
          },
          '&:disabled': {
            backgroundColor: theme('colors.dark.600'),
            cursor: 'not-allowed',
          },
        },
        '.btn-icon': {
          padding: theme('spacing.2'),
          borderRadius: theme('borderRadius.sm'),
          transition: 'all 0.2s ease-out',
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.redchat.500')}40`,
          },
        },
        '.form-input': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          backgroundColor: theme('colors.dark.800'),
          border: `1px solid ${theme('colors.dark.700')}`,
          borderRadius: theme('borderRadius.md'),
          color: theme('colors.white'),
          fontSize: theme('fontSize.base'),
          '&::placeholder': {
            color: theme('colors.dark.400'),
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.redchat.500'),
            boxShadow: theme('boxShadow.glow-sm'),
          },
        },
        '.modal-card': {
          backgroundColor: `${theme('colors.dark.800')}cc`,
          backdropFilter: 'blur(10px)',
          borderRadius: theme('borderRadius.xl'),
          border: `1px solid ${theme('colors.dark.700')}`,
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.card'),
        },
        '.message-card': {
          maxWidth: '80%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          wordBreak: 'break-word',
          boxShadow: theme('boxShadow.glow-sm'),
          transition: 'transform 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        '.message-card-self': {
          backgroundColor: theme('colors.redchat.600'),
          color: theme('colors.white'),
        },
        '.message-card-other': {
          backgroundColor: theme('colors.dark.700'),
          color: theme('colors.dark.100'),
        },
        '.sidebar-item': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme('spacing.2'),
          borderRadius: theme('borderRadius.sm'),
          '&:hover': {
            backgroundColor: theme('colors.dark.800'),
          },
          transition: 'background-color 0.2s ease-out',
        },
        '.notification-toast': {
          position: 'fixed',
          top: theme('spacing.4'),
          right: theme('spacing.4'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          boxShadow: theme('boxShadow.glow'),
          zIndex: theme('zIndex.60'),
          animation: 'fadeIn 0.3s ease-out',
        },
        '.notification-error': {
          backgroundColor: theme('colors.redchat.600'),
          color: theme('colors.white'),
        },
        '.notification-success': {
          backgroundColor: theme('colors.green.600'),
          color: theme('colors.white'),
        },
        '.status-connected': {
          backgroundColor: theme('colors.green.500'),
        },
        '.status-disconnected': {
          backgroundColor: theme('colors.redchat.500'),
          animation: 'pulse 2s infinite',
        },
        '.chat-sidebar': {
          width: theme('spacing.84'),
          transition: 'transform 0.3s ease-out',
        },
        '.sidebar-open': {
          transform: 'translateX(0)',
        },
        '.sidebar-closed': {
          transform: 'translateX(100%)',
          '@screen lg': {
            transform: 'translateX(0)',
          },
        },
        '.backdrop': {
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: theme('zIndex.50'),
        },
        '.reaction-menu': {
          display: 'flex',
          alignItems: 'center',
          padding: theme('spacing.1'),
          borderRadius: theme('borderRadius.sm'),
          backgroundColor: `${theme('colors.dark.800')}cc`,
          backdropFilter: 'blur(6px)',
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
};