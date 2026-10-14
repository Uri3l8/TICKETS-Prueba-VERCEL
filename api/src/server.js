const express = require("express");
const cors = require("cors");
require("dotenv").config();

const ticketsRoutes = require("./routes/tickets");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    estado: "ok",
    servicio: "sistema-tickets-api"
  });
});

app.use("/api/tickets", ticketsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada."
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ejecutándose en el puerto ${PORT}`);
});