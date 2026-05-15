import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRegistro, updateRegistro, deleteRegistro } from '../store/slices/mantenimientoSlice';
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
  exportMantenimientosExcel,
} from '../services/excelService';
import {
  exportMantenimientosPDF,
} from '../services/pdfService';

const TIPOS_MANTENIMIENTO = ['Correctivo', 'Preventivo', 'Formateo'];
const ESTADOS_MANTENIMIENTO = ['pendiente', 'completado'];

const INITIAL_FORM = {
  equipoId: '',
  tipo: 'Correctivo',
  descripcion: '',
  estado: 'pendiente',
  fecha: '',
  tecnico: '',
  sede: '',
};

const Mantenimiento = () => {
  const dispatch = useDispatch();
  const equipos = useSelector((state) => state.equipos.list);
  const mantenimientos = useSelector((state) => state.mantenimiento.list);
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
      id: editingId || Math.max(0, ...mantenimientos.map((item) => item.id)) + 1,
      equipoId: Number(form.equipoId),
      sede: equipo?.sede || '',
    };

    if (editingId) {
      dispatch(updateRegistro(payload));
    } else {
      dispatch(addRegistro(payload));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este registro de mantenimiento?')) dispatch(deleteRegistro(id));
  };

  const handleExportExcel = () => {
    exportMantenimientosExcel(mantenimientos, equipos);
  };

  const handleExportPDF = () => {
    exportMantenimientosPDF(mantenimientos, equipos);
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
          'Correctivo': 'error',
          'Preventivo': 'warning',
          'Formateo': 'info',
        };
        return colors[value] || 'default';
      },
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      width: '250px',
      render: (value) => value?.length > 50 ? `${value.substring(0, 50)}...` : value,
    },
    {
      key: 'estado',
      label: 'Estado',
      width: '120px',
      type: 'chip',
      chipColor: (value) => value === 'completado' ? 'success' : 'warning',
    },
    {
      key: 'fecha',
      label: 'Fecha',
      width: '100px',
      type: 'date',
    },
    {
      key: 'tecnico',
      label: 'Técnico',
      width: '150px',
      searchable: true,
    },
    {
      key: 'sede',
      label: 'Sede',
      width: '80px',
    },
  ];

  // Filtrar equipos por sede seleccionada
  const equiposFiltrados = form.sede ? equipos.filter(e => e.sede === form.sede) : equipos;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Gestión de Mantenimientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registra y administra los mantenimientos de equipos
          </Typography>
        </Box>
        <ExportImportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          hideImport={true}
        />
      </Box>

      <DataTable
        data={mantenimientos}
        columns={columns}
        title="Registros de Mantenimiento"
        onAdd={() => handleOpen(null)}
        onEdit={handleOpen}
        onDelete={handleDelete}
        searchPlaceholder="Buscar mantenimientos por equipo, técnico..."
      />

      {/* Modal de formulario */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? 'Editar mantenimiento' : 'Nuevo mantenimiento'}
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
                  label="Tipo de Mantenimiento"
                  value={form.tipo}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {TIPOS_MANTENIMIENTO.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="estado"
                  label="Estado"
                  value={form.estado}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {ESTADOS_MANTENIMIENTO.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              name="descripcion"
              label="Descripción del Mantenimiento"
              value={form.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
              placeholder="Describe las tareas realizadas o por realizar..."
            />

            <Grid container spacing={2}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="tecnico"
                  label="Técnico Responsable"
                  value={form.tecnico}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {usuarios
                    .filter(u => u.rol === 'tecnico' && (!form.sede || u.sede === form.sede))
                    .map((usuario) => (
                    <MenuItem key={usuario.id} value={usuario.nombre}>
                      {usuario.nombre} ({usuario.sede})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
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

export default Mantenimiento;
