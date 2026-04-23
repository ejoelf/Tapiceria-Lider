import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-layout__content">
        <Topbar />
        <main className="admin-layout__main">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;