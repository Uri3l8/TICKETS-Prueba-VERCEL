const express = require("express");
const pool = require("../db");

const router = express.Router();

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA"];
const ESTADOS = ["PENDIENTE", "EN_REVISION", "EN_PROCESO", "RESUELTO"];

// Obtiene todos los tickets o filtra por nombre de usuario.
router.get("/", async (req, res) => {
    try {
        const { usuario } = req.query;

        let consulta = "SELECT * FROM tickets";
        const valores = [];

        if (usuario) {
            consulta += " WHERE LOWER(nombre_usuario) = LOWER($1)";
            valores.push(usuario);
        }

        consulta += " ORDER BY fecha_creacion DESC";

        const resultado = await pool.query(consulta, valores);

        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al consultar tickets:", error.message);

        res.status(500).json({
            error: "No se pudieron consultar los tickets."
        });
    }
});

// Obtiene un ticket por su identificador.
router.get("/:id", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM tickets WHERE id = $1",
            [req.params.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Ticket no encontrado."
            });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al consultar ticket:", error.message);

        res.status(500).json({
            error: "No se pudo consultar el ticket."
        });
    }
});

// Registra un nuevo ticket.
router.post("/", async (req, res) => {
    try {
        const {
            nombre_usuario,
            titulo,
            descripcion,
            prioridad = "MEDIA"
        } = req.body;

        if (!nombre_usuario || !titulo || !descripcion) {
            return res.status(400).json({
                error: "Nombre, título y descripción son obligatorios."
            });
        }

        if (!PRIORIDADES.includes(prioridad)) {
            return res.status(400).json({
                error: "Prioridad no válida."
            });
        }

        const resultado = await pool.query(
            `INSERT INTO tickets
                (nombre_usuario, titulo, descripcion, prioridad)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                nombre_usuario.trim(),
                titulo.trim(),
                descripcion.trim(),
                prioridad
            ]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al crear ticket:", error.message);

        res.status(500).json({
            error: "No se pudo crear el ticket."
        });
    }
});

// Actualiza únicamente el estado de un ticket.
router.put("/:id", async (req, res) => {
    try {
        const { estado } = req.body;

        if (!ESTADOS.includes(estado)) {
            return res.status(400).json({
                error: "Estado no válido."
            });
        }

        const resultado = await pool.query(
            `UPDATE tickets
             SET estado = $1
             WHERE id = $2
             RETURNING *`,
            [estado, req.params.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Ticket no encontrado."
            });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar ticket:", error.message);

        res.status(500).json({
            error: "No se pudo actualizar el ticket."
        });
    }
});

// Elimina un ticket.
router.delete("/:id", async (req, res) => {
    try {
        const resultado = await pool.query(
            "DELETE FROM tickets WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Ticket no encontrado."
            });
        }

        res.json({
            mensaje: "Ticket eliminado correctamente."
        });
    } catch (error) {
        console.error("Error al eliminar ticket:", error.message);

        res.status(500).json({
            error: "No se pudo eliminar el ticket."
        });
    }
});

module.exports = router;