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
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FileUpload, FileDownload, Close, TableChart,
} from '@mui/icons-material';

// ─── Leer Excel — retorna TODAS las hojas ─────────────────────────────────────
const readExcelFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });

        // Leer todas las hojas
        const allSheets = {};
        wb.SheetNames.forEach((name) => {
          const ws = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          allSheets[name] = rows;
        });

        resolve({ sheetNames: wb.SheetNames, allSheets });
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

// ─── Extraer ID de Google Sheet ────────────────────────────────────────────────
const extractSheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// ─── Obtener hojas de Google Sheets ───────────────────────────────────────────
const fetchGoogleSheetMetadata = async (sheetId) => {
  try {
    // Intentamos cargar la primera hoja para verificar que el documento es válido
    const testUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    const testResponse = await fetch(testUrl, { mode: 'no-cors' });
    if (!testResponse.ok && testResponse.status !== 0) {
      throw new Error('No se pudo acceder al Google Sheet');
    }
    return true;
  } catch {
    return false;
  }
};

// ─── Detectar todas las hojas del Google Sheet ──────────────────────────────────
const detectAllGoogleSheets = async (sheetId) => {
  const sheets = {};
  const maxSheets = 20; // Intentar hasta 20 hojas (gid 0-19)
  
  try {
    for (let gid = 0; gid < maxSheets; gid++) {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        
        if (!response.ok) break; // Si falla, probablemente no hay más hojas
        
        const csv = await response.text();
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          // Si tiene contenido, la agregamos
          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            const row = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx] || '';
            });
            return row;
          });
          
          const sheetName = `📊 Hoja ${gid + 1}`;
          sheets[sheetName] = { rows, gid };
        }
      } catch {
        // Continuar con el siguiente gid si hay error
        continue;
      }
    }
  } catch {
    // Error al detectar hojas
  }
  
  return sheets;
};

