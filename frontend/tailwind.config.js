/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                secondary: {
                    50: '#f8fafc',
                    500: '#64748b',
                    600: '#475569',
                }
            },
            fontFamily: {
                sans: ["Geist", "sans-serif"],
                roboto: ["Geist", "Helvetica", "Arial", "sans-serif"],
            },
            fontSize: {
                xxs: ['0.7rem', '0.8rem'],
            },
            animation: {
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}