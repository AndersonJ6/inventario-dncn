import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Inventory2 as InventoryIcon,
  Person,
  Lock,
} from '@mui/icons-material';
import { loginSuccess } from '../store/slices/authSlice.js';
import { mockUsuarios } from '../data/mockData.js';

// Usuarios demo con sus credenciales
const DEMO_USERS = mockUsuarios.map((u) => ({
  ...u,
  password: '1234',
}));

const ROL_COLORS = { admin: 'error', tecnico: 'warning', visualizador: 'info' };
const ROL_LABELS = { admin: 'Admin', tecnico: 'Técnico', visualizador: 'Visualizador' };

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
  };

  const handleQuickLogin = (usuario) => {
    setForm({ email: usuario.email, password: '1234' });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!form.email || !form.password) {
      setLocalError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);

    // Simular delay de autenticación
    await new Promise((r) => setTimeout(r, 800));

    const usuario = DEMO_USERS.find(
      (u) => u.email === form.email && u.password === form.password
    );

    if (!usuario) {
      setLocalError('Credenciales incorrectas. Usa los accesos rápidos de prueba.');
      setIsLoading(false);
      return;
    }

    const userData = { ...usuario };
    delete userData.password;
    dispatch(loginSuccess(userData));
    navigate('/dashboard');
    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(25,118,210,0.4)',
              mb: 2,
            }}
          >
            <InventoryIcon sx={{ color: '#fff', fontSize: 36 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            TechInventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de gestión de inventario tecnológico
          </Typography>
        </Box>

        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Iniciar sesión
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresa tus credenciales para continuar
            </Typography>

            {localError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {localError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Correo electrónico"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ borderRadius: 2, py: 1.3, fontWeight: 600 }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Ingresar'}
              </Button>
            </Box>

            {/* Accesos rápidos */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.disabled">
                ACCESOS DE PRUEBA
              </Typography>
            </Divider>

            <Stack spacing={1.5}>
              {DEMO_USERS.map((u) => (
                <Box
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {u.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={ROL_LABELS[u.rol] || u.rol}
                    color={ROL_COLORS[u.rol] || 'default'}
                    size="small"
                  />
                </Box>
              ))}
            </Stack>

            <Typography variant="caption" color="text.disabled" display="block" textAlign="center" sx={{ mt: 2 }}>
              Contraseña para todos: <strong>1234</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;