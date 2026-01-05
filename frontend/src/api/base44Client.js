// src/api/base44Client.js
import clientsData from "@/Entities/Client.json";
import transactionsData from "@/Entities/Transaction.json";

// On travaille avec des tableaux en mémoire
let clients = [];
let transactions = [];

// petit init si tu veux mettre des données par défaut plus tard
// pour l’instant ils restent vides

function generateId() {
  // ID simple côté front
  return Math.random().toString(36).slice(2);
}

export const base44 = {
  entities: {
    Client: {
      // renvoie la liste des clients
      async list() {
        return clients;
      },

      // crée un client
      async create(data) {
        const newClient = {
          id: generateId(),
          total_due: 0,
          ...data,
        };
        clients.push(newClient);
        return newClient;
      },
    },

    Transaction: {
      // renvoie la liste des transactions
      async list() {
        return transactions;
      },

      // crée une transaction et met à jour le total_due du client
      async create(data) {
        const newTransaction = {
          id: generateId(),
          date: new Date().toISOString().slice(0, 10),
          ...data,
        };
        transactions.push(newTransaction);

        const client = clients.find(c => c.id === data.client_id);
        if (client) {
          if (data.type === "debt") {
            client.total_due += data.amount || 0;
          } else if (data.type === "payment") {
            client.total_due -= data.amount || 0;
          }
        }
        return newTransaction;
      },
    },
  },
};