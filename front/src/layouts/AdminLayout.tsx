import { Outlet } from "react-router-dom";
import AdminSideNav from "../components/AdminSideNav";

const AdminLayout: React.FC = () => {
  return (
    <div>
      <div>
        <AdminSideNav />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
