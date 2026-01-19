// src/api/base44Client.js
import axios from "axios";
import {getToken,clearToken} from "@/lib/auth";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

// Backend Spring Boot
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

 // Interceptor REQUEST: ajoute le JWT si présent
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor RESPONSE: gère 401/403 -> logout automatique
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      clearToken();
      localStorage.removeItem("payflow_merchant_id");
      localStorage.removeItem("payflow_merchant_name");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const base44 = {
  entities: {
    Client: {
      // Liste des clients du merchant connecté
      async list() {
        const res = await api.get(`/me/customers`);
        // Backend: CustomerDto { id, name, phone, notes, totalDue }
        return res.data.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          notes: c.notes,
          total_due: Number(c.totalDue ?? 0),
        }));
      },

      // Créer un client pour le merchant connecté
      async create(data) {
        // data vient du formulaire AddClientDialog : { name, phone, note }
        const payload = {
          name: data.name,
          phone: data.phone,
          notes: data.note ?? data.notes ?? "",
        };
        const res = await api.post(`/me/customers`, payload);
        return {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          notes: res.data.notes,
          total_due: 0,
        };
      },

      async update(id, data) {
        const payload = {
          name: data.name,
          phone: data.phone,
          notes: data.notes ?? data.note ?? "",
        };
        const res = await api.put(`/me/customers/${id}`, payload);
        return {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          notes: res.data.notes,
          total_due: Number(res.data.totalDue ?? 0),
        };
      },

      async delete(id) {
        await api.delete(`/me/customers/${id}`);
      },
       // Liste des clients en retard (IDs uniquement)
      async listOverdue() {
        const res = await api.get("/me/customers/overdue");
        // Backend retourne: List<Long>
        return res.data; // ex: [1, 4, 7]
      },

    },

    Transaction: {
      // Récupérer toutes les transactions du merchant connecté
      async list(params = {}) {
        const res = await api.get("/me/transactions", {
          params,
        });
        const mapped = res.data.map((t) => ({
          id: t.id,
          client_id: t.customerId,
          type: t.type === "PAYMENT" ? "payment" : "debt",
          amount: Number(t.amount ?? 0),
          description: t.description,
          date: t.transactionDate,
          due_date: t.dueDate,
          payment_method: t.paymentMethod,
        }));
        return mapped;
      },

      // Créer une nouvelle transaction pour le merchant connecté
      async create(data) {
        // data: { client_id, type: 'payment' | 'debt', amount, description, date, due_date, payment_method }
        const payload = {
          customerId: data.client_id,
          type: data.type === "payment" ? "PAYMENT" : "CREDIT",
          amount: data.amount,
          description: data.description,
          transactionDate: data.date,   // si null, le backend met LocalDate.now()
          dueDate: data.due_date,
          paymentMethod: data.payment_method,
          allocations: data.allocations,
        };

        const res = await api.post(`/me/transactions`, payload);
        const t = res.data;

        return {
          id: t.id,
          client_id: t.customerId,
          type: t.type === "PAYMENT" ? "payment" : "debt",
          amount: Number(t.amount ?? 0),
          description: t.description,
          date: t.transactionDate,
          due_date: t.dueDate,
          payment_method: t.paymentMethod,
        };
      },

      async listCreditsByClient(clientId) {
  const res = await api.get(`/me/transactions/customer/${clientId}/credits`);
  // Backend: CreditWithRemainingDto[]
  return res.data.map((c) => ({
    id: c.id,
    client_id: c.customerId,
    amount: Number(c.amount ?? 0),               // montant initial
    remaining_amount: Number(c.remainingAmount ?? 0), // montant restant dû
    description: c.description,
    date: c.transactionDate,
    due_date: c.dueDate,
  }));
},


    },
    Stats: {
      async get(params = {}) {
        const res = await api.get("/me/stats", { params });
        return res.data; // { totalDue, totalPayments, clientsWithDebt, clientsTotal }
      },
    },
     Notifications: {
      // Liste des notifications
      async list() {
        const res = await api.get("/me/notifications");
        // Backend: List<NotificationDto>
        return res.data.map((n) => ({
          id: n.id,
          customer_id: n.customerId,
          title: n.title,
          message: n.message,
          read: n.read,
          created_at: n.createdAt,
        }));
      },

      // Nombre non lues
      async unreadCount() {
        const res = await api.get("/me/notifications/unread-count");
        // { unreadCount: number }
        return res.data.unreadCount ?? 0;
      },

      async markAsRead(id) {
        await api.post(`/me/notifications/${id}/read`);
      },
    },
    ReminderSettings: {
        async get() {
          const res = await api.get("/me/reminder-settings");
          return res.data;
        },
        async update(data) {
          const res = await api.put("/me/reminder-settings", data);
          return res.data;
        },
      },
  },
};