import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

// Solo se considera sesión válida una respuesta con forma de usuario (la API devuelve null si no hay sesión).
const esUsuario = (dato) => !!dato && typeof dato === 'object' && !Array.isArray(dato) && 'id' in dato;

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // true mientras se consulta si ya hay sesión

  useEffect(() => {
    let activo = true;
    authService.obtenerSesion()
      .then((dato) => activo && setUsuario(esUsuario(dato) ? dato : null))
      .catch(() => activo && setUsuario(null))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  // Estas funciones lanzan el error de la API (credenciales incorrectas, correo repetido...)
  // para que cada formulario decida cómo mostrarlo.
  const iniciarSesion = async (correo, password) => {
    const dato = await authService.iniciarSesion(correo, password);
    setUsuario(dato);
    return dato;
  };

  const registrar = async (datos) => {
    const dato = await authService.registrarUsuario(datos);
    setUsuario(dato);
    return dato;
  };

  const cerrarSesion = async () => {
    try {
      await authService.cerrarSesion();
    } finally {
      setUsuario(null); // aunque falle la red, la interfaz deja de mostrar al usuario
    }
  };

  const valor = { usuario, cargando, iniciarSesion, registrar, cerrarSesion };
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
