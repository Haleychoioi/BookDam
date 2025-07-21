/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // public 폴더의 index.html (주로 Vite에서 사용)
    "./src/**/*.{ts,tsx, js, jsx}", // src 폴더 내의 모든 .js, .ts, .jsx, .tsx 파일
  ],
  theme: {
    extend: {
      colors: {
        main: "#FFBD42",
        apply: "#FFD23C", // star
        category: "#FFE7C8",
        delete: "#FF4242",
        categoryText: "#FFA228",
      },
      fontFamily: {
        sans: ["Noto Sans KR", "sans-serif"], // 기본 sans 폰트 (한글 폰트 우선 적용)
        serif: ["Merriweather", "serif"],
      },
      // 커스텀 spacing
      spacing: {
        128: "32rem",
        144: "36rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
