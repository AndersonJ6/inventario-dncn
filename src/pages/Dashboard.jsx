import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar,
  List, ListItem, ListItemText, ListItemAvatar, Divider,
} from '@mui/material';
import { Build, Warning, CheckCircle, Inventory } from '@mui/icons-material';
import ExportImportButtons from '../components/cammon/ExportImportButtons';
import { exportTodoExcel }  from '../services/excelService';
import { exportReportePDF } from '../services/pdfService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#1976d2', '#2e7d32', '#e65100', '#546e7a', '#7b1fa2', '#c62828'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Dado un array de filas y un nombre de columna, devuelve true si esa columna
 * existe en al menos una fila con valor real (no vacío, no 'N/A').
 */
const columnHasValues = (rows, key) =>
  rows.some((r) => r[key] !== undefined && r[key] !== '' && r[key] !== 'N/A');

/**
 * Agrupa filas por el valor de `key` y cuenta cuántas hay de cada valor.
 * Devuelve array [{ name, value }] ordenado de mayor a menor.
 */
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

/**
 * Detecta qué columnas del Excel podrían representar "estado", "tipo" y "sede"
 * usando heurística de nombre. Devuelve { estadoKey, tipoKey, sedeKey }.
 */
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

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, subtitle }) => (
  <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 48, height: 48, borderRadius: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1.2}>{value}</Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">{label}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── MiniBarChart ─────────────────────────────────────────────────────────────
const MiniBarChart = ({ data, dataKey = 'value', nameKey = 'name', title, color = '#1976d2' }) => (
  <Card elevation={1} sx={{ borderRadius: 2 }}>
    <CardContent sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={40} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} labelStyle={{ fontWeight: 600 }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} name="Cantidad" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// ─── MiniPieChart ─────────────────────────────────────────────────────────────
