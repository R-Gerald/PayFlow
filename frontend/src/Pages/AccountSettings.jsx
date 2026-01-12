// src/Pages/AccountSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAuthenticated } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Lock } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// On ajoute le token à ce client aussi (par sécurité)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("payflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [merchantName, setMerchantName] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("");

  // Rediriger si non authentifié
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Charger les infos du merchant depuis localStorage
  useEffect(() => {
    const name = localStorage.getItem("payflow_merchant_name");
    const phone = localStorage.getItem("payflow_merchant_phone"); // si tu le stockes, sinon prends depuis token ou laisse vide
    setMerchantName(name || "Mon compte");
    setMerchantPhone(phone || "");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirm) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/me/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess("Mot de passe modifié avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("L'ancien mot de passe est incorrect.");
      } else {
        setError("Erreur lors du changement de mot de passe.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5"
      >
        {/* Titre */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 text-center">
            Paramètres du compte
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 text-center">
            Gérez les informations de votre compte et votre mot de passe.
          </p>
        </div>

        {/* Infos merchant */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {merchantName}
            </p>
            {merchantPhone && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {merchantPhone}
              </p>
            )}
          </div>
        </div>

        {/* Formulaire changement de mot de passe */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Ancien mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 border border-red-100 rounded-md py-1 mt-1">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 text-center bg-emerald-50 border border-emerald-100 rounded-md py-1 mt-1">
              {success}
            </p>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? "Modification..." : "Changer le mot de passe"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}