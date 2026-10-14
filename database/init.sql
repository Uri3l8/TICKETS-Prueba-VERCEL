-- Crea la tabla principal de tickets si aún no existe.
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,

    prioridad VARCHAR(10) NOT NULL DEFAULT 'MEDIA'
        CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),

    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
        CHECK (
            estado IN (
                'PENDIENTE',
                'EN_REVISION',
                'EN_PROCESO',
                'RESUELTO'
            )
        ),

    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Actualiza automáticamente la fecha de modificación del ticket.
CREATE OR REPLACE FUNCTION actualizar_fecha_ticket()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrea el trigger responsable de actualizar fecha_actualizacion.
DROP TRIGGER IF EXISTS trg_actualizar_fecha_ticket ON tickets;

CREATE TRIGGER trg_actualizar_fecha_ticket
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_ticket();

-- Índices para mejorar las consultas frecuentes.
CREATE INDEX IF NOT EXISTS idx_tickets_usuario
ON tickets(nombre_usuario);

CREATE INDEX IF NOT EXISTS idx_tickets_estado
ON tickets(estado);

CREATE INDEX IF NOT EXISTS idx_tickets_prioridad
ON tickets(prioridad);

CREATE INDEX IF NOT EXISTS idx_tickets_fecha_creacion
ON tickets(fecha_creacion);