const MiniPieChart = ({ data, title }) => (
  <Card elevation={1} sx={{ borderRadius: 2 }}>
    <CardContent sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            paddingAngle={3} dataKey="value" nameKey="name">
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const Dashboard = () => {
  // ── Datos de Redux ──────────────────────────────────────────────────────────
  const equiposList    = useSelector((s) => s.equipos.list ?? []);
  const excelData      = useSelector((s) => s.equipos.excelData);   // puede ser null
  const mantenimientos = useSelector((s) => s.mantenimiento.list ?? []);
  const movimientos    = useSelector((s) => s.movimientos.list ?? []);
  const usuarios       = useSelector((s) => s.usuarios.list ?? []);

  // ── Fuente activa: Excel tiene prioridad sobre el inventario base ───────────
  const activeRows    = excelData ? excelData.rows    : equiposList;
  const activeColumns = excelData ? excelData.columns : null; // null = modo base
  const isExcel       = !!excelData;

  // ── Detectar qué columnas usar (modo Excel dinámico) ───────────────────────
  const detectedKeys = useMemo(() => {
    if (!isExcel || !activeColumns) return null;
    return detectKeys(activeColumns);
  }, [isExcel, activeColumns]);

  // ── Claves efectivas según fuente ──────────────────────────────────────────
  const estadoKey = isExcel ? detectedKeys?.estadoKey : 'estado';
  const tipoKey   = isExcel ? detectedKeys?.tipoKey   : 'tipo';
  const sedeKey   = isExcel ? detectedKeys?.sedeKey   : 'sede';
  const marcaKey  = isExcel ? detectedKeys?.marcaKey  : 'marca';

  // ── Stats de tarjetas superiores ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total = activeRows.length;

    // Modo base: usa campos conocidos
    if (!isExcel) {
      const enUso           = activeRows.filter((e) => e.estado === 'En uso').length;
      const enMantenimiento = activeRows.filter((e) => e.estado === 'En mantenimiento').length;
      const pendientes      = mantenimientos.filter((m) => m.estado === 'pendiente').length;
      const pct = total > 0 ? Math.round((enUso / total) * 100) : 0;
      return { total, enUso, enMantenimiento, pendientes, pct };
    }

    // Modo Excel: intenta leer estadoKey si existe
    if (estadoKey && columnHasValues(activeRows, estadoKey)) {
      const KEYWORDS_EN_USO  = ['activo', 'en uso', 'operativo', 'bueno', 'si', 'sí', 'yes'];
      const KEYWORDS_MANT    = ['mantenimiento', 'en mantenimiento', 'reparación', 'falla'];
      const enUso            = activeRows.filter((r) => KEYWORDS_EN_USO.includes(String(r[estadoKey]).toLowerCase().trim())).length;
      const enMantenimiento  = activeRows.filter((r) => KEYWORDS_MANT.includes(String(r[estadoKey]).toLowerCase().trim())).length;
      const pct = total > 0 ? Math.round((enUso / total) * 100) : 0;
      return { total, enUso, enMantenimiento, pendientes: 0, pct };
    }

    // Excel sin columna de estado reconocible
    return { total, enUso: 0, enMantenimiento: 0, pendientes: 0, pct: 0 };
  }, [activeRows, isExcel, estadoKey, mantenimientos]);

  // ── Gráfico por estado ─────────────────────────────────────────────────────
  const porEstado = useMemo(() => {
    if (!estadoKey) return [];
    return groupBy(activeRows, estadoKey);
  }, [activeRows, estadoKey]);

  // ── Gráfico por tipo ───────────────────────────────────────────────────────
  const porTipo = useMemo(() => {
    if (!tipoKey) return [];
    return groupBy(activeRows, tipoKey);
  }, [activeRows, tipoKey]);

  // ── Gráfico por sede ───────────────────────────────────────────────────────
  const porSede = useMemo(() => {
    if (!sedeKey) return [];
    return groupBy(activeRows, sedeKey);
  }, [activeRows, sedeKey]);

  // ── Gráfico por marca (solo Excel, modo dinámico) ──────────────────────────
  const porMarca = useMemo(() => {
    if (!isExcel || !marcaKey) return [];
    return groupBy(activeRows, marcaKey).slice(0, 10); // top 10
  }, [activeRows, isExcel, marcaKey]);

  // ── Distribución dinámica: columnas categóricas del Excel ──────────────────
  // Muestra hasta 2 columnas extra que no sean las ya usadas arriba
  const extraCharts = useMemo(() => {
    if (!isExcel || !activeColumns) return [];
    const usedKeys = [estadoKey, tipoKey, sedeKey, marcaKey].filter(Boolean);
    return activeColumns
      .filter((col) => {
        if (usedKeys.includes(col.key)) return false;
        // Solo columnas con pocos valores únicos (categóricas)
        const uniq = new Set(activeRows.map((r) => r[col.key])).size;
        return uniq >= 2 && uniq <= 15 && columnHasValues(activeRows, col.key);
      })
      .slice(0, 2)
      .map((col) => ({ key: col.key, label: col.label, data: groupBy(activeRows, col.key) }));
  }, [isExcel, activeColumns, activeRows, estadoKey, tipoKey, sedeKey, marcaKey]);

  // ── Últimos mantenimientos (solo modo base) ────────────────────────────────
  const ultimosMantenimientos = useMemo(
    () => [...mantenimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5),
    [mantenimientos]
  );

  // ── Columnas del Excel para mostrar en tabla resumen ──────────────────────
  const previewColumns = useMemo(() => {
    if (!isExcel || !activeColumns) return [];
    return activeColumns.slice(0, 6); // primeras 6 columnas
  }, [isExcel, activeColumns]);

  // ── Handlers exportar ─────────────────────────────────────────────────────
  const handleExportExcel = () => exportTodoExcel(equiposList, mantenimientos, movimientos);
  const handleExportPDF   = () => exportReportePDF(equiposList, mantenimientos, movimientos, stats);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Cabecera ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Resumen general
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isExcel
              ? `Mostrando datos del Excel: ${excelData.filename} — ${activeRows.length} registros`
              : 'Estado actual del inventario tecnológico'}
          </Typography>
        </Box>
        <ExportImportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          hideImport={true}
        />
      </Box>

      {/* ── Tarjetas de stats ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Inventory />}
            label="Total equipos"
            value={stats.total}
            color="primary"
            subtitle={isExcel ? `Desde ${excelData.filename}` : 'En inventario'}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<CheckCircle />}
            label={isExcel && estadoKey ? `Activos (col. ${estadoKey})` : 'En uso'}
            value={stats.enUso}
            color="success"
            subtitle={stats.total > 0 ? `${stats.pct}% del total` : '—'}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Build />}
            label="En mantenimiento"
            value={stats.enMantenimiento}
            color="warning"
            subtitle="Fuera de servicio"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Warning />}
            label="Mantenimientos pendientes"
            value={stats.pendientes}
            color="error"
            subtitle={isExcel ? 'Del inventario base' : 'Requieren atención'}
          />
        </Grid>
      </Grid>

      {/* ── Gráficos principales ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>

        {/* Estado */}
        {porEstado.length > 0 && (
          <Grid item xs={12} md={estadoKey && tipoKey ? 5 : 12}>
            <MiniPieChart
              data={porEstado}
              title={isExcel && estadoKey ? `Distribución por "${estadoKey}"` : 'Estado del parque'}
            />
          </Grid>
        )}

        {/* Tipo */}
        {porTipo.length > 0 && (
          <Grid item xs={12} md={estadoKey && tipoKey ? 7 : 12}>
            <MiniBarChart
              data={porTipo}
              nameKey="name"
              title={isExcel && tipoKey ? `Equipos por "${tipoKey}"` : 'Equipos por tipo'}
              color="#1976d2"
            />
          </Grid>
        )}
      </Grid>

      {/* ── Sede y Marca ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {porSede.length > 0 && (
          <Grid item xs={12} md={porMarca.length > 0 ? 6 : 12}>
            <MiniBarChart
              data={porSede}
              nameKey="name"
              title={isExcel && sedeKey ? `Equipos por "${sedeKey}"` : 'Equipos por sede'}
              color="#2e7d32"
            />
          </Grid>
        )}
        {porMarca.length > 0 && (
          <Grid item xs={12} md={porSede.length > 0 ? 6 : 12}>
            <MiniBarChart
              data={porMarca}
              nameKey="name"
              title={`Top marcas (col. "${marcaKey}")`}
              color="#7b1fa2"
            />
          </Grid>
        )}
      </Grid>

      {/* ── Columnas categóricas extra del Excel ── */}
      {extraCharts.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Otras distribuciones detectadas
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {extraCharts.map((chart) => (
              <Grid item xs={12} md={6} key={chart.key}>
                <MiniBarChart
                  data={chart.data}
                  nameKey="name"
                  title={`Por "${chart.label}"`}
                  color="#e65100"
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ── Preview tabla Excel (primeras filas) ── */}
      {isExcel && previewColumns.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Vista previa del Excel ({Math.min(5, activeRows.length)} de {activeRows.length} filas)
          </Typography>
          <Card elevation={1} sx={{ borderRadius: 2, mb: 3, overflow: 'auto' }}>
            <CardContent sx={{ p: 0 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: 'grey.100' }}>
                    {previewColumns.map((col) => (
                      <Box
                        component="th"
                        key={col.key}
                        sx={{ p: 1.5, textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '2px solid', borderColor: 'divider' }}
                      >
                        {col.label}
                      </Box>
                    ))}
                    {activeColumns.length > 6 && (
                      <Box component="th" sx={{ p: 1.5, color: 'text.disabled', borderBottom: '2px solid', borderColor: 'divider' }}>
                        +{activeColumns.length - 6} columnas más
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box component="tbody">
                  {activeRows.slice(0, 5).map((row, i) => (
                    <Box
                      component="tr"
                      key={i}
                      sx={{ '&:hover': { bgcolor: 'action.hover' }, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      {previewColumns.map((col) => (
                        <Box
                          component="td"
                          key={col.key}
                          sx={{ p: 1.5, whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {row[col.key] !== '' && row[col.key] != null ? String(row[col.key]) : '—'}
                        </Box>
                      ))}
                      {activeColumns.length > 6 && <Box component="td" sx={{ p: 1.5, color: 'text.disabled' }}>…</Box>}
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Sección solo modo base: mantenimientos + usuarios ── */}
      {!isExcel && (
        <>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Distribución por sede
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {porSede.map((item) => {
              const sedeEquipos = equiposList.filter((e) => e.sede === item.name);
              const enUso = sedeEquipos.filter((e) => e.estado === 'En uso').length;
              const enMant = sedeEquipos.filter((e) => e.estado === 'En mantenimiento').length;
              return (
                <Grid item xs={12} md={6} key={item.name}>
                  <Card elevation={1} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Sede {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="primary.main">{item.value}</Typography>
                          <Typography variant="caption" color="text.secondary">Total equipos</Typography>
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="success.main">{enUso}</Typography>
                          <Typography variant="caption" color="text.secondary">En uso</Typography>
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="warning.main">{enMant}</Typography>
                          <Typography variant="caption" color="text.secondary">En mantenimiento</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={2}>
            {/* Últimos mantenimientos */}
            <Grid item xs={12} md={7}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Últimos mantenimientos
                  </Typography>
                  <List dense disablePadding>
                    {ultimosMantenimientos.map((m, i) => {
                      const equipo = equiposList.find((e) => e.id === m.equipoId);
                      return (
                        <Box key={m.id}>
                          {i > 0 && <Divider />}
                          <ListItem disablePadding sx={{ py: 1 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark', width: 36, height: 36 }}>
                                <Build fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={equipo ? `${equipo.marca} ${equipo.modeloSistemas}` : `Equipo #${m.equipoId}`}
                              secondary={`${m.tipo} — ${m.descripcion?.substring(0, 50)}${m.descripcion?.length > 50 ? '…' : ''}`}
                              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                              secondaryTypographyProps={{ fontSize: '0.75rem' }}
                            />
                            <Box sx={{ ml: 1, textAlign: 'right' }}>
                              <Chip
                                label={m.estado}
                                size="small"
                                color={m.estado === 'completado' ? 'success' : m.estado === 'pendiente' ? 'warning' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                {new Date(m.fecha).toLocaleDateString('es-PE')}
                              </Typography>
                            </Box>
                          </ListItem>
                        </Box>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Usuarios */}
            <Grid item xs={12} md={5}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Usuarios del sistema
                  </Typography>
                  <List dense disablePadding>
                    {usuarios.map((u, i) => (
                      <Box key={u.id}>
                        {i > 0 && <Divider />}
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 36, height: 36, fontSize: 14 }}>
                              {u.nombre?.charAt(0) ?? '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={u.nombre}
                            secondary={u.email}
                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                            secondaryTypographyProps={{ fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={u.rol}
                            size="small"
                            color={u.rol === 'admin' ? 'error' : u.rol === 'tecnico' ? 'warning' : 'info'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;