import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEquipo, updateEquipo, deleteEquipo } from '../store/slices/equiposSlice';
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
  Chip,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/cammon/DataTable';
import ExportImportButtons from '../components/cammon/ExportImportButtons';
import { SEDES, AREAS, ESTADOS_EQUIPOS, TIPOS_EQUIPOS, mockUsuarios } from '../data/mockData';
import {
  exportEquiposExcel,
  importEquiposExcel,
} from '../services/excelService';
import {
  exportEquiposPDF,
} from '../services/pdfService';

const INITIAL_FORM = {
  codigoPatrimonial: '',
  nombre: '',
  tipo: 'PC',
  marca: '',
  modelo: '',
  serie: '',
  procesador: '',
  ram: '',
  disco: '',
  sistemaOperativo: '',
  estado: 'En uso',
  sede: 'Garzón',
  area: '',
  usuarioAsignado: null,
  observaciones: '',
  fechaAdquisicion: '',
};

const Equipos = () => {
  const dispatch = useDispatch();
  const equipos = useSelector((state) => state.equipos.list);
  const usuarios = useSelector((state) => state.usuarios.list);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  const handleOpen = (equipo) => {
    if (equipo) {
      setEditingId(equipo.id);
      setForm({
        ...equipo,
        usuarioAsignado: equipo.usuarioAsignado || null,
        area: equipo.area || '',
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
    const payload = {
      ...form,
      id: editingId || Math.max(0, ...equipos.map((item) => item.id)) + 1,
      usuarioAsignado: form.usuarioAsignado ? Number(form.usuarioAsignado) : null,
    };

    if (editingId) {
      dispatch(updateEquipo(payload));
    } else {
      dispatch(addEquipo(payload));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este equipo?')) dispatch(deleteEquipo(id));
  };

  const handleExportExcel = () => {
    exportEquiposExcel(equipos);
  };

  const handleExportPDF = () => {
    exportEquiposPDF(equipos);
  };

  const handleImportExcel = async (file) => {
    setIsImporting(true);
    setImportMessage(null);
    try {
      const equiposImportados = await importEquiposExcel(file);
      equiposImportados.forEach(equipo => {
        dispatch(addEquipo(equipo));
      });
      setImportMessage({
        type: 'success',
        text: `Se importaron ${equiposImportados.length} equipos correctamente`,
      });
      setTimeout(() => setImportMessage(null), 3000);
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      key: 'codigoPatrimonial',
      label: 'Código',
      width: '120px',
      searchable: true,
    },
    {
      key: 'nombre',
      label: 'Nombre',
      width: '150px',
      searchable: true,
    },
    {
      key: 'tipo',
      label: 'Tipo',
      width: '100px',
      type: 'chip',
      chipColor: (value) => {
        const colors = {
          'PC': 'primary',
          'Monitor/Pantalla': 'info',
          'Teclado': 'warning',
          'Impresora': 'success',
          'Proyector': 'secondary',
        };
        return colors[value] || 'default';
      },
    },
    {
      key: 'marca',
      label: 'Marca',
      width: '100px',
    },
    {
      key: 'modelo',
      label: 'Modelo',
      width: '120px',
    },
    {
      key: 'estado',
      label: 'Estado',
      width: '120px',
      type: 'chip',
      chipColor: (value) => {
        const colors = {
          'En uso': 'success',
          'En almacén': 'warning',
          'En mantenimiento': 'error',
          'Formateado': 'info',
          'Retirado': 'default',
          'Dado de baja': 'default',
        };
        return colors[value] || 'default';
      },
    },
    {
      key: 'sede',
      label: 'Sede',
      width: '80px',
    },
    {
      key: 'area',
      label: 'Área',
      width: '120px',
    },
    {
      key: 'usuarioAsignado',
      label: 'Usuario',
      width: '150px',
      render: (value) => {
        if (!value) return '-';
        const usuario = usuarios.find(u => u.id === value);
        return usuario ? usuario.nombre : `ID: ${value}`;
      },
    },
    {
      key: 'fechaAdquisicion',
      label: 'Adquisición',
      width: '100px',
      type: 'date',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Gestión de Equipos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra el inventario de equipos tecnológicos
          </Typography>
        </Box>
        <ExportImportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onImportExcel={handleImportExcel}
          isLoading={isImporting}
        />
      </Box>

      {importMessage && (
        <Alert severity={importMessage.type} sx={{ mb: 2 }}>
          {importMessage.text}
        </Alert>
      )}

      <DataTable
        data={equipos}
        columns={columns}
        title="Equipos"
        onAdd={() => handleOpen(null)}
        onEdit={handleOpen}
        onDelete={handleDelete}
        searchPlaceholder="Buscar equipos por código, nombre, marca..."
      />

      {/* Modal de formulario */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? 'Editar equipo' : 'Nuevo equipo'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="codigoPatrimonial"
                  label="Código Patrimonial"
                  value={form.codigoPatrimonial}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  name="tipo"
                  label="Tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {TIPOS_EQUIPOS.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="marca"
                  label="Marca"
                  value={form.marca}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="modelo"
                  label="Modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="serie"
                  label="Número de Serie"
                  value={form.serie}
                  onChange={handleChange}
                  fullWidth
                />
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
                  {ESTADOS_EQUIPOS.map((estado) => (
                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Campos técnicos - solo para PCs */}
            {form.tipo === 'PC' && (
              <>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2 }}>
                  Especificaciones Técnicas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="procesador"
                      label="Procesador"
                      value={form.procesador}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="ram"
                      label="Memoria RAM"
                      value={form.ram}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="disco"
                      label="Disco Duro"
                      value={form.disco}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <TextField
                  name="sistemaOperativo"
                  label="Sistema Operativo"
                  value={form.sistemaOperativo}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mt: 2 }}
                />
              </>
            )}

            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2 }}>
              Ubicación y Asignación
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="sede"
                  label="Sede"
                  value={form.sede}
                  onChange={(e) => {
                    handleChange(e);
                    // Reset area when sede changes
                    setForm(prev => ({ ...prev, area: '' }));
                  }}
                  fullWidth
                  required
                >
                  {SEDES.map((sede) => (
                    <MenuItem key={sede} value={sede}>{sede}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="area"
                  label="Área"
                  value={form.area}
                  onChange={handleChange}
                  fullWidth
                  disabled={!form.sede}
                >
                  {form.sede && AREAS[form.sede]?.map((area) => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              select
              name="usuarioAsignado"
              label="Usuario Asignado"
              value={form.usuarioAsignado || ''}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {usuarios
                .filter(u => u.sede === form.sede)
                .map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nombre} ({usuario.email})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="fechaAdquisicion"
              label="Fecha de Adquisición"
              type="date"
              value={form.fechaAdquisicion}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              name="observaciones"
              label="Observaciones"
              value={form.observaciones}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
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

export default Equipos;
