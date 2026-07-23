import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthSession } from "../../utils/authSession";

const loginPathFor = (roles) => {
  if (roles.includes("owner")) return "/ownerLogin";
  if (roles.includes("operator")) return "/operatorLogin";
  return "/adminLogin";
};

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const hasAccess = allowedRoles.some((role) => Boolean(getAuthSession(role)));

  if (!hasAccess) {
    return <Navigate to={loginPathFor(allowedRoles)} replace state={{ from: location.pathname, authMessage: "Please sign in to continue." }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
