import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar.jsx';
import Footer from './Footer.jsx';

function Layout() {
  return (
    <>
      <AppNavbar />
      <main className="container py-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
