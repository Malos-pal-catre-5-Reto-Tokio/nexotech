import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar.jsx';
import Footer from './Footer.jsx';
import { useCarrito } from '../../context/CarritoContext.jsx';

function Layout() {
  const { total } = useCarrito();

  return (
    <>
      <AppNavbar totalCarrito={total} />
      <main className="container py-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
