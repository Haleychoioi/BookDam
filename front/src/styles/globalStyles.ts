import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  /* CSS Reset (기본 브라우저 스타일 초기화) */
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    vertical-align: baseline;
  }
  article, aside, details, figcaption, figure,
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  body {
    line-height: 1;
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  /* Box Sizing (모든 요소에 border-box 적용) */
  *, *:before, *:after {
    box-sizing: border-box;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 링크 기본 스타일 */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* 버튼 기본 스타일 */
  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  /* 입력 필드 기본 스타일 */
  input, textarea, select {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    padding: 8px 12px;
    border: 1px solid ${({ theme }) =>
      theme.colors.borderColor}; /* 테마의 borderColor 사용 */
    border-radius: 4px; /* 테마에 borderRadius.sm이 있다면 그것을 사용 */
    outline: none;
    &:focus {
      border-color: ${({ theme }) =>
        theme.colors.strongOrange}; /* 메인 오렌지 색상 사용 */
      box-shadow: 0 0 0 0.15rem ${({ theme }) =>
        theme.colors.amazonOrange}40; /* 오렌지 계열 그림자 (투명도 조정) */
    }
  }
`;
