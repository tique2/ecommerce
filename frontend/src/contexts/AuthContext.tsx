import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';

// Definir interfaces para tipar correctamente
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface ContextoAuth {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (email: string, password: string) => Promise<boolean>;
  registrarse: (nombre: string, email: string, password: string) => Promise<boolean>;
  cerrarSesion: () => void;
}

// Crear el contexto con valores iniciales
export const AuthContext = createContext<ContextoAuth>({
  usuario: null,
  token: null,
  cargando: true,
  error: null,
  iniciarSesion: async () => false,
  registrarse: async () => false,
  cerrarSesion: () => {},
});

// Propiedades del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

// Componente proveedor que maneja la lógica de autenticación
// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // URL base de la API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Configurar axios para incluir el token en las peticiones
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verificar el token al cargar la página
  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const respuesta = await axios.get(`${API_URL}/auth/perfil`);
        setUsuario(respuesta.data.usuario);
        setCargando(false);
      } catch (error) {
        console.error('Error al verificar el token:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
        setCargando(false);
      }
    };

    verificarToken();
  }, [token, API_URL]);

  // Función para iniciar sesión
  const iniciarSesion = async (email: string, password: string): Promise<boolean> => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, usuario } = respuesta.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUsuario(usuario);
      setCargando(false);
      return true;
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || 'Error al iniciar sesión';
      setError(mensajeError);
      setCargando(false);
      return false;
    }
  };

  // Función para registrar un nuevo usuario
  const registrarse = async (nombre: string, email: string, password: string): Promise<boolean> => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.post(`${API_URL}/auth/registrar`, { nombre, email, password });
      const { token, usuario } = respuesta.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUsuario(usuario);
      setCargando(false);
      return true;
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || 'Error al registrarse';
      setError(mensajeError);
      setCargando(false);
      return false;
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        error,
        iniciarSesion,
        registrarse,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
