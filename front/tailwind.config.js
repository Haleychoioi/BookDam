/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // public 폴더의 index.html (주로 Vite에서 사용)
    "./src/**/*.{ts,tsx}", // src 폴더 내의 모든 .js, .ts, .jsx, .tsx 파일
  ],
  theme: {
    extend: {
      // 커스텀 색상
      // colors: {
      //   primary: "#5C6BC0", // 메인 브랜드 색상
      //   secondary: "#8BC34A", // 보조 색상
      //   accent: "#FFC107", // 강조 색상
      //   "gray-100": "#f7fafc",
      //   "gray-200": "#edf2f7",
      //   // ... 더 많은 커스텀 색상
      // },
      // 커스텀 폰트
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
