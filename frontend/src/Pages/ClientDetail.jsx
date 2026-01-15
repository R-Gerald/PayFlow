// src/Pages/ClientDetail.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/baseClientbyG";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

import {
  Phone,
  FileText,
  ChevronLeft,
  Plus,
  CreditCard,
  Loader2,
  Trash2,
  Edit,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TransactionItem from "@/components/transactions/TransactionItem";
import AddDebtDialog from "@/components/transactions/AddDebtDialog";
import AddPaymentDialog from "@/components/transactions/AddPaymentDialog";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetail() {
  const { id } = useParams();
  const clientId = id ? Number(id) : null;

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // États pour l'édition
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const{toast}=useToast();

  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  // Charger le client courant
  const {
    data: client,
    isLoading: loadingClient,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const allClients = await base44.entities.Client.list();
      return allClients.find((c) => c.id === clientId);
    },
    enabled: clientId != null,
  });

  // Sync des champs d'édition quand le client est chargé
  useEffect(() => {
    if (client) {
      setEditName(client.name || "");
      setEditPhone(client.phone || "");
      setEditNotes(client.notes || client.note || "");
    }
  }, [client]);

  // Charger les transactions du client
  const {
    data: transactions = [],
    isLoading: loadingTransactions,
  } = useQuery({
    queryKey: ["transactions", clientId,fromDate,toDate],
    queryFn: async () => {
      const allTransactions = await base44.entities.Transaction.list({
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      return allTransactions
        .filter((t) => t.client_id === clientId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    enabled: clientId != null,
  });

 // Création d'une transaction (dette ou paiement)
const createTransactionMutation = useMutation({
  mutationFn: async (data) => {
    await base44.entities.Transaction.create({
      ...data,
      client_id: clientId,
    });
  },
  // variables = data passé à mutate/mutateAsync
  onSuccess: (_data, variables) => {
    queryClient.invalidateQueries({ queryKey: ["client", clientId] });
    queryClient.invalidateQueries({ queryKey: ["transactions", clientId] });
    queryClient.invalidateQueries({ queryKey: ["clients"] });

    const isPayment = variables.type === "payment";
    const amount = variables.amount || 0;

    if (isPayment) {
      toast({
        title: "Paiement enregistré",
        description: `Un paiement de ${new Intl.NumberFormat("fr-MG").format(
          amount
        )} Ar a été enregistré pour ${client.name}.`,
      });
    } else {
      // type === "debt"
      toast({
        title: "Dette ajoutée",
        description: `Une dette de ${new Intl.NumberFormat("fr-MG").format(
          amount
        )} Ar a été ajoutée pour ${client.name}.`,
      });
    }
  },
  onError: () => {
    toast({
      title: "Erreur",
      description: "La transaction n'a pas pu être enregistrée.",
      variant: "destructive",
    });
  },
});
  // Mise à jour du client
  const updateClientMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Client.update(clientId, {
        name: editName,
        phone: editPhone,
        notes: editNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowEditDialog(false);
      toast({
        title: "Client mis à jour",
        description: "Les informations du client ont été modifiées.",
      });
    },
     onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client.",
        variant: "destructive",
      });
    },
  });

  // Suppression du client
  const deleteClientMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Client.delete(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigate(createPageUrl("Home"), { replace: true });
      toast({
        title: "Client supprimé",
        description: `Le client "${client.name}" a été supprimé.`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client.",
        variant: "destructive",
      });
    },
  });

  const exportCSV = () => {
  if (!transactions.length) return;

  const data = transactions.map((t) => ({
    Date: new Date(t.date).toLocaleDateString("fr-FR"),
    Type: t.type === "debt" ? "Dette" : "Paiement",
    Montant: t.amount,
    Description: t.description || "",
  }));

  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `transactions_${client.name}_${fromDate || "all"}_${toDate || "all"}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const formatAr = (value) => {
  if (value === null || value === undefined) return "0 Ar";

  return `${Number(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
};

const exportPDF = () => {
  if (!transactions.length) return;

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Historique des transactions`, 14, 15);
  doc.setFontSize(10);
  doc.text(`Client : ${client.name}`, 14, 22);

  if (fromDate || toDate) {
    doc.text(
      `Période : ${fromDate || "..."} → ${toDate || "..."}`,
      14,
      28
    );
  }

  autoTable(doc, {
    startY: 34,
    head: [["Date", "Type", "Montant (Ar)", "Description"]],
    body: transactions.map((t) => [
      new Date(t.date).toLocaleDateString("fr-FR"),
      t.type === "debt" ? "Dette" : "Paiement",
      formatAr(t.amount),
      t.description || "",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  doc.save(
    `transactions_${client.name}_${fromDate || "all"}_${toDate || "all"}.pdf`
  );
};


  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-MG").format(amount || 0);
  };

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Client non trouvé</p>
          <Link to={createPageUrl("Home")}>
            <Button className="mt-4">Retour</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-24">
        {/* Header simple */}
        <div className="flex items-center mb-4 sm:mb-6">
          <Link to={createPageUrl("Clients")}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="ml-2 sm:ml-4">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-800">
              {client.name}
            </h1>
            {client.phone && (
              <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </p>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 sm:p-6 mb-4 sm:mb-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
            <p className="text-slate-400 text-xs sm:text-sm">Solde dû</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">
              {formatAmount(client.total_due)}{" "}
              <span className="text-base sm:text-xl">Ar</span>
            </p>
            {(client.note || client.notes) && (
              <p className="text-slate-400 text-xs sm:text-sm mt-2 sm:mt-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="truncate">
                  {client.note || client.notes}
                </span>
              </p>
            )}
          </Card>
        </motion.div>

        {/* Actions client : Modifier / Supprimer */}
        <div className="flex justify-end gap-2 mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>

        {/* Boutons Ajouter dette / paiement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Button
            className="h-12 sm:h-14 bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base"
            onClick={() => setShowAddDebt(true)}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Ajouter une dette
          </Button>
          <Button
            className="h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white text-sm sm:text-base"
            onClick={() => setShowAddPayment(true)}
            disabled={!client.total_due || client.total_due <= 0}
          >
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Enregistrer paiement
          </Button>
        </div>

        {/* Transactions History */}
        <div>
{/* Header de la section Historique + bouton filtre */}
<div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
  <h2 className="text-base sm:text-lg font-semibold text-slate-800">
    Historique
  </h2>

 <div className="flex items-center gap-1.5 sm:gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={exportCSV}
    className="h-7 px-2 text-xs"
  >
    <Download className="h-3.5 w-3.5 mr-1" />
    CSV
  </Button>

  <Button
    variant="outline"
    size="sm"
    onClick={exportPDF}
    className="h-7 px-2 text-xs"
  >
    <Download className="h-3.5 w-3.5 mr-1" />
    PDF
  </Button>

  <Button
    variant="outline"
    size="sm"
    className="flex items-center gap-1 text-[11px] sm:text-xs h-7 px-2 sm:px-3"
    onClick={() => setShowFilterDialog(true)}
  >
    <Calendar className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Filtrer</span>
  </Button>
</div>

</div>
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : transactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white/50 rounded-xl"
                >
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucune transaction</p>
                </motion.div>
              ) : (
                transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <TransactionItem transaction={transaction} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dialogs ajout dette/paiement */}
        <AddDebtDialog
          open={showAddDebt}
          onOpenChange={setShowAddDebt}
          onSubmit={(data) => createTransactionMutation.mutateAsync(data)}
          clientName={client.name}
        />

        <AddPaymentDialog
          open={showAddPayment}
          onOpenChange={setShowAddPayment}
          onSubmit={(data) => createTransactionMutation.mutateAsync(data)}
          clientName={client.name}
          maxAmount={client.total_due}
        />

        {/* Dialog filtre période */}
<AlertDialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Filtrer par période</AlertDialogTitle>
      <AlertDialogDescription>
        Sélectionnez une période pour afficher uniquement les transactions
        correspondantes. Vous pouvez laisser l’une des deux dates vide.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="space-y-3 py-2">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <label className="block text-xs text-slate-600 mb-1">
            Du
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-600 mb-1">
            Au
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          />
        </div>
      </div>
      {(fromDate || toDate) && (
        <Button
          variant="outline"
          size="sm"
          className="mt-1 text-xs"
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
        >
          Réinitialiser la période
        </Button>
      )}
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => {
          setShowFilterDialog(false);
        }}
      >
        Appliquer le filtre
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

        {/* Dialog édition client */}
        <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Modifier le client</AlertDialogTitle>
              <AlertDialogDescription>
                Modifiez les informations du client puis enregistrez.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  rows={3}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateClientMutation.mutate()}
              >
                {updateClientMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Enregistrer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog suppression client */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera définitivement le client "
                {client.name}" et tout son historique de transactions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteClientMutation.mutate()}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteClientMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}