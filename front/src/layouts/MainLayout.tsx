import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow pt-20 pb-20 overflow-x-hidden">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
