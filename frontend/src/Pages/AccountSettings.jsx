// src/Pages/AccountSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

import { isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { User, Phone, Lock, Bell, Loader2 } from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("payflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AccountSettings() {
  const { toast } = useToast();

  // Sécurité
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorPwd, setErrorPwd] = useState("");
  const [successPwd, setSuccessPwd] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  // Merchant
  const [merchantName, setMerchantName] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("");

  // Rappels de paiement
  const [remEnabled, setRemEnabled] = useState(true);
  const [dueSoonDaysBefore, setDueSoonDaysBefore] = useState(0);
  const [overdueDays1, setOverdueDays1] = useState(3);
  const [overdueDays2, setOverdueDays2] = useState(7);
  const [loadingRem, setLoadingRem] = useState(false);
  const [savingRem, setSavingRem] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Charger l’identité merchant depuis localStorage
  useEffect(() => {
    const name = localStorage.getItem("payflow_merchant_name");
    const phone = localStorage.getItem("payflow_merchant_phone") || "";
    setMerchantName(name || "Mon compte");
    setMerchantPhone(phone);
  }, []);

  // Charger les réglages de rappels
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingRem(true);
        const res = await api.get("/me/reminder-settings");
        const data = res.data;
        setRemEnabled(data.enabled);
        setDueSoonDaysBefore(data.dueSoonDaysBefore ?? 0);
        setOverdueDays1(data.overdueDays1 ?? 3);
        setOverdueDays2(data.overdueDays2 ?? 7);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erreur lors du chargement",
          description:
            "Impossible de charger les réglages de rappel pour le moment.",
          variant: "destructive",
        });
      } finally {
        setLoadingRem(false);
      }
    };
    fetchSettings();
  }, [toast]);

  // Formulaire mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorPwd("");
    setSuccessPwd("");

    if (newPassword !== confirm) {
      setErrorPwd("Les deux nouveaux mots de passe ne correspondent pas.");
      toast({
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez saisir deux fois le même nouveau mot de passe.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPwd(true);
    try {
      await api.post("/me/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccessPwd("Mot de passe modifié avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setErrorPwd("L'ancien mot de passe est incorrect.");
        toast({
          title: "Ancien mot de passe incorrect",
          description: "Veuillez vérifier votre ancien mot de passe.",
          variant: "destructive",
        });
      } else {
        setErrorPwd("Erreur lors du changement de mot de passe.");
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors du changement de mot de passe.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingPwd(false);
    }
  };

  // Formulaire rappels
  const handleReminderSave = async (e) => {
    e.preventDefault();
    setSavingRem(true);
    try {
      const payload = {
        enabled: remEnabled,
        dueSoonDaysBefore: Number(dueSoonDaysBefore) || 0,
        overdueDays1: Number(overdueDays1) || 0,
        overdueDays2: Number(overdueDays2) || 0,
      };

      await api.put("/me/reminder-settings", payload);

      toast({
        title: "Rappels mis à jour",
        description: "Les réglages de rappel de paiement ont été enregistrés.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description:
          "Impossible d'enregistrer les réglages de rappel pour le moment.",
        variant: "destructive",
      });
    } finally {
      setSavingRem(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Container global centré, avec padding suffisant pour header/footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* En-tête de page */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Paramètres du compte
            </h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Sécurité, informations personnelles et rappels de paiement.
            </p>
          </div>

          {/* Carte identité merchant */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
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

          {/* Sections principales */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Carte Sécurité */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Sécurité
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Modifiez votre mot de passe pour sécuriser l’accès à
                    PayFlow.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-3 text-sm flex-1 flex flex-col"
              >
                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Ancien mot de passe
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                </div>

                {errorPwd && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md py-1 px-2">
                    {errorPwd}
                  </p>
                )}
                {successPwd && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md py-1 px-2">
                    {successPwd}
                  </p>
                )}

                <div className="pt-2 mt-auto">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingPwd}
                  >
                    {loadingPwd ? "Modification..." : "Changer le mot de passe"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Carte Rappels de paiement */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Rappels de paiement
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Configurez automatiquement les rappels liés aux échéances de
                    paiement.
                  </p>
                </div>
              </div>

              {loadingRem ? (
                <div className="flex-1 flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <form
                  onSubmit={handleReminderSave}
                  className="space-y-3 text-sm flex-1 flex flex-col"
                >
                  {/* Activation */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700">
                      Activer les rappels
                    </span>
                    <Switch
                      checked={remEnabled}
                      onCheckedChange={setRemEnabled}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Si désactivé, aucun nouveau rappel ne sera généré. Les
                    anciens rappels restent visibles dans l’historique.
                  </p>

                  {/* Jours avant échéance */}
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-700">
                      Jours avant échéance
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={dueSoonDaysBefore}
                      onChange={(e) =>
                        setDueSoonDaysBefore(e.target.value ?? 0)
                      }
                      className="h-8 text-xs"
                    />
                    <p className="text-[11px] text-slate-500">
                      Exemple : 0 = le jour de l’échéance, 1 = un jour avant,
                      2 = deux jours avant, etc.
                    </p>
                  </div>

                  {/* 1er rappel retard */}
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-700">
                      1er rappel de retard (jours)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={overdueDays1}
                      onChange={(e) => setOverdueDays1(e.target.value ?? 0)}
                      className="h-8 text-xs"
                    />
                    <p className="text-[11px] text-slate-500">
                      Exemple : 3 = rappel 3 jours après la date d’échéance
                      (J+3).
                    </p>
                  </div>

                  {/* 2e rappel retard */}
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-700">
                      2e rappel de retard (jours)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={overdueDays2}
                      onChange={(e) => setOverdueDays2(e.target.value ?? 0)}
                      className="h-8 text-xs"
                    />
                    <p className="text-[11px] text-slate-500">
                      Exemple : 7 = rappel 7 jours après la date d’échéance
                      (J+7).
                    </p>
                  </div>

                  {/* Bouton sauvegarde en bas de la carte */}
                  <div className="pt-2 mt-auto">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={savingRem}
                    >
                      {savingRem
                        ? "Enregistrement..."
                        : "Enregistrer les réglages"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}