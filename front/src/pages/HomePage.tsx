import type React from "react";
import MainBestSellerCarousel from "../components/MainBestSellerCarousel";
import {
  GenreButton,
  GenreNavigation,
  HomePageContainer,
  Section,
  SectionTitle,
} from "./HomePage.styled";
import BookCarousel from "../layouts/BookCarousel";

const HomePage: React.FC = () => {
  return (
    <HomePageContainer>
      <MainBestSellerCarousel />

      <Section>
        <SectionTitle>카테고리별</SectionTitle>
        <GenreNavigation>
          {[
            "추리",
            "에세이",
            "소설",
            "시",
            "역사",
            "과학",
            "예술",
            "자기계발",
            "여행",
          ].map((genre: string) => (
            <GenreButton key={genre} as="button">
              {genre as React.ReactNode}
            </GenreButton>
          ))}
        </GenreNavigation>
      </Section>

      <Section>
        <SectionTitle>신간 도서</SectionTitle>
        <BookCarousel />
      </Section>

      <Section>
        <SectionTitle>베스트셀러</SectionTitle>
        <BookCarousel />
      </Section>
    </HomePageContainer>
  );
};

export default HomePage;
