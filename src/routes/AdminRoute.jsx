// src/routes/AdminRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

/* ---------- safe JSON parse ---------- */
const getParsedItem = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const AdminRoute = ({ children }) => {
  const location = useLocation();

  const adminToken = localStorage.getItem("admin_token");
  const adminUser = getParsedItem("adminUser");

  /* ---------- strict admin validation ---------- */
  const isAdminValid =
    Boolean(adminToken) &&
    adminUser &&
    adminUser.role === "admin";

  // ✅ UNAUTHORIZED ADMIN → LOGIN PAGE
  if (!isAdminValid) {
    return (
      <Navigate
        to="/admin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default AdminRoute;
