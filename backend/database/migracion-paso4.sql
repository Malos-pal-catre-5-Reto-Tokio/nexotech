-- Solo si ya importaste nexotech.sql antes del paso 4 y NO quieres perder datos.
-- (Si prefieres, vuelve a importar nexotech.sql completo: reinicia las tablas.)
USE nexotech;
ALTER TABLE ordenes ADD COLUMN descuento INT UNSIGNED NOT NULL DEFAULT 0 AFTER indicaciones;
