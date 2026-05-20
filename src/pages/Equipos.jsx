import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addEquipo, updateEquipo, deleteEquipo,
  setExcelData, clearExcelData, updateExcelRow, deleteExcelRow,
} from '../store/slices/equiposSlice.js';
import * as XLSX from 'xlsx';

import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography, Chip, Alert, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, InputAdornment, Tooltip, LinearProgress, Fade,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FileUpload, FileDownload, Close, TableChart,
} from '@mui/icons-material';

// ─── Leer Excel ───────────────────────────────────────────────────────────────
const readExcelFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch {
        reject(new Error('No se pudo leer el archivo Excel.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });

// ─── Exportar Excel ───────────────────────────────────────────────────────────
const exportToExcel = (data, columns, filename = 'equipos') => {
  const exportData = data.map((row) => {
    const obj = {};
    columns.forEach((col) => { obj[col.label] = row[col.key] ?? ''; });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// ─── Columnas desde filas ─────────────────────────────────────────────────────
const normalizeColumns = (rows) =>
  Object.keys(rows[0]).map((key) => ({ key, label: key }));

const parseGoogleSheetUrl = (url) => {
  const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:\/.*?[?&]gid=(\d+))?/);
  if (!match) return null;
  return { spreadsheetId: match[1], gid: match[2] || '0' };
};

const buildGoogleSheetCsvUrl = ({ spreadsheetId, gid }) =>
  `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

// ─── Detectar si columna es de estado para mostrar chip ──────────────────────
const looksLikeStatus = (key) =>
  /estado|status|activo|condicion|condición/i.test(key);

const CHIP_MAP = {
  success: ['activo', 'actualizado', 'operativo', 'bueno', 'si', 'sí', 'yes', 'completado'],
  warning: ['mantenimiento', 'por actualizar', 'regular', 'pendiente', 'en proceso'],
  error:   ['inactivo', 'baja', 'dañado', 'no', 'malo', 'falla'],
};
const getChipColor = (value) => {
  const v = String(value).toLowerCase().trim();
  for (const [color, words] of Object.entries(CHIP_MAP)) {
    if (words.includes(v)) return color;
  }
  return 'default';
};

// ─── Columnas base cuando no hay Excel ───────────────────────────────────────
const BASE_COLUMNS = [
  { key: 'codigoPatrimonial', label: 'Código Patrimonial' },
  { key: 'marca',             label: 'Marca'              },
  { key: 'modeloSistemas',    label: 'Modelo'             },
  { key: 'procesador',        label: 'Procesador'         },
  { key: 'ram',               label: 'RAM'                },
  { key: 'sistemaOperativo',  label: 'Sistema Operativo'  },
  { key: 'estadoSO',          label: 'Estado SO'          },
  { key: 'office',            label: 'Office'             },
];

// ─── Componente ───────────────────────────────────────────────────────────────
const Equipos = () => {
  const dispatch = useDispatch();

  // FIX 4: selector limpio, sin fallback innecesario a `lista`
  const equiposRedux = useSelector((s) => s.equipos.list ?? []);

  // FIX 1: excelData viene de Redux → persiste entre navegaciones
  const excelData = useSelector((s) => s.equipos.excelData);

  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState(null);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [open, setOpen]          = useState(false);
  const [editingRow, setEditing] = useState(null); // { row, index } | null
  const [form, setForm]          = useState({});
  const [sheetUrl, setSheetUrl]  = useState('');

  const fileInputRef = useRef(null);

  const activeData = excelData?.rows ?? equiposRedux;
  const activeColumns = excelData?.columns ?? BASE_COLUMNS;

  const filteredData = activeData.filter((row) =>
    activeColumns.some((col) =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );
  const paginated = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ── Importar Excel ──────────────────────────────────────────────────────────
  const handleLoadGoogleSheet = async () => {
    const trimmedUrl = sheetUrl.trim();
    if (!trimmedUrl) {
      setMessage({ type: 'error', text: 'Ingresa la URL de Google Sheets.' });
      return;
    }

    const parsed = parseGoogleSheetUrl(trimmedUrl);
    if (!parsed) {
      setMessage({ type: 'error', text: 'URL de Google Sheets no válida.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setSearch('');
    setPage(0);

    try {
      const csvUrl = buildGoogleSheetCsvUrl(parsed);
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(`No se pudo cargar la hoja. Código ${response.status}`);
      }

      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rows.length) {
        throw new Error('La hoja de Google Sheets no contiene datos.');
      }

      const columns = normalizeColumns(rows);
      dispatch(setExcelData({ rows, columns, filename: `Google Sheets (${parsed.spreadsheetId})` }));
      setMessage({
        type: 'success',
        text: `Hoja cargada desde Google Sheets — ${rows.length} registros · ${columns.length} columnas`,
      });
      setSheetUrl('');
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    setMessage(null);
    setSearch('');
    setPage(0);
    try {
      const rows = await readExcelFile(file);
      if (!rows.length) throw new Error('El archivo Excel está vacío.');
      const columns = normalizeColumns(rows);

      // FIX 1: guardar en Redux con la acción del slice
      dispatch(setExcelData({ rows, columns, filename: file.name }));

      setMessage({
        type: 'success',
        text: `✓ "${file.name}" cargado — ${rows.length} registros · ${columns.length} columnas detectadas`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearExcel = () => {
    // FIX 1: limpiar desde Redux
    dispatch(clearExcelData());
    setSearch('');
    setPage(0);
    setMessage({ type: 'info', text: 'Datos importados eliminados. Mostrando inventario base.' });
    setTimeout(() => setMessage(null), 3000);
  };

  // ── Exportar ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!filteredData.length) return;
    // FIX 3: exportar filteredData, no activeData completo
    exportToExcel(filteredData, activeColumns, excelData ? 'exportado' : 'equipos');
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditing(null);
    setForm({});
    setOpen(true);
  };

  // FIX 2: recibe índice explícito desde el map, sin indexOf
  const handleOpenEdit = (row, realIndex) => {
    setEditing({ row, index: realIndex });
    setForm({ ...row });
    setOpen(true);
  };

  const handleSave = () => {
    if (excelData && editingRow !== null) {
      // FIX 1 + 2: usar acción Redux con índice real
      dispatch(updateExcelRow({ index: editingRow.index, row: { ...form } }));
    } else if (editingRow !== null) {
      dispatch(updateEquipo({ ...form, id: editingRow.row.id }));
    } else {
      const newId = Math.max(0, ...equiposRedux.map((e) => e.id || 0)) + 1;
      dispatch(addEquipo({ ...form, id: newId }));
    }
    setOpen(false);
  };

  const handleDelete = (row, realIndex) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    if (excelData) {
      // FIX 1 + 2: usar acción Redux con índice real
      dispatch(deleteExcelRow(realIndex));
    } else {
      dispatch(deleteEquipo(row.id));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Cabecera */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ minWidth: 280, flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Gestión de datos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {excelData
              ? `Mostrando: ${excelData.filename}`
              : 'Inventario base del sistema'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ width: '100%' }}>
            <TextField
              size="small"
              label="URL de Google Sheets"
              placeholder="Pega aquí el enlace de la hoja"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLoadGoogleSheet}
              disabled={!sheetUrl.trim()}
              sx={{ whiteSpace: 'nowrap', minWidth: 140 }}
            >
              Cargar hoja
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <Tooltip title={excelData ? 'Cargar un nuevo Excel y reemplazar los datos actuales' : 'Cargar archivo Excel'}>
            <Button
              variant="contained"
              startIcon={<FileUpload />}
              onClick={() => fileInputRef.current?.click()}
              color={excelData ? 'warning' : 'primary'}
            >
              {excelData ? 'Reemplazar Excel' : 'Cargar Excel'}
            </Button>
          </Tooltip>

          {excelData && (
            <Tooltip title="Volver a los datos base">
              <Button variant="outlined" color="error" startIcon={<Close />} onClick={handleClearExcel}>
                Limpiar
              </Button>
            </Tooltip>
          )}

          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExport}
            disabled={!filteredData.length}
          >
            Exportar
          </Button>

          {!excelData && (
            <Button variant="outlined" startIcon={<Add />} onClick={handleOpenAdd}>
              Nuevo registro
            </Button>
          )}
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Fade in={!!message}>
        <Box sx={{ mb: message ? 2 : 0 }}>
          {message && (
            <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ borderRadius: 2 }}>
              {message.text}
            </Alert>
          )}
        </Box>
      </Fade>

      {excelData && (
        <Paper
          variant="outlined"
          sx={{
            mb: 2, p: 1.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
            borderColor: 'success.light', bgcolor: 'success.50', borderRadius: 2,
          }}
        >
          <TableChart color="success" fontSize="small" />
          <Typography variant="body2" color="success.dark" fontWeight={500}>
            <strong>{excelData.filename}</strong>
            {' — '}{excelData.rows.length} registros · {excelData.columns.length} columnas
          </Typography>
          <Chip
            label="Al cargar otro Excel este se reemplaza"
            size="small"
            color="warning"
            sx={{ ml: 'auto', fontSize: '0.65rem' }}
          />
        </Paper>
      )}

      {/* Tabla */}
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Buscar en todos los campos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, maxWidth: 420 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
            {filteredData.length !== activeData.length
              ? `${filteredData.length} de ${activeData.length} registros`
              : `${activeData.length} registros`}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', width: 44 }}>#</TableCell>
                {activeColumns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{ fontWeight: 700, bgcolor: 'grey.50', whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', width: 90, textAlign: 'center' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={activeColumns.length + 2}
                    align="center"
                    sx={{ py: 8, color: 'text.disabled' }}
                  >
                    {activeData.length === 0
                      ? 'No hay datos. Carga un archivo o usa una URL de Google Sheets con los controles de arriba.'
                      : 'Sin resultados para la búsqueda.'}
                  </TableCell>
                </TableRow>
              ) : (
                // FIX 2: idx se usa para calcular el índice real en activeData
                paginated.map((row, idx) => {
                  const filteredIndex = page * rowsPerPage + idx;
                  const realIndex = activeData.indexOf(filteredData[filteredIndex]);
                  const rowKey = row.id != null ? row.id : realIndex;

                  return (
                    <TableRow key={rowKey} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                        {filteredIndex + 1}
                      </TableCell>

                      {activeColumns.map((col) => {
                        const value = row[col.key];
                        const displayVal = value !== '' && value != null ? String(value) : '—';

                        return (
                          <TableCell
                            key={col.key}
                            sx={{
                              fontSize: '0.78rem',
                              whiteSpace: 'nowrap',
                              maxWidth: 240,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {looksLikeStatus(col.key) && value ? (
                              <Chip
                                label={displayVal}
                                size="small"
                                color={getChipColor(value)}
                                sx={{ fontSize: '0.68rem', height: 20 }}
                              />
                            ) : (
                              <Tooltip
                                title={displayVal}
                                placement="top-start"
                                enterDelay={700}
                                disableHoverListener={displayVal.length < 30}
                              >
                                <span>{displayVal}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                        );
                      })}

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Editar registro" placement="top">
                            <IconButton
                              size="small"
                              // FIX 2: pasar realIndex explícito al handler
                              onClick={() => handleOpenEdit(row, realIndex)}
                              sx={{
                                color: 'primary.main',
                                bgcolor: 'primary.50',
                                '&:hover': { bgcolor: 'primary.100' },
                                borderRadius: 1,
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar registro" placement="top">
                            <IconButton
                              size="small"
                              color="error"
                              // FIX 2: pasar realIndex explícito al handler
                              onClick={() => handleDelete(row, realIndex)}
                              sx={{
                                bgcolor: 'error.50',
                                '&:hover': { bgcolor: 'error.100' },
                                borderRadius: 1,
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>

      {/* Modal CRUD */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingRow ? 'Editar registro' : 'Nuevo registro'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {(excelData ? activeColumns : BASE_COLUMNS).map((col) => (
              <TextField
                key={col.key}
                label={col.label}
                value={form[col.key] ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, [col.key]: e.target.value }))}
                fullWidth
                size="small"
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingRow ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Equipos;