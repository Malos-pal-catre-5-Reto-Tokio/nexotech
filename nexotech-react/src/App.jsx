import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Productos from './pages/Productos.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Carrito from './pages/Carrito.jsx';
import Categorias from './pages/Categorias.jsx';
import Ofertas from './pages/Ofertas.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Nosotros from './pages/Nosotros.jsx';
import Blogs from './pages/Blogs.jsx';
import DetalleBlog from './pages/DetalleBlog.jsx';
import Contacto from './pages/Contacto.jsx';
import Checkout from './pages/Checkout.jsx';
import CompraExitosa from './pages/CompraExitosa.jsx';
import CompraError from './pages/CompraError.jsx';
import RutaProtegida from './components/admin/RutaProtegida.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Ordenes from './pages/admin/Ordenes.jsx';
import BoletaAdmin from './pages/admin/BoletaAdmin.jsx';
import ProductosAdmin from './pages/admin/ProductosAdmin.jsx';
import FormProducto from './pages/admin/FormProducto.jsx';
import ReportesProductos from './pages/admin/ReportesProductos.jsx';
import CategoriasAdmin from './pages/admin/CategoriasAdmin.jsx';
import FormCategoria from './pages/admin/FormCategoria.jsx';
import UsuariosAdmin from './pages/admin/UsuariosAdmin.jsx';
import FormUsuario from './pages/admin/FormUsuario.jsx';
import HistorialUsuario from './pages/admin/HistorialUsuario.jsx';
import ReportesGenerales from './pages/admin/ReportesGenerales.jsx';
import Mensajes from './pages/admin/Mensajes.jsx';
import Perfil from './pages/admin/Perfil.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <Routes>
      {/* Panel de administración: solo personal (admin y vendedor). Las secciones de gestión son solo del admin. */}
      <Route path="admin" element={<RutaProtegida roles={['admin', 'vendedor']}><AdminLayout /></RutaProtegida>}>
        <Route index element={<Dashboard />} />
        <Route path="ordenes" element={<Ordenes />} />
        <Route path="ordenes/:id" element={<BoletaAdmin />} />
        <Route path="productos" element={<ProductosAdmin />} />
        <Route path="productos/criticos" element={<ProductosAdmin criticos />} />
        <Route path="productos/reportes" element={<ReportesProductos />} />
        <Route path="mensajes" element={<Mensajes />} />
        <Route path="reportes" element={<ReportesGenerales />} />
        <Route path="perfil" element={<Perfil />} />
        <Route element={<RutaProtegida roles={['admin']} />}>
          <Route path="productos/nuevo" element={<FormProducto />} />
          <Route path="productos/:id/editar" element={<FormProducto />} />
          <Route path="categorias" element={<CategoriasAdmin />} />
          <Route path="categorias/nueva" element={<FormCategoria />} />
          <Route path="categorias/:id/editar" element={<FormCategoria />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="usuarios/nuevo" element={<FormUsuario />} />
          <Route path="usuarios/:id/editar" element={<FormUsuario />} />
          <Route path="usuarios/:id/historial" element={<HistorialUsuario />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<DetalleProducto />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/:slug" element={<Categorias />} />
        <Route path="ofertas" element={<Ofertas />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/:id" element={<DetalleBlog />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="compra/exitosa/:id" element={<CompraExitosa />} />
        <Route path="compra/error/:id" element={<CompraError />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
