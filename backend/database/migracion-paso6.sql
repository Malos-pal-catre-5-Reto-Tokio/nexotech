-- Solo si ya importaste nexotech.sql antes del paso 6 y NO quieres perder datos.
-- (Importar nexotech.sql completo también sirve, pero reinicia todas las tablas.)
USE nexotech;
INSERT IGNORE INTO usuarios (run, nombre, apellidos, correo, password_hash, rol, region, comuna, direccion) VALUES
 ('19011022K','Admin','NexoTech','admin@duoc.cl','$2y$10$xth7w5/f2sVg1S7HjjYEleopw6THBXNM0symZ3wGi4MUO99clLOFi','admin','Región Metropolitana de Santiago','Santiago','Av. Libertador Bernardo O\'Higgins 1234'),
 ('20123456K','Vera','Vendedor','vendedor@duoc.cl','$2y$10$8KSTR2D2AmB6Fj2mNRqsvu0deKayLREEtndBdLLQQm1TnIaWVw8y6','vendedor','Región de Valparaíso','Viña del Mar','Calle Valparaíso 456'),
 ('21345678K','Pedro','Cliente','cliente@gmail.com','$2y$10$ul1pAHrs2WTlmBGLafJtnu3QCr/SYcsDwVFUVGo6QC5iYZFH/wcGC','cliente','Región de Tarapacá','Iquique','Los Crisantemos 789');
