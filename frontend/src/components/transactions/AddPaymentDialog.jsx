// src/components/transactions/AddPaymentDialog.jsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/baseClientbyG";
import { useToast } from "@/hooks/use-toast";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  FileText,
  CalendarIcon,
  Wallet,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AddPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  clientName,
  maxAmount,
  clientId,
}) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date(),
    payment_method: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // allocations: { creditId: number -> montant alloué }
  const [allocations, setAllocations] = useState({});

  // Charger les crédits de ce client (pour la répartition du paiement)
  const {
    data: credits = [],
    isLoading: loadingCredits,
  } = useQuery({
    queryKey: ["client-credits", clientId],
    queryFn: () => base44.entities.Transaction.listCreditsByClient(clientId),
    enabled: open && !!clientId,
  });

  useEffect(() => {
    if (!open) {
      // reset du formulaire et des allocations quand on ferme
      setFormData({
        amount: "",
        description: "",
        date: new Date(),
        payment_method: "",
      });
      setAllocations({});
      setLoading(false);
    }
  }, [open]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-MG").format(amount || 0);
  };

  const handleChangeAllocation = (creditId, value) => {
    const num = Number(
      String(value).replace(/\s/g, "").replace(",", ".")
    );

    const credit = credits.find((c) => c.id === creditId);
    const remaining = credit ? Number(credit.remaining_amount ?? 0) : 0;

    let finalValue = isNaN(num) ? 0 : num;
    console.log("[DEBUG UI] change allocation", { creditId, value, finalValue, remaining });

    if (credit && finalValue > remaining) {
      finalValue = remaining;
      toast({
        title: "Montant trop élevé",
        description: `Vous ne pouvez pas allouer plus que le reste dû sur ce crédit (${formatAmount(
          remaining
        )} Ar).`,
        variant: "destructive",
      });
    }

    setAllocations((prev) => ({
      ...prev,
      [creditId]: finalValue,
    }));
  };

  const totalAllocated = Object.values(allocations).reduce(
    (sum, v) => sum + (v || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;

    const paymentAmount = parseFloat(formData.amount);

    const allocationArray = Object.entries(allocations)
      .filter(([_, v]) => v && v > 0)
      .map(([creditId, v]) => ({
        creditId: Number(creditId),
        amount: v,
      }));

    if (totalAllocated > paymentAmount) {
      toast({
        title: "Répartition invalide",
        description:
          "Le total réparti sur les crédits dépasse le montant du paiement.",
        variant: "destructive",
      });
      return;
    }

    console.log("[DEBUG UI] payload payment", {
    type: "payment",
    amount: paymentAmount,
    description: formData.description,
    date: format(formData.date, "yyyy-MM-dd"),
    payment_method: formData.payment_method,
    allocations: allocationArray,
  });

    setLoading(true);
    try {
      await onSubmit({
        type: "payment",
        amount: paymentAmount,
        description: formData.description,
        date: format(formData.date, "yyyy-MM-dd"),
        payment_method: formData.payment_method,
        allocations: allocationArray,
      });
      onOpenChange(false);
      setFormData({
        amount: "",
        description: "",
        date: new Date(),
        payment_method: "",
      });
      setAllocations({});
    } finally {
      setLoading(false);
    }
  };

  // Sécurité UI: ne jamais montrer un crédit dont le remaining_amount <= 0
  const visibleCredits = credits.filter(
    (c) => c.remaining_amount != null && c.remaining_amount > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Enregistrer un paiement
            {clientName && (
              <span className="text-slate-500 font-normal ml-2">
                • {clientName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {maxAmount > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-sm text-slate-500">Solde actuel</p>
            <p className="text-xl font-bold text-amber-600">
              {formatAmount(maxAmount)} Ar
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Montant payé */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Montant payé (Ar) *
            </Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="pl-10 text-lg font-semibold"
                required
                min="1"
              />
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mode de paiement</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                setFormData({ ...formData, payment_method: value })
              }
            >
              <SelectTrigger>
                <Wallet className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "dd/MM/yyyy", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) =>
                    date && setFormData({ ...formData, date })
                  }
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Note
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="description"
                placeholder="Ex: Règlement partiel, reste à payer..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="pl-10 min-h-[60px]"
              />
            </div>
          </div>

          {/* Répartition par crédit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Répartition du paiement par crédit (optionnel)
              </Label>
              <span className="text-[11px] text-slate-500">
                Total réparti :{" "}
                <span
                  className={
                    totalAllocated > Number(formData.amount || 0)
                      ? "text-red-600 font-semibold"
                      : "font-semibold"
                  }
                >
                  {formatAmount(totalAllocated || 0)} Ar
                </span>
              </span>
            </div>

            {loadingCredits ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : visibleCredits.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucun crédit trouvé pour ce client.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-slate-50">
                {visibleCredits.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 text-xs bg-white px-2 py-1.5 rounded border border-slate-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">
                        Crédit #{c.id} —{" "}
                        {formatAmount(c.remaining_amount)} Ar
                      </p>
                      {c.due_date && (
                        <p className="text-[11px] text-slate-500">
                          Échéance :{" "}
                          {new Date(c.due_date).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {c.description && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={allocations[c.id] ?? ""}
                        onChange={(e) =>
                          handleChangeAllocation(c.id, e.target.value)
                        }
                        className="h-7 text-[11px]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={
              loading ||
              !formData.amount ||
              Number(formData.amount) <= 0 ||
              totalAllocated > Number(formData.amount || 0)
            }
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Enregistrer le paiement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}