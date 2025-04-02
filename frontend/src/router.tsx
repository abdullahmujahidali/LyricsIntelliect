import { useAuth } from "@/context/AuthContext";
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";

const HomePage = lazy(() => import("@/views/HomePage"));
const LoginPage = lazy(() => import("@/views/LoginPage"));
const RegisterPage = lazy(() => import("@/views/RegisterPage"));
const SongsPage = lazy(() => import("@/views/songs/SongsPage"));
const SongDetailPage = lazy(() => import("@/views/songs/SongDetailPage"));

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
        {
          path: "songs",
          element: (
            <Suspense fallback={<Loading />}>
              <SongsPage />
            </Suspense>
          ),
        },
        {
          path: "songs/:id",
          element: (
            <Suspense fallback={<Loading />}>
              <SongDetailPage />
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
