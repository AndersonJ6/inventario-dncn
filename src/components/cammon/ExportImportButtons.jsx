import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload,
  FileUpload,
  MoreVert,
} from '@mui/icons-material';

const ExportImportButtons = ({
  onExportExcel,
  onExportPDF,
  onImportExcel,
  isLoading = false,
  hideImport = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    onExportExcel?.();
    handleMenuClose();
  };

  const handleExportPDF = () => {
    onExportPDF?.();
    handleMenuClose();
  };

  const handleOpenImportDialog = () => {
    setImportDialog(true);
    setImportFile(null);
    setImportError(null);
    handleMenuClose();
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx')) {
        setImportError('Por favor selecciona un archivo Excel (.xlsx)');
        return;
      }
      setImportFile(file);
      setImportError(null);
    }
  };

  const handleImportConfirm = async () => {
    if (!importFile) {
      setImportError('Por favor selecciona un archivo');
      return;
    }

    try {
      await onImportExcel?.(importFile);
      setImportDialog(false);
      setImportFile(null);
    } catch (error) {
      setImportError(error.message || 'Error al importar el archivo');
    }
  };

  const handleImportCancel = () => {
    setImportDialog(false);
    setImportFile(null);
    setImportError(null);
  };

  return (
    <>
      {/* Botón principal */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<MoreVert />}
        onClick={handleMenuOpen}
        disabled={isLoading}
      >
        Más
      </Button>

      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onExportExcel && (
          <MenuItem onClick={handleExportExcel}>
            <FileDownload sx={{ mr: 1 }} fontSize="small" />
            Descargar Excel
          </MenuItem>
        )}
        {onExportPDF && (
          <MenuItem onClick={handleExportPDF}>
            <FileDownload sx={{ mr: 1 }} fontSize="small" />
            Descargar PDF
          </MenuItem>
        )}
        {!hideImport && onImportExcel && (
          <MenuItem onClick={handleOpenImportDialog}>
            <FileUpload sx={{ mr: 1 }} fontSize="small" />
            Importar Excel
          </MenuItem>
        )}
      </Menu>

      {/* Diálogo de importación */}
      <Dialog open={importDialog} onClose={handleImportCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Importar datos desde Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {importError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {importError}
              </Alert>
            )}

            <TextField
              type="file"
              inputProps={{
                accept: '.xlsx',
              }}
              onChange={handleImportFileChange}
              fullWidth
              variant="outlined"
              size="small"
              disabled={isLoading}
              helperText={importFile ? `Archivo: ${importFile.name}` : 'Selecciona un archivo .xlsx'}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              Asegúrate de que el archivo Excel tenga el formato correcto con las columnas esperadas.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleImportConfirm}
            variant="contained"
            disabled={!importFile || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Importar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportImportButtons;
