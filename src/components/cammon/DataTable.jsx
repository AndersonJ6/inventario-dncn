import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Button,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Add,
} from '@mui/icons-material';
import { SEDES, AREAS, ESTADOS_EQUIPOS, TIPOS_EQUIPOS } from '../../data/mockData';

const DataTable = ({
  data,
  columns,
  title,
  onEdit,
  onDelete,
  onView,
  onAdd,
  filters: externalFilters = {},
  onFiltersChange,
  searchPlaceholder = 'Buscar...',
  rowsPerPage = 10,
  showFilters = true,
  showActions = true,
  showAddButton = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [internalFilters, setInternalFilters] = useState({
    sede: '',
    area: '',
    estado: '',
    tipo: '',
  });

  // Combinar filtros externos e internos
  const filters = { ...internalFilters, ...externalFilters };

  // Datos filtrados y paginados
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        columns.some((col) =>
          col.searchable !== false &&
          String(item[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtros específicos
    if (filters.sede) {
      filtered = filtered.filter((item) => item.sede === filters.sede);
    }
    if (filters.area) {
      filtered = filtered.filter((item) => item.area === filters.area);
    }
    if (filters.estado) {
      filtered = filtered.filter((item) => item.estado === filters.estado);
    }
    if (filters.tipo) {
      filtered = filtered.filter((item) => item.tipo === filters.tipo);
    }

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...internalFilters, [filterKey]: value };
    setInternalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
    setPage(1); // Resetear a primera página
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const renderCellValue = (item, column) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('es-PE');
    }

    if (column.type === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (column.type === 'chip') {
      return (
        <Chip
          label={value}
          size="small"
          color={column.chipColor ? column.chipColor(value) : 'default'}
          variant="outlined"
        />
      );
    }

    return value || '-';
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Header con título y búsqueda */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {showAddButton && onAdd && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAdd}
              size="small"
            >
              Agregar
            </Button>
          )}
        </Box>

        {/* Barra de búsqueda */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {/* Filtros */}
      {showFilters && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sede</InputLabel>
              <Select
                value={filters.sede}
                label="Sede"
                onChange={(e) => handleFilterChange('sede', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {SEDES.map((sede) => (
                  <MenuItem key={sede} value={sede}>
                    {sede}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {filters.sede && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Área</InputLabel>
                <Select
                  value={filters.area}
                  label="Área"
                  onChange={(e) => handleFilterChange('area', e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {AREAS[filters.sede]?.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                label="Estado"
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {ESTADOS_EQUIPOS.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.tipo}
                label="Tipo"
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {TIPOS_EQUIPOS.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(filters.sede || filters.area || filters.estado || filters.tipo) && (
              <Button
                size="small"
                onClick={() => {
                  setInternalFilters({ sede: '', area: '', estado: '', tipo: '' });
                  if (onFiltersChange) {
                    onFiltersChange({ sede: '', area: '', estado: '', tipo: '' });
                  }
                }}
                sx={{ alignSelf: 'flex-end' }}
              >
                Limpiar filtros
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                  width={column.width}
                >
                  {column.label}
                </TableCell>
              ))}
              {showActions && <TableCell width="60px" />}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm || Object.values(filters).some(v => v) ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} hover>
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={{ fontSize: '0.875rem' }}>
                      {renderCellValue(item, column)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        {onView && (
          <MenuItem onClick={() => onView(selectedRow)}>
            <Visibility sx={{ mr: 1 }} />
            Ver detalles
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => onEdit(selectedRow)}>
            <Edit sx={{ mr: 1 }} />
            Editar
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => onDelete(selectedRow)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default DataTable;