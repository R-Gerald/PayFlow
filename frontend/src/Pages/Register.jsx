import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAuthenticated, setToken } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const{toast}=useToast();

  // Si déjà connecté, pas besoin de s'inscrire
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        phone,
        email,
        password,
      });

      const { token, merchantId, name: merchantName } = res.data;

      // Stocker le token comme au login
      setToken(token);
      localStorage.setItem("payflow_merchant_id", merchantId);
      localStorage.setItem("payflow_merchant_name", merchantName);
      localStorage.setItem("payflow_merchant_phone", phone);

      navigate("/");
       toast({
          title: "Compte creé ",
          description:
            `Bienvenue ${name}`,
        });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError("Ce numéro de téléphone est déjà utilisé.");
         toast({
          title: "Erreur",
          description:
            "Ce numéro de téléphone est déjà utilisé.",
          variant: "destructive",
        });
      } else {
        setError("Erreur lors de l'inscription. Vérifiez les champs.");
         toast({
          title: "Erreur",
          description:
            "Erreur lors de l'inscription. Vérifiez les champs.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Créer un compte PayFlow
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Nom du commerçant
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boutik Anjara"
              required
            />
          </div>

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
              Email (optionnel)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="merchant@example.com"
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
            {loading ? "Inscription..." : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-xs sm:text-sm text-slate-500 text-center">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-slate-800 font-semibold underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}