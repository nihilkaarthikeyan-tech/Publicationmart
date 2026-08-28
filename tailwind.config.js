import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            /**
             * House palette (2.0).
             *
             * The app carries thousands of indigo/violet/purple/fuchsia/pink
             * utility classes across ~90 page components. Rather than editing
             * every file, the purple families are remapped here onto the
             * publishing-house colours: oxblood binding cloth, aged gold foil
             * and warm rose clay. Each ramp keeps the original lightness
             * progression, so `indigo-50` is still a pale tint and
             * `indigo-900` is still nearly black — only the hue moves off
             * purple. Existing gradients keep their contrast and read warm.
             */
            colors: {
                // primary accent — oxblood binding cloth (#6e2530 at 700)
                indigo: {
                    50: '#fcf5f5', 100: '#f7e8ea', 200: '#eed2d5', 300: '#ddaeb4',
                    400: '#c8828c', 500: '#ad5b67', 600: '#8c3541', 700: '#6e2530',
                    800: '#5a1e27', 900: '#481820', 950: '#2a0e12',
                },
                // deeper wine, so two-stop gradients still have movement
                violet: {
                    50: '#fbf4f4', 100: '#f5e6e7', 200: '#ebcdd0', 300: '#d8a5ac',
                    400: '#c17683', 500: '#a44e5d', 600: '#86303c', 700: '#6a222d',
                    800: '#571c24', 900: '#46161d', 950: '#280d11',
                },
                // aged gold foil (#a07d3b at 600) — the second house colour
                purple: {
                    50: '#fbf7ee', 100: '#f5edd8', 200: '#ecdcb4', 300: '#ddc286',
                    400: '#cba75c', 500: '#b8903f', 600: '#a07d3b', 700: '#856531',
                    800: '#6b512a', 900: '#574224', 950: '#322414',
                },
                // warm brick, for the brighter end of old purple gradients
                fuchsia: {
                    50: '#fdf5f3', 100: '#f9e9e4', 200: '#f1d3ca', 300: '#e2ada0',
                    400: '#cf8172', 500: '#b85a4c', 600: '#9c4038', 700: '#7d2f2b',
                    800: '#672825', 900: '#55221f', 950: '#300f0e',
                },
                // rose clay — keeps pink's role without the violet cast
                pink: {
                    50: '#fdf5f4', 100: '#fbe9e6', 200: '#f5d4ce', 300: '#eab3a8',
                    400: '#db8b7c', 500: '#c76757', 600: '#ad4c3e', 700: '#8e3b31',
                    800: '#75322b', 900: '#613026', 950: '#351512',
                },
            },
            animation: {
                'marquee': 'marquee 25s linear infinite',
                'scroll-left': 'scroll-left 40s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'scroll-left': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                drift: {
                    '0%': { transform: 'translate(0, 0)' },
                    '100%': { transform: 'translate(-10px, -20px)' },
                },
                twinkle: {
                    '0%, 100%': { opacity: '0.2' },
                    '50%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                'marquee': 'marquee 25s linear infinite',
                'scroll-left': 'scroll-left 40s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'drift': 'drift 10s linear infinite alternate',
                'twinkle': 'twinkle 4s ease-in-out infinite',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
            },
        },
    },

    plugins: [forms],
};
