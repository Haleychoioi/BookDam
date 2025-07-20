/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // public 폴더의 index.html (주로 Vite에서 사용)
    "./src/**/*.{ts,tsx, js, jsx}", // src 폴더 내의 모든 .js, .ts, .jsx, .tsx 파일
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF9900", // Strong Orange를 주 색상으로 지정
        accent: "#F2AC29", // Classic Orange를 강조 색상으로 지정
        mild: "#FFC87A", // Amazon Orange(#FF9900)보다 연한 느낌의 색상
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
