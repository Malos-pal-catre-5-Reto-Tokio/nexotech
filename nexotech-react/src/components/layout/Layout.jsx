import { Outlet, useNavigate } from 'react-router-dom';
import AppNavbar from './AppNavbar.jsx';
import Footer from './Footer.jsx';
import { useCarrito } from '../../context/CarritoContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function Layout() {
  const { total } = useCarrito();
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  const salir = async () => {
    await cerrarSesion();
    navegar('/');
  };

  return (
    <>
      <AppNavbar totalCarrito={total} usuario={usuario} onCerrarSesion={salir} />
      <main className="container py-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
