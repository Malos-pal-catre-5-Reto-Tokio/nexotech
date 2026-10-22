import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import RutaProtegida from '../components/admin/RutaProtegida.jsx';

// Renderiza un elemento del panel como en la aplicación real: con proveedor de sesión y dentro de una
// ruta protegida (así el elemento solo se dibuja cuando ya se sabe quién tiene la sesión).
//   patron: ruta del elemento (ej. '/admin/productos/:id/editar'); ruta: URL inicial.
//   extra:  rutas adicionales [ [path, elemento] ] para comprobar a dónde navega la página.
export function renderizarConSesion(elemento, { ruta = '/', patron = '/', roles = ['admin', 'vendedor'], extra = [] } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <Routes>
          <Route path={patron} element={<RutaProtegida roles={roles}>{elemento}</RutaProtegida>} />
          {extra.map(([path, contenido]) => <Route key={path} path={path} element={contenido} />)}
          <Route path="/login" element={<p>Pantalla de login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// Direcciones que pidió la aplicación a la API falsa (para comprobar filtros y parámetros).
export const urlsPedidas = (api) => api.espia.calls.allArgs().map(([url]) => url);

// Llamadas hechas a una dirección y con un método, con su cuerpo ya convertido a objeto.
export function llamadas(api, fragmento, metodo) {
  return api.espia.calls.allArgs()
    .filter(([url, opciones]) => url.includes(fragmento) && (!metodo || opciones?.method === metodo))
    .map(([url, opciones]) => ({ url, cuerpo: opciones?.body ? JSON.parse(opciones.body) : undefined }));
}
