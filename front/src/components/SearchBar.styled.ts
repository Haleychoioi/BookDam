import styled from "styled-components";

export const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  width: 100%;
  max-width: 700px;
  height: 48px;
  margin: 0 auto;
  margin-bottom: 40px;
`;

export const SearchInput = styled.input`
  flex-grow: 1;
  padding: 12px 16px;
  border: none;
  border-right: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 0;
  outline: none;
  font-size: 1rem;
  color: #333;
`;

export const SearchButton = styled.button`
  /* background-color: ${({ theme }) => theme.colors.strongOrange}; */
  color: gray;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease-in-out;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* &:hover {
    background-color: ${({ theme }) => theme.colors.amazonOrange};
  } */
`;
