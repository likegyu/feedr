import type { Config } from "tailwindcss";

export default {
	darkMode: "media",
	content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	},
	  screens: {
		'xs': '475px',
		// => @media (min-width: 475px) { ... }

		'sm': '640px',
		// => @media (min-width: 640px) { ... }
  
		'md': '768px',
		// => @media (min-width: 768px) { ... }
  
		'lg': '1024px',
		// => @media (min-width: 1024px) { ... }
  
		'xl': '1280px',
		// => @media (min-width: 1280px) { ... }
  
		'2xl': '1536px',
		// => @media (min-width: 1536px) { ... }
	  },
  maxWidth: {
	'0': '0px',
	'px': '1px',
	'0.5': '0.125rem', /* 2px */
	'1': '0.25rem', /* 4px */
	'1.5': '0.375rem', /* 6px */
	'2': '0.5rem', /* 8px */
	'2.5': '0.625rem', /* 10px */
	'3': '0.75rem', /* 12px */
	'3.5': '0.875rem', /* 14px */
	'4': '1rem', /* 16px */
	'5': '1.25rem', /* 20px */
	'6': '1.5rem', /* 24px */
	'7': '1.75rem', /* 28px */
	'8': '2rem', /* 32px */
	'9': '2.25rem', /* 36px */
	'10': '2.5rem', /* 40px */
	'11': '2.75rem', /* 44px */
	'12': '3rem', /* 48px */
	'14': '3.5rem', /* 56px */
	'16': '4rem', /* 64px */
	'20': '5rem', /* 80px */
	'24': '6rem', /* 96px */
	'28': '7rem', /* 112px */
	'32': '8rem', /* 128px */
	'36': '9rem', /* 144px */
	'40': '10rem', /* 160px */
	'44': '11rem', /* 176px */
	'48': '12rem', /* 192px */
	'52': '13rem', /* 208px */
	'56': '14rem', /* 224px */
	'60': '15rem', /* 240px */
	'64': '16rem', /* 256px */
	'72': '18rem', /* 288px */
	'80': '20rem', /* 320px */
	'96': '24rem', /* 384px */
	'none': 'none',
	'xs': '20rem', /* 320px */
	'sm': '24rem', /* 384px */
	'md': '28rem', /* 448px */
	'lg': '32rem', /* 512px */
	'xl': '36rem', /* 576px */
	'2xl': '42rem', /* 672px */
	'3xl': '48rem', /* 768px */
	'4xl': '56rem', /* 896px */
	'5xl': '64rem', /* 1024px */
	'6xl': '72rem', /* 1152px */
	'7xl': '80rem', /* 1280px */
	'full': '100%',
	'min': 'min-content',
	'max': 'max-content',
	'fit': 'fit-content',
	'prose': '65ch',
	'screen-sm': '640px',
	'screen-md': '768px',
	'screen-lg': '1024px',
	'screen-xl': '1280px',
	'screen-2xl': '1536px',
	'60vw': '60vw',
  }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
