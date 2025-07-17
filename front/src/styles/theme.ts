import type { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    // 메인 컬러 팔레트
    strongOrange: "#FA7000",
    amazonOrange: "#FF9900",
    romanticOrange: "#FEA948",
    classicOrange: "#F2AC29",

    // 테두리 및 구분선 색상
    borderColor: "#dee2e6",
  },
};

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      strongOrange: string;
      amazonOrange: string;
      romanticOrange: string;
      classicOrange: string;
      borderColor: string;
    };
  }
}
