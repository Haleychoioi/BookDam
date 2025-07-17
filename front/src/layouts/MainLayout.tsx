import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";

const MainLayout: React.FC = () => {
  return (
    <div>
      <header>
        <NavBar />
        <SearchBar />
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
