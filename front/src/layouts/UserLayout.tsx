import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserSideNav from "../components/UserSideNav";
import Footer from "../components/Footer";

const UserLayout: React.FC = () => {
  return (
    <div>
      <NavBar />

      <div>
        <UserSideNav />
        <main>
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default UserLayout;
