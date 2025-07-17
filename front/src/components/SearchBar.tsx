import { SearchButton, SearchInput, SearchWrapper } from "./SearchBar.styled";

const SearchBar: React.FC = () => {
  return (
    <SearchWrapper>
      <SearchInput type="text" placeholder="도서 검색"></SearchInput>
      <SearchButton>검색</SearchButton>
    </SearchWrapper>
  );
};

export default SearchBar;
