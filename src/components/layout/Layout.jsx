import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ onToggleTheme, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar permanente en desktop, temporal en mobile */}
      {!isMobile && (
        <Sidebar variant="permanent" />
      )}
      {isMobile && (
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
        />
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          // En desktop, restamos el ancho del sidebar
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Navbar
          onMenuClick={handleDrawerToggle}
          onToggleTheme={onToggleTheme}
          darkMode={darkMode}
        />

        {/* Espacio para la AppBar */}
        <Toolbar />

        {/* Páginas */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;