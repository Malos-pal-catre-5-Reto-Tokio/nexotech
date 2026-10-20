-- Base de datos de NexoTech (MySQL / MariaDB, para importar desde phpMyAdmin)
CREATE DATABASE IF NOT EXISTS nexotech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexotech;

DROP TABLE IF EXISTS orden_items;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE categorias (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  slug   VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE productos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  codigo        VARCHAR(20)  NOT NULL UNIQUE,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  precio        INT UNSIGNED NOT NULL,
  stock         INT UNSIGNED NOT NULL DEFAULT 0,
  stock_critico INT UNSIGNED NOT NULL DEFAULT 0,
  imagen        VARCHAR(255),
  descuento_pct TINYINT UNSIGNED NOT NULL DEFAULT 0,  -- 0 = sin oferta
  categoria_id  INT NOT NULL,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  run           VARCHAR(10)  NOT NULL UNIQUE,
  nombre        VARCHAR(50)  NOT NULL,
  apellidos     VARCHAR(100) NOT NULL,
  correo        VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('admin','vendedor','cliente') NOT NULL DEFAULT 'cliente',
  region        VARCHAR(80),
  comuna        VARCHAR(60),
  direccion     VARCHAR(150),
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE ordenes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NULL,
  nombre       VARCHAR(50)  NOT NULL,
  apellidos    VARCHAR(100) NOT NULL,
  correo       VARCHAR(100) NOT NULL,
  calle        VARCHAR(150) NOT NULL,
  departamento VARCHAR(30),
  region       VARCHAR(80)  NOT NULL,
  comuna       VARCHAR(60)  NOT NULL,
  indicaciones VARCHAR(300),
  descuento    INT UNSIGNED NOT NULL DEFAULT 0,
  total        INT UNSIGNED NOT NULL,
  estado       ENUM('pagada','fallida','pendiente') NOT NULL DEFAULT 'pendiente',
  creado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orden_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE orden_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  orden_id    INT NOT NULL,
  producto_id INT NULL,
  nombre      VARCHAR(100) NOT NULL,   -- se copia para que la boleta no cambie si se edita el producto
  precio      INT UNSIGNED NOT NULL,
  cantidad    INT UNSIGNED NOT NULL,
  CONSTRAINT fk_item_orden    FOREIGN KEY (orden_id)    REFERENCES ordenes(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Datos iniciales (los mismos 10 productos de la Evaluación Parcial 1)
INSERT INTO categorias (slug, nombre) VALUES
  ('notebooks','Notebooks'), ('celulares','Celulares'),
  ('accesorios','Accesorios'), ('componentes','Componentes');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, stock_critico, imagen, descuento_pct, categoria_id) VALUES
 ('NB-001','Notebook UltraSlim 14"','Notebook liviano con procesador de última generación, ideal para trabajo y estudio.',549990,12,3,'/img/productos/notebook-1.jpg',0,1),
 ('NB-002','Notebook Gamer RX15','Notebook gamer con tarjeta gráfica dedicada y pantalla de alta tasa de refresco.',899990,5,2,'/img/productos/notebook-2.jpg',10,1),
 ('CL-001','Smartphone Nova X20','Smartphone con cámara triple y batería de larga duración.',349990,20,5,'/img/productos/celular-1.jpg',0,2),
 ('CL-002','Smartphone Nova X20 Pro','Versión Pro con más almacenamiento y pantalla AMOLED.',499990,8,3,'/img/productos/celular-2.jpg',15,2),
 ('AC-001','Mouse inalámbrico ErgoTech','Mouse ergonómico inalámbrico con sensor de alta precisión.',14990,40,10,'/img/productos/mouse.jpg',0,3),
 ('AC-002','Teclado mecánico ProType','Teclado mecánico retroiluminado con switches táctiles.',39990,15,4,'/img/productos/teclado.jpg',20,3),
 ('AC-003','Audífonos SoundMax','Audífonos inalámbricos con cancelación de ruido.',29990,25,6,'/img/productos/audifonos.jpg',0,3),
 ('CO-001','SSD 1TB SpeedDrive','Disco de estado sólido NVMe de alta velocidad.',59990,18,5,'/img/productos/ssd.jpg',0,4),
 ('CO-002','Memoria RAM 16GB DDR4','Memoria RAM de alto rendimiento para gaming y trabajo pesado.',44990,22,5,'/img/productos/ram.jpg',0,4),
 ('CO-003','Fuente de poder 650W','Fuente de poder certificada 80+ Bronze, 650W.',54990,2,3,'/img/productos/fuente.jpg',0,4);

-- Usuarios de demostración (contraseñas guardadas como hash bcrypt, nunca en texto plano)
--   admin@duoc.cl    / admin123    (rol admin)
--   vendedor@duoc.cl / vend123     (rol vendedor)
--   cliente@gmail.com / cliente123 (rol cliente)
INSERT INTO usuarios (run, nombre, apellidos, correo, password_hash, rol, region, comuna, direccion) VALUES
 ('19011022K','Admin','NexoTech','admin@duoc.cl','$2y$10$xth7w5/f2sVg1S7HjjYEleopw6THBXNM0symZ3wGi4MUO99clLOFi','admin','Región Metropolitana de Santiago','Santiago','Av. Libertador Bernardo O\'Higgins 1234'),
 ('20123456K','Vera','Vendedor','vendedor@duoc.cl','$2y$10$8KSTR2D2AmB6Fj2mNRqsvu0deKayLREEtndBdLLQQm1TnIaWVw8y6','vendedor','Región de Valparaíso','Viña del Mar','Calle Valparaíso 456'),
 ('21345678K','Pedro','Cliente','cliente@gmail.com','$2y$10$ul1pAHrs2WTlmBGLafJtnu3QCr/SYcsDwVFUVGo6QC5iYZFH/wcGC','cliente','Región de Tarapacá','Iquique','Los Crisantemos 789');
