import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, TrendingUp, Wallet, Users, PieChart as PieChartIcon,
  Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Statistics() {
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list()
  });

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount || 0);
  };

  // Calculate statistics
  const totalDue = clients.reduce((sum, c) => sum + (c.total_due || 0), 0);
  const totalPayments = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalDebts = transactions
    .filter(t => t.type === 'debt')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const clientsWithDebt = clients.filter(c => c.total_due > 0).length;
  const clientsPaid = clients.filter(c => c.total_due === 0).length;

  // Top debtors
  const topDebtors = [...clients]
    .filter(c => c.total_due > 0)
    .sort((a, b) => (b.total_due || 0) - (a.total_due || 0))
    .slice(0, 5);

  // Pie chart data
  const pieData = [
    { name: 'Récupéré', value: totalPayments, color: '#10B981' },
    { name: 'En attente', value: totalDue, color: '#F59E0B' }
  ].filter(d => d.value > 0);

  const isLoading = loadingClients || loadingTransactions;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Statistiques</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Vue d'ensemble de vos crédits</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 sm:p-5 border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-amber-100 text-xs sm:text-sm">Total dû</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{formatAmount(totalDue)} Ar</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 sm:p-5 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-emerald-100 text-xs sm:text-sm">Récupéré</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{formatAmount(totalPayments)} Ar</p>
            </Card>
          </motion.div>
        </div>

        {/* Client Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-5 mb-6 sm:mb-8 border-0 bg-white/80">
            <h3 className="font-semibold text-sm sm:text-base text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              Répartition des clients
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">{clients.length}</p>
                <p className="text-xs sm:text-sm text-slate-500">Total</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">{clientsWithDebt}</p>
                <p className="text-xs sm:text-sm text-slate-500">Avec crédit</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{clientsPaid}</p>
                <p className="text-xs sm:text-sm text-slate-500">À jour</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Chart */}
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 sm:p-5 mb-6 sm:mb-8 border-0 bg-white/80">
              <h3 className="font-semibold text-sm sm:text-base text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                Répartition des montants
              </h3>
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${formatAmount(value)} Ar`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Top Debtors */}
        {topDebtors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 sm:p-5 border-0 bg-white/80">
              <h3 className="font-semibold text-sm sm:text-base text-slate-800 mb-3 sm:mb-4">
                Top 5 - Plus gros crédits
              </h3>
              <div className="space-y-3">
                {topDebtors.map((client, index) => (
                  <Link 
                    key={client.id}
                    to={createPageUrl(`ClientDetail?id=${client.id}`)}
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-800">{client.name}</span>
                      </div>
                      <span className="font-semibold text-amber-600">
                        {formatAmount(client.total_due)} Ar
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}