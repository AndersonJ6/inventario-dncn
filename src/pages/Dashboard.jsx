import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Build,
  Warning,
  CheckCircle,
  Inventory,
} from '@mui/icons-material';
import ExportImportButtons from '../components/cammon/ExportImportButtons';
import {
  exportTodoExcel,
} from '../services/excelService';
import {
  exportReportePDF,
} from '../services/pdfService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';


const PIE_COLORS = ['#1976d2', '#2e7d32', '#e65100', '#546e7a'];

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 48, height: 48, borderRadius: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {label}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const equipos = useSelector((state) => state.equipos.list);
  const mantenimientos = useSelector((state) => state.mantenimiento.list);
  const movimientos = useSelector((state) => state.movimientos.list);
  const usuarios = useSelector((state) => state.usuarios.list);

  // Estadísticas de equipos
  const stats = useMemo(() => {
    const enUso = equipos.filter((e) => e.estado === 'En uso').length;
    const enAlmacen = equipos.filter((e) => e.estado === 'En almacén').length;
    const enMantenimiento = equipos.filter((e) => e.estado === 'En mantenimiento').length;
    const formateado = equipos.filter((e) => e.estado === 'Formateado').length;
    const retirado = equipos.filter((e) => e.estado === 'Retirado').length;
    const dadoDeBaja = equipos.filter((e) => e.estado === 'Dado de baja').length;
    const pendientes = mantenimientos.filter((m) => m.estado === 'pendiente').length;

    return { total: equipos.length, enUso, enAlmacen, enMantenimiento, formateado, retirado, dadoDeBaja, pendientes };
  }, [equipos, mantenimientos]);

  // Estadísticas por sede
  const statsPorSede = useMemo(() => {
    const sedes = {};
    equipos.forEach((e) => {
      if (!sedes[e.sede]) {
        sedes[e.sede] = { total: 0, enUso: 0, enMantenimiento: 0 };
      }
      sedes[e.sede].total++;
      if (e.estado === 'En uso') sedes[e.sede].enUso++;
      if (e.estado === 'En mantenimiento') sedes[e.sede].enMantenimiento++;
    });
    return Object.entries(sedes).map(([sede, data]) => ({ sede, ...data }));
  }, [equipos]);

  // Distribución por tipo para gráfico de barras
  const porTipo = useMemo(() => {
    const map = {};
    equipos.forEach((e) => {
      map[e.tipo] = (map[e.tipo] || 0) + 1;
    });
    return Object.entries(map).map(([tipo, cantidad]) => ({ tipo, cantidad }));
  }, [equipos]);

  // Distribución por estado para pie
  const porEstado = useMemo(() => {
    const map = {};
    equipos.forEach((e) => {
      map[e.estado] = (map[e.estado] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [equipos]);

  // Últimos mantenimientos
  const ultimosMantenimientos = useMemo(
    () => [...mantenimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5),
    [mantenimientos]
  );

  const handleExportExcel = () => {
    exportTodoExcel(equipos, mantenimientos, movimientos);
  };

  const handleExportPDF = () => {
    exportReportePDF(equipos, mantenimientos, movimientos, stats);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Resumen general
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estado actual del inventario tecnológico
          </Typography>
        </Box>
        <ExportImportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          hideImport={true}
        />
      </Box>

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Inventory />}
            label="Total equipos"
            value={stats.total}
            color="primary"
            subtitle="En inventario"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<CheckCircle />}
            label="En uso"
            value={stats.enUso}
            color="success"
            subtitle={`${Math.round((stats.enUso / stats.total) * 100)}% del total`}
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
            subtitle="Requieren atención"
          />
        </Grid>
      </Grid>

      {/* Estadísticas por sede */}
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
        Distribución por sede
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsPorSede.map((sede) => (
          <Grid item xs={12} md={6} key={sede.sede}>
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Sede {sede.sede}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {sede.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total equipos
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {sede.enUso}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En uso
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="warning.main">
                      {sede.enMantenimiento}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En mantenimiento
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Barras por tipo */}
        <Grid item xs={12} md={7}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Equipos por tipo
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={porTipo} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="cantidad" fill="#1976d2" radius={[4, 4, 0, 0]} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie por estado */}
        <Grid item xs={12} md={5}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Estado del parque
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={porEstado}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {porEstado.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Últimos mantenimientos */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Últimos mantenimientos
              </Typography>
              <List dense disablePadding>
                {ultimosMantenimientos.map((m, i) => {
                  const equipo = equipos.find((e) => e.id === m.equipoId);
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
                          primary={equipo?.nombre || `Equipo #${m.equipoId}`}
                          secondary={`${m.tipo} — ${m.descripcion?.substring(0, 50)}...`}
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

        {/* Resumen usuarios */}
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
                          {u.nombre.charAt(0)}
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
    </Box>
  );
};

export default Dashboard;