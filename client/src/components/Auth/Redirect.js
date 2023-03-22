import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
const Redirect = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/Login" state={{ from: location.pathname }} />
  );
};

export default Redirect;
