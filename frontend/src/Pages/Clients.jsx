import React, { useState } from 'react';
import { base44 } from '@/api/baseClientbyG';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, ArrowUpDown, Loader2, ChevronLeft, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClientCard from "@/components/clients/ClientCard";
import AddClientDialog from "@/components/clients/AddClientDialog";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('amount');
  const [filterDebt, setFilterDebt] = useState('all');
  const [showAddClient, setShowAddClient] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list()
  });

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  // Check for overdue debts per client
  const clientOverdueStatus = {};
  transactions.forEach(t => {
    if (t.type === 'debt' && t.due_date && new Date(t.due_date) < new Date()) {
      clientOverdueStatus[t.client_id] = true;
    }
  });

  // Filter and sort clients
  const filteredClients = clients
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(c => {
      if (filterDebt === 'with_debt') return c.total_due > 0;
      if (filterDebt === 'overdue') return clientOverdueStatus[c.id];
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return (b.total_due || 0) - (a.total_due || 0);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Mes clients</h1>
            <p className="text-slate-500 text-xs sm:text-sm">{clients.length} clients au total</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 border-slate-200"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/80">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterDebt('all')}>
                Tous les clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDebt('with_debt')}>
                Avec crédit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDebt('overdue')}>
                En retard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortBy(sortBy === 'amount' ? 'name' : 'amount')}
            className="bg-white/80"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Clients List */}
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredClients.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchQuery ? 'Aucun client trouvé' : 'Aucun client'}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowAddClient(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un client
                </Button>
              </motion.div>
            ) : (
              filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ClientCard 
                    client={client}
                    hasOverdue={clientOverdueStatus[client.id]}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Floating Add Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40"
        >
          <Button
            size="lg"
            className="rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-lg bg-slate-900 hover:bg-slate-800"
            onClick={() => setShowAddClient(true)}
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </motion.div>

        {/* Add Client Dialog */}
        <AddClientDialog
          open={showAddClient}
          onOpenChange={setShowAddClient}
          onSubmit={(data) => createClientMutation.mutateAsync(data)}
        />
      </div>
    </div>
  );
}