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
import Checkout from './pages/Checkout.jsx';
import CompraExitosa from './pages/CompraExitosa.jsx';
import CompraError from './pages/CompraError.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<DetalleProducto />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/:slug" element={<Categorias />} />
        <Route path="ofertas" element={<Ofertas />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
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
