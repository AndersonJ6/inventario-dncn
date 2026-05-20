import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
 // Avatar,
  //Chip,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Computer as ComputerIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  SwapHoriz as MovimientosIcon,
  Inventory2 as InventoryIcon,
} from '@mui/icons-material';

export const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['admin', 'tecnico', 'visualizador'],
  },
  {
    label: 'Equipos',
    path: '/equipos',
    icon: <ComputerIcon />,
    roles: ['admin', 'tecnico', 'visualizador'],
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: <PeopleIcon />,
    roles: ['admin'],
  },
  {
    label: 'Mantenimiento',
    path: '/mantenimiento',
    icon: <BuildIcon />,
    roles: ['admin', 'tecnico'],
  },
  {
    label: 'Movimientos',
    path: '/movimientos',
    icon: <MovimientosIcon />,
    roles: ['admin', 'tecnico'],
  },
];

{/*const ROL_COLORS = {
  admin: 'error',
  tecnico: 'warning',
  visualizador: 'info',
};

const ROL_LABELS = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  visualizador: 'Visualizador',
};*/}


const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleNav = (path) => {
    navigate(path);
    if (variant === 'temporary') onClose();
  };

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.rol)
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Brand */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(25,118,210,0.35)',
          }}
        >
          <InventoryIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Inventario
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sistema de inventario
          </Typography>
        </Box>
      </Box>

      {/* Perfil 
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16, fontWeight: 700 }}>
            {user?.nombre?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.nombre}
            </Typography>
            <Chip
              label={ROL_LABELS[user?.rol] || user?.rol}
              color={ROL_COLORS[user?.rol] || 'default'}
              size="small"
              sx={{ height: 18, fontSize: '0.65rem', mt: 0.3 }}
            />
          </Box>
        </Box>
      </Box>*/}
      

      {/* Nav */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1.5 }}>
        <Typography
          variant="overline"
          sx={{ px: 3, color: 'text.disabled', fontSize: '0.65rem', letterSpacing: 1.2 }}
        >
          Navegación
        </Typography>
        <List dense sx={{ px: 1, mt: 0.5 }}>
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title="" placement="right">
                  <ListItemButton
                    onClick={() => handleNav(item.path)}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '& .MuiListItemIcon-root': { color: '#fff' },
                        '&:hover': { bgcolor: 'primary.dark' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isActive ? '#fff' : 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
          © 2025 TechInventory
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={variant === 'temporary' ? open : true}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: variant === 'temporary' ? 4 : '1px 0 0 rgba(0,0,0,0.08)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;