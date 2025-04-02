import { useAuth } from "@/context/AuthContext";
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import Loading from "./components/Loading";

const HomePage = lazy(() => import("@/views/HomePage"));
const LoginPage = lazy(() => import("@/views/LoginPage"));
const RegisterPage = lazy(() => import("@/views/RegisterPage"));

export function Router() {
  const { isAuthenticated } = useAuth();

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/login">
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: (
            <Suspense fallback={<Loading />}>
              <HomePage />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "/",
      element: (
        <ProtectedRoute isAllowed={!isAuthenticated} redirectTo="/">
          <AuthLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "login",
          element: (
            <Suspense fallback={<Loading />}>
              <LoginPage />
            </Suspense>
          ),
        },
        {
          path: "register",
          element: (
            <Suspense fallback={<Loading />}>
              <RegisterPage />
            </Suspense>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Router;
