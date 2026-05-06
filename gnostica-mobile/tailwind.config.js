/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "var(--primary)",
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                header: {
                    bg: "var(--header-bg)",
                    orange: "var(--header-orange)",
                    text: "var(--header-text)",
                }
            }
        },
    },
    plugins: [],
};
