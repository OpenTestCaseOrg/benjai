/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./index.html", "./pricing.html"],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}