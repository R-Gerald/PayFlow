import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, FileText, Loader2 } from "lucide-react";

export default function AddClientDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    await onSubmit({
      ...formData,
      total_due: 0,
    });
    setLoading(false);
    setFormData({ name: "", phone: "", note: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Nouveau client
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            Ajoutez un client pour suivre facilement ses crédits et ses
            paiements dans PayFlow.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom du client <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                placeholder="Ex : Rakoto Jean"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Téléphone <span className="text-slate-400 text-[11px]">(optionnel)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                placeholder="Ex : 034 12 345 67"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Utile pour vous rappeler qui contacter en cas de retard.
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Note interne{" "}
              <span className="text-slate-400 text-[11px]">(optionnel)</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="note"
                placeholder="Ex : Habitué, paie généralement en fin de mois."
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          {/* Bouton */}
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800"
            disabled={loading || !formData.name.trim()}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Ajouter le client
          </Button>

          <p className="text-[11px] text-slate-400 text-center mt-1">
            Vous pourrez ajouter ses dettes et paiements juste après la
            création.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}