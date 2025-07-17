import styled from "styled-components";

export const MainLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const MainHeader = styled.header`
  width: 100%;
  background-color: #f8f8f8;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > nav {
    margin-bottom: 20px;
    width: 100%;
    max-width: 1200px;
    padding: 0 24px;
    box-sizing: border-box;
  }
`;

export const MainContent = styled.main`
  flex-grow: 1;
  padding: 20px 0;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
`;