// ─── Columnas desde filas ─────────────────────────────────────────────────────
const normalizeColumns = (rows) =>
  rows.length > 0
    ? Object.keys(rows[0]).map((key) => ({ key, label: key }))
    : [];

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

  const equiposRedux = useSelector((s) => s.equipos.list ?? []);
  const excelData    = useSelector((s) => s.equipos.excelData);

  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState(null);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // ── Estado hojas ────────────────────────────────────────────────────────────
  const [sheetNames, setSheetNames]   = useState([]);   // todas las hojas del Excel
  const [allSheets, setAllSheets]     = useState({});   // { nombre: rows[] }
  const [activeSheet, setActiveSheet] = useState('');   // hoja seleccionada

  // ── Estado Google Sheets ───────────────────────────────────────────────────
  const [googleSheetUrl, setGoogleSheetUrl]   = useState('');
  const [googleSheetId, setGoogleSheetId]     = useState('');
  const [googleSheets, setGoogleSheets]       = useState({});   // { gid: rows[] }
  const [googleSheetNames, setGoogleSheetNames] = useState([]);
  const [activeGoogleSheet, setActiveGoogleSheet] = useState('');
  const [showGoogleUrlDialog, setShowGoogleUrlDialog] = useState(false);

  const [open, setOpen]          = useState(false);
  const [editingRow, setEditing] = useState(null);
  const [form, setForm]          = useState({});

  const fileInputRef = useRef(null);

  // ── Datos activos según hoja seleccionada ───────────────────────────────────
  const sheetRows = activeSheet && allSheets[activeSheet]
    ? allSheets[activeSheet]
    : null;

  const googleRows = activeGoogleSheet && googleSheets[activeGoogleSheet]
    ? googleSheets[activeGoogleSheet]
    : null;

  const activeData    = googleRows ?? sheetRows ?? excelData?.rows ?? equiposRedux;
  const activeColumns = googleRows
    ? normalizeColumns(googleRows)
    : sheetRows
    ? normalizeColumns(sheetRows)
    : excelData?.columns ?? BASE_COLUMNS;

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
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    setMessage(null);
    setSearch('');
    setPage(0);

    try {
      const { sheetNames: names, allSheets: sheets } = await readExcelFile(file);
      if (!names.length) throw new Error('El archivo Excel está vacío.');

      // Guardar todas las hojas en estado local
      setSheetNames(names);
      setAllSheets(sheets);

      // Cargar la primera hoja por defecto
      const firstSheet = names[0];
      setActiveSheet(firstSheet);

      const firstRows    = sheets[firstSheet];
      const firstColumns = normalizeColumns(firstRows);

      // Guardar en Redux la primera hoja (para Dashboard)
      dispatch(setExcelData({ rows: firstRows, columns: firstColumns, filename: file.name }));

      setMessage({
        type: 'success',
        text: `✓ "${file.name}" cargado — ${names.length} hoja(s) · ${firstRows.length} registros en "${firstSheet}"`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Cambiar hoja activa ─────────────────────────────────────────────────────
  const handleSheetChange = (e) => {
    const name = e.target.value;
    setActiveSheet(name);
    setSearch('');
    setPage(0);

    // Actualizar Redux con la hoja seleccionada (para que Dashboard también la vea)
    const rows    = allSheets[name] ?? [];
    const columns = normalizeColumns(rows);
    dispatch(setExcelData({ rows, columns, filename: excelData?.filename ?? '' }));

    setMessage({
      type: 'info',
      text: `Hoja "${name}" cargada — ${rows.length} registros · ${columns.length} columnas`,
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleClearExcel = () => {
    dispatch(clearExcelData());
    setSheetNames([]);
    setAllSheets({});
    setActiveSheet('');
    setSearch('');
    setPage(0);
    setMessage({ type: 'info', text: 'Excel eliminado. Mostrando inventario base.' });
    setTimeout(() => setMessage(null), 3000);
  };

  // ── Google Sheets ───────────────────────────────────────────────────────────
  const handleLoadGoogleSheet = async () => {
    if (!googleSheetUrl.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa una URL válida de Google Sheet' });
      return;
    }

    const sheetId = extractSheetId(googleSheetUrl);
    if (!sheetId) {
      setMessage({ type: 'error', text: 'URL de Google Sheet inválida. Verifica el enlace.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const isValid = await fetchGoogleSheetMetadata(sheetId);
      if (!isValid) throw new Error('No se pudo acceder al documento');

      // Detectar todas las hojas disponibles
      const allDetectedSheets = await detectAllGoogleSheets(sheetId);
      
      if (!Object.keys(allDetectedSheets).length) {
        throw new Error('No se encontraron hojas con contenido en este Google Sheet');
      }

      const sheetNamesList = Object.keys(allDetectedSheets);
      const firstSheetName = sheetNamesList[0];
      const firstSheetData = allDetectedSheets[firstSheetName];

      // Crear objeto con solo las filas para mantener compatibilidad
      const newSheets = {};
      Object.entries(allDetectedSheets).forEach(([name, data]) => {
        newSheets[name] = data.rows;
      });

      setGoogleSheetId(sheetId);
      setGoogleSheets(newSheets);
      setGoogleSheetNames(sheetNamesList);
      setActiveGoogleSheet(firstSheetName);
      setSearch('');
      setPage(0);

      setMessage({
        type: 'success',
        text: `✓ Google Sheet cargado — ${sheetNamesList.length} hoja(s) · ${firstSheetData.rows.length} registros`,
      });

      setShowGoogleUrlDialog(false);
      setGoogleSheetUrl('');

      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearGoogleSheet = () => {
    setGoogleSheetUrl('');
    setGoogleSheetId('');
    setGoogleSheets({});
    setGoogleSheetNames([]);
    setActiveGoogleSheet('');
    setSearch('');
    setPage(0);
    setMessage({ type: 'info', text: 'Google Sheet eliminado. Mostrando inventario base.' });
    setTimeout(() => setMessage(null), 3000);
  };

  // ── Exportar ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!filteredData.length) return;
    exportToExcel(filteredData, activeColumns, activeSheet || (excelData ? 'exportado' : 'equipos'));
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditing(null);
    setForm({});
    setOpen(true);
  };

  const handleOpenEdit = (row, realIndex) => {
    setEditing({ row, index: realIndex });
    setForm({ ...row });
    setOpen(true);
  };

  const handleSave = () => {
    if (excelData && editingRow !== null) {
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
        <Box>
          <Typography variant="h5" fontWeight={700}>Gestión de Equipos</Typography>
          <Typography variant="body2" color="text.secondary">
            {excelData
              ? `Mostrando: ${excelData.filename}${activeSheet ? ` › ${activeSheet}` : ''}`
              : 'Inventario base del sistema'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.xlsm,.xlsb,.ods,.csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Botón cargar */}
          <Tooltip title={excelData ? 'Carga un nuevo Excel (borra el actual)' : 'Cargar archivo Excel'}>
            <Button
              variant="contained"
              startIcon={<FileUpload />}
              onClick={() => fileInputRef.current?.click()}
              color={excelData ? 'warning' : 'primary'}
            >
              {excelData ? 'Reemplazar Excel' : 'Cargar Excel'}
            </Button>
          </Tooltip>

          {/* Botón Google Sheets */}
          <Tooltip title="Cargar desde Google Sheets">
            <Button
              variant="contained"
              startIcon={<FileUpload />}
              onClick={() => setShowGoogleUrlDialog(true)}
              color={googleSheetId ? 'success' : 'info'}
            >
              {googleSheetId ? 'Google Sheet ✓' : 'Google Sheet'}
            </Button>
          </Tooltip>

          {/* Select de hojas — aparece solo cuando hay Excel cargado */}
          {sheetNames.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Hoja Excel</InputLabel>
              <Select
                value={activeSheet}
                label="Hoja Excel"
                onChange={handleSheetChange}
              >
                {sheetNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    📋 {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Select de hojas Google — aparece solo cuando hay Google Sheet cargado */}
          {googleSheetNames.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Hoja Google</InputLabel>
              <Select
                value={activeGoogleSheet}
                label="Hoja Google"
                onChange={(e) => {
                  const gid = e.target.value;
                  setActiveGoogleSheet(gid);
                  setSearch('');
                  setPage(0);
                }}
              >
                {googleSheetNames.map((name, idx) => (
                  <MenuItem key={idx} value={name}>
                    📊 {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {excelData && (
            <Tooltip title="Volver al inventario base">
              <Button variant="outlined" color="error" startIcon={<Close />} onClick={handleClearExcel}>
                Limpiar
              </Button>
            </Tooltip>
          )}

          {googleSheetId && (
            <Tooltip title="Eliminar Google Sheet">
              <Button variant="outlined" color="error" startIcon={<Close />} onClick={handleClearGoogleSheet}>
                Limpiar Google
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
              Nuevo
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
            display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
            borderColor: 'success.light', bgcolor: 'success.50', borderRadius: 2,
          }}
        >
          <TableChart color="success" fontSize="small" />
          <Typography variant="body2" color="success.dark" fontWeight={500}>
            <strong>{excelData.filename}</strong>
            {' — '}{activeData.length} registros · {activeColumns.length} columnas
            {activeSheet && <> · Hoja: <strong>{activeSheet}</strong></>}
          </Typography>
          {sheetNames.length > 1 && (
            <Chip
              label={`${sheetNames.length} hojas disponibles`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
          )}
          <Chip
            label="Al cargar otro Excel este se reemplaza"
            size="small"
            color="warning"
            sx={{ ml: 'auto', fontSize: '0.65rem' }}
          />
        </Paper>
      )}

      {googleSheetId && (
        <Paper
          variant="outlined"
          sx={{
            mb: 2, p: 1.5,
            display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
            borderColor: 'info.light', bgcolor: 'info.50', borderRadius: 2,
          }}
        >
          <TableChart color="info" fontSize="small" />
          <Typography variant="body2" color="info.dark" fontWeight={500}>
            <strong>Google Sheet</strong>
            {' — '}{activeData.length} registros · {activeColumns.length} columnas
            {activeGoogleSheet && <> · Hoja: <strong>{activeGoogleSheet}</strong></>}
          </Typography>
          {googleSheetNames.length > 1 && (
            <Chip
              label={`${googleSheetNames.length} hojas disponibles`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
          )}
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
                      ? 'No hay datos. Carga un archivo Excel con el botón de arriba.'
                      : 'Sin resultados para la búsqueda.'}
                  </TableCell>
                </TableRow>
              ) : (
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
                              onClick={() => handleOpenEdit(row, realIndex)}
                              sx={{
                                color: 'primary.main', bgcolor: 'primary.50',
                                '&:hover': { bgcolor: 'primary.100' }, borderRadius: 1,
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar registro" placement="top">
                            <IconButton
                              size="small" color="error"
                              onClick={() => handleDelete(row, realIndex)}
                              sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' }, borderRadius: 1 }}
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
        <DialogTitle>{editingRow ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {(excelData ? activeColumns : BASE_COLUMNS).map((col) => (
              <TextField
                key={col.key}
                label={col.label}
                value={form[col.key] ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, [col.key]: e.target.value }))}
                fullWidth size="small"
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

      {/* Modal Google Sheet URL */}
      <Dialog open={showGoogleUrlDialog} onClose={() => setShowGoogleUrlDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cargar Google Sheet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Ingresa el enlace de tu Google Sheet compartido. Asegúrate de que el documento sea accesible públicamente.
            </Typography>
            <TextField
              fullWidth
              label="URL de Google Sheet"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLoadGoogleSheet();
                }
              }}
              helperText="Ejemplo: https://docs.google.com/spreadsheets/d/1abc123xyz/edit"
              disabled={loading}
            />
            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
              💡 Consejo: Verifica que el documento tenga permisos de visualización pública o compartido.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGoogleUrlDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleLoadGoogleSheet}
            disabled={loading || !googleSheetUrl.trim()}
          >
            {loading ? 'Cargando...' : 'Cargar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Equipos;