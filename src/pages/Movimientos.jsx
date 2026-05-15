import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMovimiento, updateMovimiento, deleteMovimiento } from '../store/slices/movimientosSlice';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/cammon/DataTable';
import ExportImportButtons from '../components/cammon/ExportImportButtons';
import {
  exportMovimientosExcel,
} from '../services/excelService';
import {
  exportMovimientosPDF,
} from '../services/pdfService';

const TIPOS_MOVIMIENTO = ['traslado', 'mantenimiento', 'salida', 'baja'];

const INITIAL_FORM = {
  equipoId: '',
  tipo: 'traslado',
  origen: '',
  destino: '',
  fecha: '',
  usuario: '',
  observacion: '',
  sede: '',
};

const Movimientos = () => {
  const dispatch = useDispatch();
  const movimientos = useSelector((state) => state.movimientos.list);
  const equipos = useSelector((state) => state.equipos.list);
  const usuarios = useSelector((state) => state.usuarios.list);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (registro) => {
    if (registro) {
      setEditingId(registro.id);
      const equipo = equipos.find(e => e.id === registro.equipoId);
      setForm({
        ...registro,
        equipoId: registro.equipoId.toString(),
        sede: equipo?.sede || '',
      });
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
    const equipo = equipos.find(e => e.id === Number(form.equipoId));
    const payload = {
      ...form,
      id: editingId || Math.max(0, ...movimientos.map((item) => item.id)) + 1,
      equipoId: Number(form.equipoId),
      sede: equipo?.sede || '',
    };

    if (editingId) {
      dispatch(updateMovimiento(payload));
    } else {
      dispatch(addMovimiento(payload));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este movimiento?')) dispatch(deleteMovimiento(id));
  };

  const handleExportExcel = () => {
    exportMovimientosExcel(movimientos, equipos);
  };

  const handleExportPDF = () => {
    exportMovimientosPDF(movimientos, equipos);
  };

  // Columnas para la tabla
  const columns = [
    {
      key: 'equipoId',
      label: 'Equipo',
      width: '200px',
      render: (value) => {
        const equipo = equipos.find(e => e.id === value);
        return equipo ? `${equipo.nombre} (${equipo.codigoPatrimonial})` : `ID: ${value}`;
      },
      searchable: true,
    },
    {
      key: 'tipo',
      label: 'Tipo',
      width: '120px',
      type: 'chip',
      chipColor: (value) => {
        const colors = {
          'traslado': 'primary',
          'mantenimiento': 'warning',
          'salida': 'info',
          'baja': 'error',
        };
        return colors[value] || 'default';
      },
    },
    {
      key: 'origen',
      label: 'Origen',
      width: '150px',
    },
    {
      key: 'destino',
      label: 'Destino',
      width: '150px',
    },
    {
      key: 'fecha',
      label: 'Fecha',
      width: '100px',
      type: 'date',
    },
    {
      key: 'usuario',
      label: 'Usuario',
      width: '150px',
      searchable: true,
    },
    {
      key: 'sede',
      label: 'Sede',
      width: '80px',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Gestión de Movimientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registra traslados, salidas y movimientos de equipos
          </Typography>
        </Box>
        <ExportImportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          hideImport={true}
        />
      </Box>

      <DataTable
        data={movimientos}
        columns={columns}
        title="Registros de Movimientos"
        onAdd={() => handleOpen(null)}
        onEdit={handleOpen}
        onDelete={handleDelete}
        searchPlaceholder="Buscar movimientos por equipo, usuario..."
      />

      {/* Modal de formulario */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? 'Editar movimiento' : 'Nuevo movimiento'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  select
                  name="equipoId"
                  label="Equipo"
                  value={form.equipoId}
                  onChange={(e) => {
                    handleChange(e);
                    // Actualizar sede cuando cambia el equipo
                    const equipo = equipos.find(eq => eq.id === Number(e.target.value));
                    if (equipo) {
                      setForm(prev => ({ ...prev, sede: equipo.sede }));
                    }
                  }}
                  fullWidth
                  required
                >
                  {equipos.map((equipo) => (
                    <MenuItem key={equipo.id} value={equipo.id.toString()}>
                      {equipo.nombre} - {equipo.codigoPatrimonial} ({equipo.sede})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="sede"
                  label="Sede"
                  value={form.sede}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="tipo"
                  label="Tipo de Movimiento"
                  value={form.tipo}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {TIPOS_MOVIMIENTO.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="fecha"
                  label="Fecha"
                  type="date"
                  value={form.fecha}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="origen"
                  label="Origen"
                  value={form.origen}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Ubicación o área de origen"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="destino"
                  label="Destino"
                  value={form.destino}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Ubicación o área de destino"
                />
              </Grid>
            </Grid>

            <TextField
              select
              name="usuario"
              label="Usuario Responsable"
              value={form.usuario}
              onChange={handleChange}
              fullWidth
              required
            >
              {usuarios.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.nombre}>
                  {usuario.nombre} ({usuario.sede})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="observacion"
              label="Observaciones"
              value={form.observacion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Detalles adicionales del movimiento..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Movimientos;
