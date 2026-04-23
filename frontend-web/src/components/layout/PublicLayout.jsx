import Footer from "./Footer";
import Navbar from "./Navbar";
import WhatsAppFloat from "../common/WhatsAppFloat";
import "./PublicLayout.css";

function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-layout__main">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default PublicLayout;