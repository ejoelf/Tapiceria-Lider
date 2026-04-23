import { Navigate } from "react-router-dom";
import authStore from "../../store/authStore";

function ProtectedRoute({ children }) {
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;