import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarContainer = styled.nav`
  background-color: #fff;
  border-bottom: 1px solid #f8f9fa;
  padding: 0 10px 0 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
`;

export const NavbarLeft = styled.div`
  display: flex;
  align-items: center;
  flex-basis: 30%;
  justify-content: flex-start;
`;

export const NavbarCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-basis: 40%;
`;

export const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  flex-basis: 30%;
  justify-content: flex-end;
  gap: 16px;
`;

export const NavBrandText = styled.span`
  font-family: "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue",
    "sans-serif";
  font-size: 2rem;
  color: #000;
  text-decoration: none;
`;

export const NavLinkItem = styled(Link)`
  font-size: 0.875rem;
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.strongOrange};
  }
`;
