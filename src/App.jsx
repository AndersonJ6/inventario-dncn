import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Usuarios from './pages/Usuarios';
import Mantenimiento from './pages/Mantenimiento';
import Movimientos from './pages/Movimientos';

// Ruta protegida: verifica autenticación y rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.rol))
    return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Pública */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protegidas — dentro del Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="equipos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico', 'visualizador']}>
              <Equipos />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="mantenimiento"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
              <Mantenimiento />
            </ProtectedRoute>
          }
        />
        <Route
          path="movimientos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
              <Movimientos />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;