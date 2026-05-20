import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUsuario, updateUsuario, deleteUsuario } from '../store/slices/usuariosSlice.js';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';

const ROLES = ['admin', 'tecnico', 'visualizador'];
const INITIAL_FORM = { nombre: '', user: '', rol: 'visualizador' };

const Usuarios = () => {
  const dispatch = useDispatch();
  const usuarios = useSelector((state) => state.usuarios.list);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (usuario) => {
    if (usuario) {
      setEditingId(usuario.id);
      setForm({ nombre: usuario.nombre, user: usuario.user ?? usuario.email ?? '', rol: usuario.rol });
    } else {
      setEditingId(null);
      setForm(INITIAL_FORM);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      id: editingId || Math.max(0, ...usuarios.map((item) => item.id)) + 1,
    };

    if (editingId) {
      dispatch(updateUsuario(payload));
    } else {
      dispatch(addUsuario(payload));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este usuario?')) dispatch(deleteUsuario(id));
  };

  return (
    <Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item size="grow">
          <Typography variant="h5" fontWeight={700}>
            Gestión de Usuarios
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen(null)}>
            Nuevo usuario
          </Button>
        </Grid>
      </Grid>

      <Card elevation={1}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.user ?? usuario.email}</TableCell>
                    <TableCell>{usuario.rol}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(usuario)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(usuario.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField name="nombre" label="Nombre" value={form.nombre} onChange={handleChange} fullWidth />
            <TextField name="user" label="Usuario" value={form.user} onChange={handleChange} fullWidth />
            <TextField select name="rol" label="Rol" value={form.rol} onChange={handleChange} fullWidth>
              {ROLES.map((rol) => (
                <MenuItem key={rol} value={rol}>{rol}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
