import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setToken } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";



const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const{toast}=useToast();


  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      const { token, merchantId, name } = res.data;

      setToken(token);
      localStorage.setItem("payflow_merchant_id", merchantId);
      localStorage.setItem("payflow_merchant_name", name);
      localStorage.setItem("payflow_merchant_phone", phone);

      // Rediriger vers la page d'accueil
      navigate("/");
       toast({
          title: "Compte connecté ",
          description:
            `Ravis de vous revoir ${name}`,
        });
    } catch (err) {
      console.error(err);
      setError("Téléphone ou mot de passe incorrect.");
      toast({
          title: "Erreur",
          description:
            "Téléphone ou mot de passe incorrect.",
          variant: "destructive",
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Connexion PayFlow
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Téléphone
            </label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 0341234567"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Mot de passe
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="text-xs sm:text-sm text-slate-500 text-center mt-2">
        Pas encore de compte ?{" "}
        <Link to="/register" className="text-slate-800 font-semibold underline">
        S'inscrire
      </Link>
        </p>
      </div>
    </div>
  );
}