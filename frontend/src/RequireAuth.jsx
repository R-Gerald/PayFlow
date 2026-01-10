// src/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Rediriger vers /login en gardant l'URL d'origine (optionnel)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}