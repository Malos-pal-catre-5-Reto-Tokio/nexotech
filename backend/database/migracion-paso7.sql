-- Solo si ya importaste nexotech.sql antes del paso 7 y NO quieres perder datos.
USE nexotech;
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  correo     VARCHAR(100) NOT NULL,
  comentario VARCHAR(500) NOT NULL,
  creado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
