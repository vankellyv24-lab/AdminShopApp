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
            colors: {
                primary: {
                    50: '#e7f6ef',
                    100: '#c6ecd9',
                    200: '#96dbbb',
                    300: '#63c89b',
                    400: '#33b67d',
                    500: '#0a7a55',
                    600: '#086345',
                    700: '#064c35',
                    800: '#043626',
                    900: '#022117',
                },
            },
        },
    },

    plugins: [forms],
};
