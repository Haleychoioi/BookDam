import styled from "styled-components";

export const HomePageContainer = styled.div`
  margin: 0 auto;
`;

export const Section = styled.section`
  margin-bottom: 60px;

  max-width: 1200px;
  margin: 0 auto 60px auto;
  box-sizing: border-box;
  padding: 0 20px;
`;

export const SectionTitle = styled.h2`
  font-size: 2.2em;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-left: 40px;
`;

export const GenreNavigation = styled.nav`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 40px;
`;

export const GenreButton = styled.button`
  background-color: #f8f9fa;
  color: #333;
  padding: 10px 18px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #e2e6ea;
    border-color: #adadad;
  }
`;

export const BookCarouselWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 10px 0;
`;
