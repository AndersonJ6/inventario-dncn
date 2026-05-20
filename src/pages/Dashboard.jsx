// ------------------------------
// Dependencies and Imports
// ------------------------------
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
//import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Container, //Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { Build, Warning, CheckCircle, Inventory } from '@mui/icons-material';
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

// Mini pie chart card component
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

// Analytics line/bar chart card component
const AnalyticsChart = ({ data }) => (
  <Card elevation={1} sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper' }}>
    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Analítica detallada</Typography>
          <Typography variant="body2" color="text.secondary">Comparativo de mantenimiento mensual</Typography>
        </Box>
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
// Main Dashboard Page Component
// ------------------------------
const Dashboard = () => {
  const equiposList    = useSelector((s) => s.equipos.list ?? []);
  const excelData      = useSelector((s) => s.equipos.excelData);
  const mantenimientos = useSelector((s) => s.mantenimiento.list ?? []);

  const activeRows    = excelData ? excelData.rows    : equiposList;
  const activeColumns = excelData ? excelData.columns : null;
  const isExcel       = !!excelData;

  const detectedKeys = useMemo(() => {
    if (!isExcel || !activeColumns) return null;
    return detectKeys(activeColumns);
  }, [isExcel, activeColumns]);

  const estadoKey = isExcel ? detectedKeys?.estadoKey : 'estado';
  const tipoKey   = isExcel ? detectedKeys?.tipoKey   : 'tipo';
  const sedeKey   = isExcel ? detectedKeys?.sedeKey   : 'sede';
  //const marcaKey  = isExcel ? detectedKeys?.marcaKey  : 'marca';

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
      const KEYWORDS_EN_USO  = ['activo', 'en uso', 'operativo', 'bueno', 'si', 'sí', 'yes'];
      const KEYWORDS_MANT    = ['mantenimiento', 'en mantenimiento', 'reparación', 'falla'];
      const enUso            = activeRows.filter((r) => KEYWORDS_EN_USO.includes(String(r[estadoKey]).toLowerCase().trim())).length;
      const enMantenimiento  = activeRows.filter((r) => KEYWORDS_MANT.includes(String(r[estadoKey]).toLowerCase().trim())).length;
      const pct = total > 0 ? Math.round((enUso / total) * 100) : 0;
      return { total, enUso, enMantenimiento, pendientes: 0, pct };
    }

    return { total, enUso: 0, enMantenimiento: 0, pendientes: 0, pct: 0 };
  }, [activeRows, isExcel, estadoKey, mantenimientos]);

  const porTipo = useMemo(() => {
    if (!tipoKey) return [];
    return groupBy(activeRows, tipoKey).slice(0, 6);
  }, [activeRows, tipoKey]);

  const porSede = useMemo(() => {
    if (!sedeKey) return [];
    return groupBy(activeRows, sedeKey).slice(0, 6);
  }, [activeRows, sedeKey]);

  {/*
  const extraCharts = useMemo(() => {
    if (!isExcel || !activeColumns) return [];
    const usedKeys = [estadoKey, tipoKey, sedeKey, marcaKey].filter(Boolean);
    return activeColumns
      .filter((col) => {
        if (usedKeys.includes(col.key)) return false;
        const uniq = new Set(activeRows.map((r) => r[col.key])).size;
        return uniq >= 2 && uniq <= 15 && columnHasValues(activeRows, col.key);
      })
      .slice(0, 2)
      .map((col) => ({ key: col.key, label: col.label, data: groupBy(activeRows, col.key) }));
  }, [isExcel, activeColumns, activeRows, estadoKey, tipoKey, sedeKey, marcaKey]);*/}

  const maintenanceTimeline = useMemo(() => {
    const timeline = {};
    mantenimientos.forEach((m) => {
      const date = new Date(m.fecha);
      if (Number.isNaN(date)) return;
      const month = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
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

  const detailTableRows = isExcel ? activeRows.slice(0, 6) : equiposList.slice(0, 6);
  const detailTableColumns = isExcel
    ? (activeColumns?.slice(0, 5) ?? [])
    : [
      { label: 'Código', key: 'codigoPatrimonial' },
      { label: 'Marca', key: 'marca' },
      { label: 'Modelo', key: 'modeloSistemas' },
      { label: 'Procesador', key: 'procesador' },
      { label: 'RAM', key: 'ram' },
    ];

  //const navigate = useNavigate();
  //const handleNewEquipo = () => navigate('/equipos');

  return (
    <Container maxWidth="xl" sx={{ py: 1, px: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Grid size="grow" sx={{ minWidth: 250 }}>
            <StatCard
              icon={<Inventory />}
              label="Total equipos"
              value={stats.total}
              color="primary"
              subtitle={isExcel ? `Desde ${excelData.filename}` : 'Total en el inventario'}
            />
          </Grid>
          <Grid size="grow" sx={{ minWidth: 250 }}>
            <StatCard
              icon={<CheckCircle />}
              label={isExcel && estadoKey ? `Activos (${estadoKey})` : 'En uso'}
              value={stats.enUso}
              color="success"
              subtitle={stats.total > 0 ? `${stats.pct}% del total` : 'Sin registros'}
            />
          </Grid>
          <Grid size="grow" sx={{ minWidth: 250 }}>
            <StatCard
              icon={<Build />}
              label="En mantenimiento"
              value={stats.enMantenimiento}
              color="warning"
              subtitle="Fuera de servicio"
            />
          </Grid>
          <Grid size="grow" sx={{ minWidth: 250 }}>
            <StatCard
              icon={<Warning />}
              label="Pendientes"
              value={stats.pendientes}
              color="error"
              subtitle={isExcel ? 'Extraído desde la hoja' : 'Requieren atención'}
            />
          </Grid>
        </Box>
      
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1, flexGrow: 1 }}>
          
            <Grid size="auto" sx={{ minWidth: 450 }}>
                  <MiniPieChart
                    data={porSede.length > 0 ? porSede : [{ name: 'Sin datos', value: 1 }]}
                    title={isExcel && sedeKey ? `Distribución por ${sedeKey}` : 'Distribución por sede'}
                  />
            </Grid>
                
            <Grid size="grow" sx={{ minWidth: 250 }}>
              <AnalyticsChart data={maintenanceTimeline.length > 0 ? maintenanceTimeline : [{ month: 'Sin datos', pendiente: 0, completado: 0, total: 0 }]} />
            </Grid>
              
        </Box>
      

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
              {detailTableRows.length} filas mostradas
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {detailTableColumns.map((column) => (
                    <TableCell key={column.key} sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {detailTableRows.map((row, rowIndex) => (
                  <TableRow key={row.id ?? rowIndex} hover>
                    {detailTableColumns.map((column) => (
                      <TableCell key={`${rowIndex}-${column.key}`} sx={{ fontSize: '0.9rem' }}>
                        {row[column.key] !== '' && row[column.key] != null ? String(row[column.key]) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          
            <Grid size="grow" sx={{ minWidth: 250 }}>
              <MiniPieChart
                data={porSede.length > 0 ? porSede : [{ name: 'Sin datos', value: 1 }]}
                title={isExcel && sedeKey ? `Distribución por ${sedeKey}` : 'Distribución por sede'}
              />
            </Grid>
            <Grid size="grow" sx={{ minWidth: 250 }} >
              <MiniBarChart
                data={porTipo.length > 0 ? porTipo : [{ name: 'Sin datos', value: 0 }]}
                nameKey="name"
                title={isExcel && tipoKey ? `Equipos por ${tipoKey}` : 'Equipos por tipo'}
                color="#1976d2"
              />
            </Grid>
        
        </Box>
{/*
      {extraCharts.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Otras distribuciones detectadas
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {extraCharts.map((chart) => (
              <Grid item xs={12} md={6} key={chart.key}>
                <MiniBarChart
                  data={chart.data}
                  nameKey="name"
                  title={`Por ${chart.label}`}
                  color="#e65100"
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}*/}
    </Container>
  );
};

export default Dashboard;