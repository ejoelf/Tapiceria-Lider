import { BrowserRouter, Route, Routes } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AboutPage from "../pages/About/AboutPage";
import ContactPage from "../pages/Contact/ContactPage";
import CoursesPage from "../pages/Courses/CoursesPage";
import HomePage from "../pages/Home/HomePage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import ProductDetailPage from "../pages/ProductDetail/ProductDetailPage";
import ProductsPage from "../pages/Products/ProductsPage";
import ServicesPage from "../pages/Services/ServicesPage";
import WorkDetailPage from "../pages/WorkDetail/WorkDetailPage";
import WorksPage from "../pages/Works/WorksPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <PublicLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/trabajos" element={<WorksPage />} />
          <Route path="/trabajos/:slug" element={<WorkDetailPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:slug" element={<ProductDetailPage />} />
          <Route path="/cursos" element={<CoursesPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PublicLayout>
    </BrowserRouter>
  );
}

export default AppRouter;