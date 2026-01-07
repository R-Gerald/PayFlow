import axios from "axios";

// Backend Spring Boot
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Pour l'instant merchant fixe
const MERCHANT_ID = 3;

export const base44 = {
  entities: {
    Client: {
      async list() {
        const res = await api.get(`/merchants/${MERCHANT_ID}/customers`);
        // Backend: CustomerDto { id, name, phone, notes }
        // Front: attend en plus total_due -> pour l'instant 0 (sera recalculé plus tard)
        return res.data.map((c) => ({
          ...c,
          total_due: Number(c.totalDue ?? 0),
        }));
      },

      async create(data) {
        // data vient du formulaire AddClientDialog : { name, phone, note }
        const payload = {
          name: data.name,
          phone: data.phone,
          notes: data.note ?? data.notes ?? "",
        };
        const res = await api.post(
          `/merchants/${MERCHANT_ID}/customers`,
          payload
        );
        return {
          ...res.data,
          total_due: 0,
        };
      },
    },

    Transaction: {
      // Récupérer toutes les transactions du merchant
      async list() {
  const res = await api.get(`/merchants/${MERCHANT_ID}/transactions`);
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

      // Créer une nouvelle transaction
      async create(data) {
        // data vient de tes dialogs (AddPaymentDialog, AddDebtDialog)
        // On suppose une structure de type :
        //   { client_id, type: 'payment' | 'debt', amount, description, date, due_date, payment_method }
        const payload = {
          customerId: data.client_id,
          type: data.type === "payment" ? "PAYMENT" : "CREDIT",
          amount: data.amount,
          description: data.description,
          transactionDate: data.date,      // si null, backend mettra LocalDate.now()
          dueDate: data.due_date,
          paymentMethod: data.payment_method,
        };

        const res = await api.post(
          `/merchants/${MERCHANT_ID}/transactions`,
          payload
        );

        const t = res.data;
        // On renvoie dans le même format que list()
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
    },
  },
};