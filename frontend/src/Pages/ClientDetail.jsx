import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, Phone, FileText, ChevronLeft, Plus, CreditCard, 
  Loader2, MoreVertical, Trash2, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function ClientDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const allClients = await base44.entities.Client.list();
      return allClients.find(c => c.id === clientId);
    },
    enabled: !!clientId
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions', clientId],
    queryFn: async () => {
      const allTransactions = await base44.entities.Transaction.list();
      return allTransactions
        .filter(t => t.client_id === clientId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    enabled: !!clientId
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Transaction.create({
        ...data,
        client_id: clientId
      });
      
      // Update client total
      const newTotal = data.type === 'debt'
        ? (client.total_due || 0) + data.amount
        : (client.total_due || 0) - data.amount;
      
      await base44.entities.Client.update(clientId, {
        total_due: Math.max(0, newTotal)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async () => {
      // Delete all transactions first
      for (const t of transactions) {
        await base44.entities.Transaction.delete(t.id);
      }
      await base44.entities.Client.delete(clientId);
    },
    onSuccess: () => {
      window.location.href = createPageUrl('Home');
    }
  });

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount || 0);
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
          <Link to={createPageUrl('Home')}>
            <Button className="mt-4">Retour</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-800 truncate">{client.name}</h1>
              {client.phone && (
                <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
            <p className="text-slate-400 text-xs sm:text-sm">Solde dû</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">
              {formatAmount(client.total_due)} <span className="text-base sm:text-xl">Ar</span>
            </p>
            {client.note && (
              <p className="text-slate-400 text-xs sm:text-sm mt-2 sm:mt-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="truncate">{client.note}</span>
              </p>
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
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
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Historique</h2>
          
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
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera définitivement le client "{client.name}" et tout son historique de transactions.
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