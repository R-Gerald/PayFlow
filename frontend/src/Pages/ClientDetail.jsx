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
  Download,
  User,
  TrendingDown,
  TrendingUp,
  Filter,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  Sparkles,
  ChevronRight,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [activeTab, setActiveTab] = useState("transactions");

  // Détails d'un crédit
  const [selectedCreditId, setSelectedCreditId] = useState(null);
  const [showCreditDetails, setShowCreditDetails] = useState(false);

  // États pour l'édition
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fonction helper calculée
  const calculateAveragePaymentDelay = React.useCallback((transactions) => {
    const payments = transactions.filter(t => t.type === 'payment');
    if (payments.length === 0) return 0;
    
    let totalDelay = 0;
    let count = 0;
    
    payments.forEach(payment => {
      // Find corresponding debt
      const debt = transactions.find(t => 
        t.type === 'debt' && 
        t.amount === payment.amount && 
        new Date(t.date) < new Date(payment.date)
      );
      
      if (debt) {
        const debtDate = new Date(debt.date);
        const paymentDate = new Date(payment.date);
        const delay = Math.floor((paymentDate - debtDate) / (1000 * 60 * 60 * 24));
        totalDelay += delay;
        count++;
      }
    });
    
    return count > 0 ? Math.floor(totalDelay / count) : 0;
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-MG").format(amount || 0);
  };

  const formatAr = (value) => {
    if (value === null || value === undefined) return "0 Ar";
    return `${Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
  };

  const getRiskLevel = (balance, avgDelay) => {
    if (balance <= 0) return { level: "low", label: "À jour", color: "text-emerald-600", bg: "bg-emerald-100" };
    if (balance < 50000 && avgDelay < 15) return { level: "low", label: "Faible risque", color: "text-emerald-600", bg: "bg-emerald-100" };
    if (balance < 200000 && avgDelay < 30) return { level: "medium", label: "Risque modéré", color: "text-amber-600", bg: "bg-amber-100" };
    return { level: "high", label: "Risque élevé", color: "text-red-600", bg: "bg-red-100" };
  };

  // Charger le client courant
  const {
    data: client,
    isLoading: loadingClient,
    error: clientError,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const allClients = await base44.entities.Client.list();
      return allClients.find((c) => c.id === clientId);
    },
    enabled: clientId != null,
    retry: 2,
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
    queryKey: ["transactions", clientId, fromDate, toDate],
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

  // Statistiques calculées
  const stats = React.useMemo(() => {
    const totalDebt = transactions
      .filter(t => t.type === "debt")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalPaid = transactions
      .filter(t => t.type === "payment")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const currentBalance = totalDebt - totalPaid;
    const paymentRate = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 100;
    
    const avgPaymentDelay = calculateAveragePaymentDelay(transactions);
    
    return {
      totalDebt,
      totalPaid,
      currentBalance,
      paymentRate,
      avgPaymentDelay,
      transactionCount: transactions.length,
    };
  }, [transactions, calculateAveragePaymentDelay]);

  // Crédits avec reste dû
  const {
    data: creditsWithRemaining = [],
    isLoading: loadingCreditsRemaining,
  } = useQuery({
    queryKey: ["client-credits-overview", clientId],
    queryFn: () => base44.entities.Transaction.listCreditsByClient(clientId),
    enabled: clientId != null,
  });

  const openCredits = creditsWithRemaining.filter(
    (c) => c.remaining_amount != null && c.remaining_amount > 0
  );

  // Historique des paiements pour le crédit sélectionné
  const {
    data: creditPayments = [],
    isLoading: loadingCreditPayments,
  } = useQuery({
    queryKey: ["credit-payments", selectedCreditId],
    queryFn: () =>
      base44.entities.Transaction.getCreditPaymentHistory(selectedCreditId),
    enabled: selectedCreditId != null && showCreditDetails,
  });

  // Création d'une transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Transaction.create({
        ...data,
        client_id: clientId,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["customers-overdue"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["client-credits", clientId] });
      queryClient.invalidateQueries({
        queryKey: ["client-credits-overview", clientId],
      });

      const isPayment = variables.type === "payment";
      const amount = variables.amount || 0;

      toast({
        title: isPayment ? "✅ Paiement enregistré" : "📝 Dette ajoutée",
        description: `${isPayment ? 'Un paiement' : 'Une dette'} de ${formatAmount(amount)} a été enregistré${isPayment ? '' : 'e'} pour ${client.name}.`,
      });
    },
    onError: () => {
      toast({
        title: "❌ Erreur",
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
      queryClient.invalidateQueries({ queryKey: ["customers-overdue"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      setShowEditDialog(false);
      toast({
        title: "✅ Client mis à jour",
        description: "Les informations ont été modifiées avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erreur",
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
      queryClient.invalidateQueries({ queryKey: ["customers-overdue"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      navigate(createPageUrl("Home"), { replace: true });
      toast({
        title: "🗑️ Client supprimé",
        description: `"${client.name}" a été supprimé définitivement.`,
      });
    },
    onError: () => {
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le client.",
        variant: "destructive",
      });
    },
  });

  const exportCSV = () => {
    if (!transactions.length) {
      toast({ title: "Aucune donnée", description: "Aucune transaction à exporter.", variant: "destructive" });
      return;
    }

    const data = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString("fr-FR"),
      Type: t.type === "debt" ? "Dette" : "Paiement",
      Montant: t.amount,
      Description: t.description || "",
      Solde: t.balance || "",
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transactions_${client.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!transactions.length) {
      toast({ title: "Aucune donnée", description: "Aucune transaction à exporter.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`Rapport de transactions - ${client.name}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);
    
    if (fromDate || toDate) {
      doc.text(`Période : ${fromDate || "Début"} → ${toDate || "Aujourd'hui"}`, 14, 28);
    }

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Résumé", 14, 38);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Solde actuel : ${formatAr(stats.currentBalance)}`, 14, 46);
    doc.text(`Total dette : ${formatAr(stats.totalDebt)}`, 14, 52);
    doc.text(`Total payé : ${formatAr(stats.totalPaid)}`, 14, 58);
    doc.text(`Taux de paiement : ${stats.paymentRate.toFixed(1)}%`, 14, 64);

    autoTable(doc, {
      startY: 72,
      head: [["Date", "Type", "Montant (Ar)", "Description"]],
      body: transactions.map((t) => [
        new Date(t.date).toLocaleDateString("fr-FR"),
        t.type === "debt" ? "Dette" : "Paiement",
        formatAr(t.amount),
        t.description || "",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`transactions_${client.name}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin mx-auto" />
            <Shield className="h-6 w-6 text-slate-700 absolute inset-0 m-auto" />
          </div>
          <p className="text-slate-600 text-sm font-medium">Chargement des données client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Client introuvable</h2>
          <p className="text-slate-500 text-sm">Le client que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to={createPageUrl("Clients")}>
            <Button className="mt-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskLevel(stats.currentBalance, stats.avgPaymentDelay);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header principal */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Link to={createPageUrl("Clients")}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-slate-100 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-slate-900">
                        {client.name}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                        {client.phone && (
                          <p className="text-slate-600 text-sm flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {client.phone}
                          </p>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskInfo.bg} ${riskInfo.color}`}>
                          {riskInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Modifier</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAddDebt(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nouvelle dette</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Cartes principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte solde principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-slate-300 text-sm font-medium">Solde dû</p>
                      <p className="text-4xl font-bold mt-1">
                        {formatAmount(client.total_due)}
                        <span className="text-2xl ml-1">Ar</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Progression paiements</span>
                      <span className="text-sm font-medium">{stats.paymentRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${stats.paymentRate}%` }}
                      />
                    </div>
                  </div>

                  {(client.note || client.notes) && (
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                        <p className="text-slate-300 text-sm">{client.note || client.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="p-6 border border-slate-200 bg-white">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-700" />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm">Total dette</p>
                    <p className="text-xl font-semibold text-slate-900">{formatAmount(stats.totalDebt)} Ar</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm">Total payé</p>
                    <p className="text-xl font-semibold text-emerald-600">{formatAmount(stats.totalPaid)} Ar</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm">Transactions</p>
                    <p className="text-xl font-semibold text-slate-900">{stats.transactionCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm">Délai moyen</p>
                    <p className="text-xl font-semibold text-slate-900">{stats.avgPaymentDelay} jours</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Onglets personnalisés pour transactions/crédits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200">
                  <div className="flex space-x-1 px-6 pt-6">
                    <button
                      onClick={() => setActiveTab("transactions")}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all relative ${activeTab === "transactions" 
                        ? "text-slate-900 bg-white border border-slate-200 border-b-0" 
                        : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Transactions
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {transactions.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("credits")}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === "credits" 
                        ? "text-slate-900 bg-white border border-slate-200 border-b-0" 
                        : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Crédits actifs
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {openCredits.length}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "transactions" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">Historique des transactions</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilterDialog(true)}
                            className="h-8 gap-1"
                          >
                            <Filter className="h-3.5 w-3.5" />
                            <span className="text-xs">Filtrer</span>
                          </Button>

                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={exportCSV}
                              className="h-8 rounded-none border-r border-slate-200"
                            >
                              CSV
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={exportPDF}
                              className="h-8 rounded-none"
                            >
                              PDF
                            </Button>
                          </div>
                        </div>
                      </div>

                      {loadingTransactions ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                      ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500">Aucune transaction enregistrée</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setShowAddDebt(true)}
                          >
                            Créer une première dette
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <AnimatePresence>
                            {transactions.map((transaction, index) => (
                              <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <TransactionItem transaction={transaction} />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "credits" && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900">Crédits en cours</h4>
                      
                      {loadingCreditsRemaining ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                      ) : openCredits.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="h-8 w-8 text-amber-400" />
                          </div>
                          <p className="text-slate-500">Aucun crédit en cours</p>
                          <p className="text-slate-400 text-sm mt-1">Toutes les dettes sont payées ou pas encore converties en crédit</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {openCredits.map((credit) => {
                            const total = credit.amount || 0;
                            const remaining = credit.remaining_amount || 0;
                            const paid = total - remaining;
                            const progress = total > 0 ? (paid / total) * 100 : 0;
                            const isDueSoon = credit.due_date && 
                              new Date(credit.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                            const isOverdue = credit.due_date && 
                              new Date(credit.due_date) < new Date();

                            return (
                              <motion.div
                                key={credit.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01 }}
                                className="group cursor-pointer"
                                onClick={() => {
                                  setSelectedCreditId(credit.id);
                                  setShowCreditDetails(true);
                                }}
                              >
                                <Card className="p-4 border border-slate-200 hover:border-slate-300 transition-all">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium text-slate-900">Crédit #{credit.id}</h5>
                                        {isOverdue && (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                            En retard
                                          </span>
                                        )}
                                        {isDueSoon && !isOverdue && (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-300 text-amber-600 bg-amber-50">
                                            Bientôt dû
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-slate-500 text-sm mt-1">
                                        Créé le {new Date(credit.date).toLocaleDateString('fr-FR')}
                                        {credit.due_date && (
                                          <> • Échéance le {new Date(credit.due_date).toLocaleDateString('fr-FR')}</>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-slate-900">{formatAr(remaining)}</p>
                                      <p className="text-slate-500 text-sm">reste à payer</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                      <span>Payé : {formatAr(paid)}</span>
                                      <span>Total : {formatAr(total)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${isOverdue ? "bg-red-500" : isDueSoon ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>

                                  {credit.description && (
                                    <p className="text-slate-500 text-sm mt-3 line-clamp-1">
                                      {credit.description}
                                    </p>
                                  )}

                                  <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                                      Cliquer pour voir les paiements
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                  </div>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Colonne droite - Actions rapides et infos */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="p-6 border border-slate-200 bg-white">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowAddPayment(true)}
                    className="w-full justify-start h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-3"
                    disabled={!client.total_due || client.total_due <= 0}
                  >
                    <CreditCard className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Enregistrer paiement</p>
                      <p className="text-xs text-emerald-100">Solde disponible : {formatAmount(client.total_due)} Ar</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowAddDebt(true)}
                    className="w-full justify-start h-12 gap-3"
                  >
                    <TrendingDown className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Nouvelle dette</p>
                      <p className="text-xs text-slate-500">Ajouter un nouveau montant dû</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={exportPDF}
                    className="w-full justify-start h-12 gap-3"
                  >
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Exporter PDF</p>
                      <p className="text-xs text-slate-500">Rapport détaillé</p>
                    </div>
                  </Button>

                  <div className="h-px bg-slate-200 my-2" />

                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Supprimer le client</span>
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Prochaines échéances */}
            {openCredits.filter(c => c.due_date).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="p-6 border border-slate-200 bg-white">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-700" />
                    Prochaines échéances
                  </h3>
                  <div className="space-y-3">
                    {openCredits
                      .filter(c => c.due_date)
                      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                      .slice(0, 3)
                      .map((credit) => {
                        const daysUntilDue = Math.ceil(
                          (new Date(credit.due_date) - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        
                        return (
                          <div key={credit.id} className="p-3 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-900">Crédit #{credit.id}</p>
                                <p className="text-slate-500 text-xs">
                                  {new Date(credit.due_date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                daysUntilDue < 0 
                                  ? "bg-red-100 text-red-800" 
                                  : daysUntilDue <= 3 
                                  ? "border border-amber-300 text-amber-600 bg-amber-50"
                                  : "bg-slate-100 text-slate-800"
                              }`}>
                                {daysUntilDue < 0 ? 
                                  `${Math.abs(daysUntilDue)}j de retard` : 
                                  `${daysUntilDue}j restant`}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 mt-2">
                              {formatAr(credit.remaining_amount)}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Conseils */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="p-6 border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Recommandations
                </h3>
                <div className="space-y-3">
                  {riskInfo.level === "high" && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Risque élevé détecté</p>
                          <p className="text-xs text-red-700 mt-1">
                            Considérez un rappel client et une révision des conditions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stats.avgPaymentDelay > 30 && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">Délai de paiement long</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Délai moyen de {stats.avgPaymentDelay} jours. Pensez à des rappels automatiques.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.paymentRate > 80 && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-emerald-900">Bon payeur</p>
                          <p className="text-xs text-emerald-700 mt-1">
                            Taux de paiement de {stats.paymentRate.toFixed(1)}%. Vous pouvez proposer des conditions avantageuses.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
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
        clientId={clientId}
      />

      {/* Dialog filtre période */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrer par période
            </DialogTitle>
            <DialogDescription>
              Sélectionnez une période pour afficher les transactions correspondantes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
            </div>
            {(fromDate || toDate) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog édition client */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de contact et les notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                placeholder="Nom et prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                placeholder="+261 34 00 000 00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                rows={3}
                placeholder="Informations supplémentaires..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => updateClientMutation.mutate()}>
              {updateClientMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog suppression client */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Supprimer définitivement ce client ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Cette action est irréversible. Toutes les données associées seront perdues :
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Historique complet des transactions</li>
                <li>Crédits et échéances</li>
                <li>Statistiques et rapports</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientMutation.mutate()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteClientMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Oui, supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal détails crédit */}
      <Dialog open={showCreditDetails} onOpenChange={setShowCreditDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Historique des paiements - Crédit #{selectedCreditId}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto py-2">
            {loadingCreditPayments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : creditPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucun paiement spécifique enregistré</p>
                <p className="text-slate-400 text-sm mt-1">
                  Les paiements globaux non affectés n'apparaissent pas ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {creditPayments.map((payment, index) => (
                  <motion.div
                    key={payment.payment_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">
                          Paiement #{payment.payment_id}
                        </p>
                        <p className="font-semibold text-emerald-600">
                          {formatAr(payment.amount)}
                        </p>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">
                        {payment.date && new Date(payment.date).toLocaleDateString('fr-FR')}
                        {payment.payment_method && ` • ${payment.payment_method}`}
                      </p>
                      {payment.description && (
                        <p className="text-slate-600 text-sm mt-2">
                          {payment.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}