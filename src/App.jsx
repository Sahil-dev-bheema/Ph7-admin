import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminRoute from "./routes/AdminRoute";
import WithdrawlBox from "./components/withdrawSection/WithdrawlBox";
import Packages from "./pages/Packages";
import AdminProfile from "./pages/AdminProfile";
import { Toaster } from "react-hot-toast";
import Pools from "./pages/Pools";

/* ---------------- Layout ---------------- */
const Layout = () => {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<AdminLogin />} />

        <Route
          path="/"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pools" element={<Pools />} />
          <Route path="packages" element={<Packages />} />
          <Route path="withdrawl" element={<WithdrawlBox />} />
          <Route path="adminprofile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </>
  );
};

/* ---------------- App ---------------- */
const App = () => (
  <BrowserRouter>
    <Toaster position="top-center" reverseOrder={false} />
    <Layout />
  </BrowserRouter>
);

export default App;