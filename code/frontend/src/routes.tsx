import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./components/LoginPage";
import { FarmerLayout } from "./components/layouts/FarmerLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { HomePage } from "./components/HomePage";
import { CropDataPage } from "./components/CropDataPage";
import { DiseasePage } from "./components/DiseasePage";
import { ProfilePage } from "./components/ProfilePage";
import { ReportsPage } from "./components/ReportsPage";
import { MessagesPage } from "./components/MessagesPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AllFarmers } from "./components/admin/AllFarmers";
import { RegisterFarmer } from "./components/admin/RegisterFarmer";
import { AddHarvest } from "./components/admin/AddHarvest";
import { HarvestHistory } from "./components/admin/HarvestHistory";
import { AdminReports } from "./components/admin/AdminReports";
import { AdminProfilePage } from "./components/admin/AdminProfilePage";
import { NotFoundPage } from "./components/NotFoundPage";
import { getAuthData, isAdmin, isFarmer } from "./utils/authUtils";

// Protected Route Component for Farmers
function FarmerRoute({ children }: { children: React.ReactNode }) {
  if (!isFarmer()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Protected Route Component for Admins
function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Root redirect based on auth state
function RootRedirect() {
  const auth = getAuthData();
  
  if (!auth) {
    return <LoginPage />;
  }
  
  if (auth.userType === 'farmer') {
    return <Navigate to="/farmer/home" replace />;
  }
  
  if (auth.userType === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/farmer",
    element: (
      <FarmerRoute>
        <FarmerLayout />
      </FarmerRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/farmer/home" replace />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "crop-data",
        element: <CropDataPage />,
      },
      {
        path: "disease",
        element: <DiseasePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "contact-admin",
        element: <MessagesPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "farmers",
        element: <AllFarmers />,
      },
      {
        path: "register-farmer",
        element: <RegisterFarmer />,
      },
      {
        path: "add-harvest",
        element: <AddHarvest />,
      },
      {
        path: "harvest-history",
        element: <HarvestHistory />,
      },
      {
        path: "reports",
        element: <AdminReports />,
      },
      {
        path: "profile",
        element: <AdminProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
