// ------------------------------
// Dependencies and Imports
// ------------------------------
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, MenuItem, Chip, Stack, InputAdornment,
} from '@mui/material';
import { Build, Warning, CheckCircle, Inventory, Search, FilterList } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line,
} from 'recharts';

// ------------------------------
// Palette and Helper Utilities
// ------------------------------
const PIE_COLORS = ['#1976d2', '#90caf9', '#546e7a', '#2e7d32', '#ffc107', '#ab47bc'];

const columnHasValues = (rows, key) =>
  rows.some((r) => r[key] !== undefined && r[key] !== '' && r[key] !== 'N/A');

const groupBy = (rows, key) => {
  const map = {};
  rows.forEach((r) => {
    const v = r[key] ?? '(sin dato)';
    map[v] = (map[v] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const getUnique = (rows, key) =>
  [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort();

const detectKeys = (columns) => {
  const keys = columns.map((c) => c.key);
  const find = (patterns) =>
    keys.find((k) => patterns.some((p) => new RegExp(p, 'i').test(k))) ?? null;
  return {
    estadoKey: find(['estado', 'status', 'condici']),
    tipoKey:   find(['tipo', 'type', 'categoria', 'categoría', 'clase']),
    sedeKey:   find(['sede', 'site', 'ubicaci', 'local']),
    marcaKey:  find(['marca', 'brand', 'fabricante']),
  };
};

// ------------------------------
// Dashboard UI Components
// ------------------------------
const StatCard = ({ icon, label, value, color, subtitle }) => (
  <Card elevation={1} sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 52, height: 52, borderRadius: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1.1}>{value}</Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">{label}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const MiniBarChart = ({ data, dataKey = 'value', nameKey = 'name', title, color = '#1976d2' }) => (
  <Card elevation={1} sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper' }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -24, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={48} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} labelStyle={{ fontWeight: 600 }} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} name="Cantidad" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const MiniPieChart = ({ data, title }) => (
  <Card elevation={1} sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper' }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={88}
            paddingAngle={4} dataKey="value" nameKey="name">
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const AnalyticsChart = ({ data }) => (
  <Card elevation={1} sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper' }}>
    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Analítica detallada</Typography>
        <Typography variant="body2" color="text.secondary">Comparativo de mantenimiento mensual</Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="pendiente" barSize={20} fill="#1976d2" name="Pendientes" />
            <Bar dataKey="completado" barSize={20} fill="#90caf9" name="Completados" />
            <Line type="monotone" dataKey="total" stroke="#546e7a" strokeWidth={3} dot={{ r: 4 }} name="Total" />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

// ------------------------------
// FilterPanel — reemplaza MiniPieChart de sede
// Panel izquierdo: filtros | Panel derecho: donut del resultado
// ------------------------------
const FilterPanel = ({ rows, sedeKey, estadoKey, tipoKey, onFiltered }) => {
  const [sede,   setSede]   = useState('');
  const [estado, setEstado] = useState('');
  const [tipo,   setTipo]   = useState('');
  const [texto,  setTexto]  = useState('');

  const sedes   = useMemo(() => getUnique(rows, sedeKey   || 'sede'),   [rows, sedeKey]);
  const estados = useMemo(() => getUnique(rows, estadoKey || 'estado'), [rows, estadoKey]);
  const tipos   = useMemo(() => getUnique(rows, tipoKey   || 'tipo'),   [rows, tipoKey]);

  const filtered = useMemo(() => {
    let result = [...rows];
    if (sede)   result = result.filter(r => r[sedeKey   || 'sede']   === sede);
    if (estado) result = result.filter(r => r[estadoKey || 'estado'] === estado);
    if (tipo)   result = result.filter(r => r[tipoKey   || 'tipo']   === tipo);
    if (texto) {
      const q = texto.toLowerCase();
      result = result.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(q))
      );
    }
    return result;
  }, [rows, sede, estado, tipo, texto, sedeKey, estadoKey, tipoKey]);

  // Notifica al padre cada vez que cambia el resultado
  useMemo(() => { onFiltered(filtered); }, [filtered, onFiltered]);

  // Chips activos
  const chips = [
    sede   && { label: `Sede: ${sede}`,   onDelete: () => setSede('')   },
    estado && { label: `Estado: ${estado}`, onDelete: () => setEstado('') },
    tipo   && { label: `Tipo: ${tipo}`,   onDelete: () => setTipo('')   },
    texto  && { label: `Texto: "${texto}"`, onDelete: () => setTexto('') },
  ].filter(Boolean);

  // Donut: distribución del campo más relevante según filtro activo
  const donutKey  = estado ? (tipoKey || 'tipo') : (estadoKey || 'estado');
  const donutData = useMemo(() =>
    groupBy(filtered, donutKey).slice(0, 6),
    [filtered, donutKey]
  );

  return (
    <Card elevation={1} sx={{ borderRadius: 3, bgcolor: 'background.paper', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>Filtros del Dashboard</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {filtered.length} / {rows.length} equipos
          </Typography>
        </Box>

        {/* Filtros + Donut lado a lado */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

          {/* Columna izquierda: selects + búsqueda */}
          <Box sx={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              select size="small" label="Sede" value={sede}
              onChange={e => setSede(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Todas</MenuItem>
              {sedes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>

            <TextField
              select size="small" label="Estado" value={estado}
              onChange={e => setEstado(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>

            <TextField
              select size="small" label="Tipo de equipo" value={tipo}
              onChange={e => setTipo(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              {tipos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>

            <TextField
              size="small" label="Buscar..." value={texto}
              onChange={e => setTexto(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Chips de filtros activos */}
            {chips.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                {chips.map((chip, i) => (
                  <Chip
                    key={i}
                    label={chip.label}
                    onDelete={chip.onDelete}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Columna derecha: donut del resultado filtrado */}
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {estado ? `Por tipo (filtrado por ${estado})` : 'Por estado (resultado filtrado)'}
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData.length > 0 ? donutData : [{ name: 'Sin datos', value: 1 }]}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value" nameKey="name"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ------------------------------
// Main Dashboard Page Component
// ------------------------------
const Dashboard = () => {
  const equiposList    = useSelector((s) => s.equipos.list ?? []);
  const excelData      = useSelector((s) => s.equipos.excelData);
  const mantenimientos = useSelector((s) => s.mantenimiento.list ?? []);

  const activeRows    = excelData ? excelData.rows    : equiposList;
  const activeColumns = excelData ? excelData.columns : null;
  const isExcel       = !!excelData;

  // Filas filtradas por el FilterPanel
  const [filteredRows, setFilteredRows] = useState(activeRows);

  const detectedKeys = useMemo(() => {
    if (!isExcel || !activeColumns) return null;
    return detectKeys(activeColumns);
  }, [isExcel, activeColumns]);

  const estadoKey = isExcel ? detectedKeys?.estadoKey : 'estado';
  const tipoKey   = isExcel ? detectedKeys?.tipoKey   : 'tipo';
  const sedeKey   = isExcel ? detectedKeys?.sedeKey   : 'sede';

  const stats = useMemo(() => {
    const total = activeRows.length;
    if (!isExcel) {
      const enUso           = activeRows.filter((e) => e.estado === 'En uso').length;
      const enMantenimiento = activeRows.filter((e) => e.estado === 'En mantenimiento').length;
      const pendientes      = mantenimientos.filter((m) => m.estado === 'pendiente').length;
      const pct = total > 0 ? Math.round((enUso / total) * 100) : 0;
      return { total, enUso, enMantenimiento, pendientes, pct };
    }
    if (estadoKey && columnHasValues(activeRows, estadoKey)) {
      const KEYWORDS_EN_USO = ['activo', 'en uso', 'operativo', 'bueno', 'si', 'sí', 'yes'];
      const KEYWORDS_MANT   = ['mantenimiento', 'en mantenimiento', 'reparación', 'falla'];
      const enUso           = activeRows.filter((r) => KEYWORDS_EN_USO.includes(String(r[estadoKey]).toLowerCase().trim())).length;
      const enMantenimiento = activeRows.filter((r) => KEYWORDS_MANT.includes(String(r[estadoKey]).toLowerCase().trim())).length;
      const pct = total > 0 ? Math.round((enUso / total) * 100) : 0;
      return { total, enUso, enMantenimiento, pendientes: 0, pct };
    }
    return { total, enUso: 0, enMantenimiento: 0, pendientes: 0, pct: 0 };
  }, [activeRows, isExcel, estadoKey, mantenimientos]);

  const porTipo = useMemo(() => {
    if (!tipoKey) return [];
    return groupBy(filteredRows, tipoKey).slice(0, 6);
  }, [filteredRows, tipoKey]);

  const porSede = useMemo(() => {
    if (!sedeKey) return [];
    return groupBy(filteredRows, sedeKey).slice(0, 6);
  }, [filteredRows, sedeKey]);

  const maintenanceTimeline = useMemo(() => {
    const timeline = {};
    mantenimientos.forEach((m) => {
      const date = new Date(m.fecha);
      if (Number.isNaN(date)) return;
      const month    = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      const monthKey = date.toISOString().slice(0, 7);
      if (!timeline[monthKey]) {
        timeline[monthKey] = { month, monthKey, pendiente: 0, completado: 0, total: 0 };
      }
      const statusKey = m.estado === 'completado' ? 'completado' : 'pendiente';
      timeline[monthKey][statusKey] += 1;
      timeline[monthKey].total += 1;
    });
    return Object.values(timeline).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [mantenimientos]);

  // Tabla reacciona a filtros
  const detailTableRows = filteredRows.slice(0, 10);
  const detailTableColumns = isExcel
    ? (activeColumns?.slice(0, 5) ?? [])
    : [
        { label: 'Código',     key: 'codigoPatrimonial' },
        { label: 'Marca',      key: 'marca'             },
        { label: 'Modelo',     key: 'modeloSistemas'    },
        { label: 'Procesador', key: 'procesador'        },
        { label: 'RAM',        key: 'ram'               },
      ];

  return (
    <Container maxWidth="xl" sx={{ py: 1, px: { xs: 2, md: 3 } }}>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Grid size="grow" sx={{ minWidth: 250 }}>
          <StatCard icon={<Inventory />} label="Total equipos" value={stats.total} color="primary"
            subtitle={isExcel ? `Desde ${excelData.filename}` : 'Total en el inventario'} />
        </Grid>
        <Grid size="grow" sx={{ minWidth: 250 }}>
          <StatCard icon={<CheckCircle />} label={isExcel && estadoKey ? `Activos (${estadoKey})` : 'En uso'}
            value={stats.enUso} color="success"
            subtitle={stats.total > 0 ? `${stats.pct}% del total` : 'Sin registros'} />
        </Grid>
        <Grid size="grow" sx={{ minWidth: 250 }}>
          <StatCard icon={<Build />} label="En mantenimiento" value={stats.enMantenimiento}
            color="warning" subtitle="Fuera de servicio" />
        </Grid>
        <Grid size="grow" sx={{ minWidth: 250 }}>
          <StatCard icon={<Warning />} label="Pendientes" value={stats.pendientes}
            color="error" subtitle={isExcel ? 'Extraído desde la hoja' : 'Requieren atención'} />
        </Grid>
      </Box>

      {/* FilterPanel + Analytics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 420px' }}>
          <FilterPanel
            rows={activeRows}
            sedeKey={sedeKey}
            estadoKey={estadoKey}
            tipoKey={tipoKey}
            onFiltered={setFilteredRows}
          />
        </Box>
        <Box sx={{ flex: '1 1 350px' }}>
          <AnalyticsChart data={maintenanceTimeline.length > 0
            ? maintenanceTimeline
            : [{ month: 'Sin datos', pendiente: 0, completado: 0, total: 0 }]}
          />
        </Box>
      </Box>

      {/* Tabla de activos — reacciona a filtros */}
      <Card elevation={1} sx={{ borderRadius: 3, mb: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Tabla de activos</Typography>
              <Typography variant="body2" color="text.secondary">
                Vista detallada de los equipos más relevantes del inventario.
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {filteredRows.length} filas mostradas
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {detailTableColumns.map((col) => (
                    <TableCell key={col.key} sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {detailTableRows.map((row, ri) => (
                  <TableRow key={row.id ?? ri} hover>
                    {detailTableColumns.map((col) => (
                      <TableCell key={`${ri}-${col.key}`} sx={{ fontSize: '0.9rem' }}>
                        {row[col.key] !== '' && row[col.key] != null ? String(row[col.key]) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Gráficos inferiores — también reflejan filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <MiniPieChart
            data={porSede.length > 0 ? porSede : [{ name: 'Sin datos', value: 1 }]}
            title={isExcel && sedeKey ? `Distribución por ${sedeKey}` : 'Distribución por sede'}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px' }}>
          <MiniBarChart
            data={porTipo.length > 0 ? porTipo : [{ name: 'Sin datos', value: 0 }]}
            nameKey="name"
            title={isExcel && tipoKey ? `Equipos por ${tipoKey}` : 'Equipos por tipo'}
            color="#1976d2"
          />
        </Box>
      </Box>

    </Container>
  );
};

export default Dashboard;