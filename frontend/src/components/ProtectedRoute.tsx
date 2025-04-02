import { Navigate } from "react-router";

interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectTo: string;
  children: React.ReactNode;
}

const ProtectedRoute = ({
  isAllowed,
  redirectTo,
  children,
}: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
