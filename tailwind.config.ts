import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    fontFamily: {
      sans: ['Pretendard', 'sans-serif'],
    },
    backgroundImage: {
      'gray-linear':
        'linear-gradient(180deg, rgba(0, 0, 0, 0.09) 0%, rgba(0, 0, 0, 0.3) 100%)',
    },
    backdropFilter: {
      none: 'none',
      blur: 'blur(4px)',
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1080px',
        'max-width': '1080px',
      },
    },
    extend: {
      boxShadow: {
        'md-bottom': ' 0 4px 2px -2px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        S2: {
          max: '320px',
        },
        SE: {
          min: '321px',
          max: '400px',
        },
        mobile: {
          min: '401px',
          max: '560px',
        },
        tablet: {
          min: '561px',
          max: '720px',
        },
        PC: {
          min: '721px',
        },
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          hover: 'hsl(var(--primary-hover))',
          active: 'hsl(var(--primary-active))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        kakao: {
          DEFAULT: 'hsl(var(--kakao))',
          hover: 'hsl(var(--kakao-hover))',
          text: 'hsl(var(--kakao-text))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        white: '#FFFFFF',
        grayscale50: '#F0F0F0',
        grayscale100: '#F8F8F8',
        grayscale200: '#EEEEEE',
        grayscale300: '#E0E0E0',
        grayscale400: '#B9B9B9',
        grayscale500: '#909090',
        grayscale600: '#606060',
        grayscale700: '#464646',
        grayscale800: '#2A2A2A',
        grayscale900: '#000000',
        primary50: '#FFF9D9',
        primary100: '#FFED9C',
        primary200: '#FFC946',
        primary300: '#FFA749',
        primary400: '#FF884A',
        primary500: '#FF7800',
        primary600: '#FF6500',
        primary700: '#BF5000',
        primary800: '#9F4000',
        primary900: '#703400',
        'system-red50': '#FFDFDF',
        'system-red100': '#FFC2C2',
        'system-red200': '#FF8D8D',
        'system-red300': '#F86060',
        'system-red400': '#E53535',
        'system-red500': '#C81D1D',
        'system-red600': '#A01B1B',
        'system-red700': '#651316',
        'system-red800': '#45130E',
        'system-red900': '#2C0707',
        secondary50: '#FFEDDF',
        secondary100: '#FFDFD2',
        secondary200: '#FFD1A7',
        secondary300: '#FFBC7E',
        secondary400: '#F79C61',
        secondary500: '#DD7A42',
        secondary600: '#B86B2B',
        secondary700: '#886914',
        secondary800: '#5C5E17',
        secondary900: '#2E3207',
        lime50: '#F7FE1A',
        lime100: '#E7FEA5',
        lime200: '#CDFEAA',
        lime300: '#B4FBAA',
        lime400: '#96F88E',
        lime500: '#6DF624',
        lime600: '#4BE013',
        lime700: '#3FA712',
        lime800: '#2C5719',
        lime900: '#215706',
        blue50: '#F0F7FF',
        blue100: '#ADD6FE',
        blue200: '#40BCFE',
        blue300: '#0AC8FF',
        blue400: '#1CA9FE',
        blue500: '#1179F7',
        blue600: '#1F67E0',
        blue700: '#1D52FF',
        blue800: '#1437F5',
        blue900: '#081632',
        violet50: '#E0E1FA',
        violet100: '#BBD0FD',
        violet200: '#C2B0FC',
        violet300: '#A39FFF',
        violet400: '#6976FD',
        violet500: '#6D69D0',
        violet600: '#635FBD',
        violet700: '#4E5675',
        violet800: '#2A237B',
        violet900: '#201736',
        red50: '#F9DBD0',
        red100: '#F7B6C5',
        red200: '#FDCBCB',
        red300: '#EFC9B0',
        red400: '#FF7470',
        red500: '#D05440',
        red600: '#C32500',
        red700: '#A31700',
        red800: '#8B2D00',
        red900: '#641800',
        'scarlet-red50': '#FFE2DF',
        'scarlet-red100': '#FFCB84',
        'scarlet-red200': '#FFC893',
        'scarlet-red300': '#FF7169',
        'scarlet-red400': '#FC7019',
        'scarlet-red500': '#FA5528',
        'scarlet-red600': '#EB3424',
        'scarlet-red700': '#8D1E16',
        'scarlet-red800': '#820618',
        'scarlet-red900': '#471D14',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        bounceInOrder: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-3px)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        bounceInOrder: 'bounceInOrder 1s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
