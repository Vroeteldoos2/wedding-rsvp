// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        fancy: ['"Dancing Script"', 'cursive'],
      },
      colors: {
        dark_green: "#1F2A19",
        baby_powder: "#F9F9F6",
        sea_green: "#619368",
        ash_gray: "#BABBB2",
        ecru: "#A79B66",
      },
      animation: {
        pulse: "pulse 2s infinite",
        fade: "fade 4s ease-in-out infinite",
      },
      keyframes: {
        fade: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};
