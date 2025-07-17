import { Link } from "react-router-dom";
import {
  NavbarContainer,
  NavbarCenter,
  NavbarLeft,
  NavbarRight,
  NavBrandText,
  NavLinkItem,
} from "./Navbar.styled";

import WeatherWidget from "./WeatherWidget";

const NavBar: React.FC = () => {
  return (
    <NavbarContainer>
      <NavbarLeft>
        <WeatherWidget />
      </NavbarLeft>
      <NavbarCenter>
        <Link to="/">
          <NavBrandText>Book</NavBrandText>
        </Link>
      </NavbarCenter>
      <NavbarRight>
        <NavLinkItem to="/user">마이페이지</NavLinkItem>
        <NavLinkItem to="/qna">고객센터</NavLinkItem>
        <NavLinkItem to="/logout">로그아웃</NavLinkItem>
      </NavbarRight>
    </NavbarContainer>
  );
};

export default NavBar;
