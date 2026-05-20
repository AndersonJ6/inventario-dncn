// Sedes disponibles
export const SEDES = ['Garzón', 'Central'];

// Áreas por sede
export const AREAS = {
  'Garzón': ['Administración', 'Soporte TI', 'Recursos Humanos', 'Operaciones'],
  'Central': ['Dirección', 'Finanzas', 'Ventas', 'Logística']
};

// Estados de equipos
export const ESTADOS_EQUIPOS = [
  'En uso',
  'En almacén', 
  'En mantenimiento',
  'Formateado',
  'Retirado',
  'Dado de baja'
];

// Tipos de equipos
export const TIPOS_EQUIPOS = [
  'PC',
  'Monitor/Pantalla',
  'Teclado',
  'Impresora',
  'Proyector'
];

// Usuarios con sede asignada
export const mockUsuarios = [
  { id: 1, nombre: 'Admin Principal', user: 'admin', email: 'admin@tech.com', rol: 'admin', sede: 'Central' },
  { id: 2, nombre: 'Carlos Técnico',  user: 'tecnico', email: 'tecnico@tech.com', rol: 'tecnico', sede: 'Garzón' },
  { id: 3, nombre: 'María Viewer',    user: 'viewer', email: 'viewer@tech.com', rol: 'visualizador', sede: 'Central' },
  { id: 4, nombre: 'Juan Técnico',    user: 'juan', email: 'juan@tech.com', rol: 'tecnico', sede: 'Garzón' },
  { id: 5, nombre: 'Ana Soporte',     user: 'soporte', email: 'soporte@tech.com', rol: 'tecnico', sede: 'Central' },
];

// Equipos con todos los campos requeridos
export const mockEquipos = [
  { 
    id: 1, 
    codigoPatrimonial: 'GAR-PC-001',
    marca: 'Dell', 
    modeloSistemas: 'OptiPlex 7090', 
    generacion: '10ª Gen', 
    procesador: 'Intel Core i5-10400', 
    ram: '16GB DDR4', 
    sistemaOperativo: 'Windows 11 Pro', 
    estadoSO: 'Actualizado',
    office: 'Office 365'
  },
  { 
    id: 2, 
    codigoPatrimonial: 'GAR-LAP-001',
    marca: 'HP', 
    modeloSistemas: 'EliteBook 840', 
    generacion: '11ª Gen', 
    procesador: 'Intel Core i7-1165G7', 
    ram: '16GB DDR4', 
    sistemaOperativo: 'Windows 11 Pro', 
    estadoSO: 'Actualizado',
    office: 'Office 365'
  },
  { 
    id: 3, 
    codigoPatrimonial: 'GAR-IMP-001',
    marca: 'Epson', 
    modeloSistemas: 'L3150', 
    generacion: 'N/A', 
    procesador: 'N/A', 
    ram: 'N/A', 
    sistemaOperativo: 'N/A', 
    estadoSO: 'N/A',
    office: 'N/A'
  },
  { 
    id: 4, 
    codigoPatrimonial: 'GAR-MON-001',
    marca: 'Dell', 
    modeloSistemas: 'P2419H', 
    generacion: 'N/A', 
    procesador: 'N/A', 
    ram: 'N/A', 
    sistemaOperativo: 'N/A', 
    estadoSO: 'N/A',
    office: 'N/A'
  },
  { 
    id: 5, 
    codigoPatrimonial: 'GAR-TEC-001',
    marca: 'Logitech', 
    modeloSistemas: 'K380', 
    generacion: 'N/A', 
    procesador: 'N/A', 
    ram: 'N/A', 
    sistemaOperativo: 'N/A', 
    estadoSO: 'N/A',
    office: 'N/A'
  },
  { 
    id: 6, 
    codigoPatrimonial: 'CEN-PC-001',
    marca: 'Lenovo', 
    modeloSistemas: 'ThinkCentre M70q', 
    generacion: 'Ryzen 5 Gen', 
    procesador: 'AMD Ryzen 5 5500U', 
    ram: '8GB DDR4', 
    sistemaOperativo: 'Windows 10 Pro', 
    estadoSO: 'Actualizado',
    office: 'Office 2019'
  },
  { 
    id: 7, 
    codigoPatrimonial: 'CEN-PROJ-001',
    marca: 'Epson', 
    modeloSistemas: 'EB-S41', 
    generacion: 'N/A', 
    procesador: 'N/A', 
    ram: 'N/A', 
    sistemaOperativo: 'N/A', 
    estadoSO: 'N/A',
    office: 'N/A'
  },
  { 
    id: 8, 
    codigoPatrimonial: 'CEN-PC-002',
    marca: 'HP', 
    modeloSistemas: 'ProDesk 400 G6', 
    generacion: '9ª Gen', 
    procesador: 'Intel Core i3-9100', 
    ram: '8GB DDR4', 
    sistemaOperativo: 'Windows 10 Pro', 
    estadoSO: 'Por actualizar',
    office: 'Office 2016'
  },
];

// Mantenimientos con sede
export const mockMantenimientos = [
  { id: 1, equipoId: 3, tipo: 'Correctivo', descripcion: 'Revisión de cabezales y limpieza', estado: 'pendiente', fecha: '2025-05-10', tecnico: 'Carlos Técnico', sede: 'Garzón' },
  { id: 2, equipoId: 2, tipo: 'Preventivo', descripcion: 'Limpieza interna y actualización drivers', estado: 'completado', fecha: '2025-04-22', tecnico: 'Carlos Técnico', sede: 'Garzón' },
  { id: 3, equipoId: 1, tipo: 'Preventivo', descripcion: 'Revisión general y actualización de SO', estado: 'completado', fecha: '2025-03-15', tecnico: 'Juan Técnico', sede: 'Garzón' },
  { id: 4, equipoId: 6, tipo: 'Formateo', descripcion: 'Formateo completo y reinstalación de SO', estado: 'completado', fecha: '2025-04-15', tecnico: 'Ana Soporte', sede: 'Central' },
];

// Movimientos con sede
export const mockMovimientos = [
  { id: 1, equipoId: 2, tipo: 'traslado', origen: 'Almacén', destino: 'Soporte TI', fecha: '2025-04-01', usuario: 'Admin Principal', observacion: 'Asignación inicial', sede: 'Garzón' },
  { id: 2, equipoId: 3, tipo: 'mantenimiento', origen: 'Administración', destino: 'Taller', fecha: '2025-05-10', usuario: 'Carlos Técnico', observacion: 'Envío a reparación', sede: 'Garzón' },
  { id: 3, equipoId: 7, tipo: 'salida', origen: 'Ventas', destino: 'Cliente ABC', fecha: '2025-04-20', usuario: 'Admin Principal', observacion: 'Préstamo temporal', sede: 'Central' },
  { id: 4, equipoId: 8, tipo: 'baja', origen: 'Finanzas', destino: 'Almacén', fecha: '2025-03-01', usuario: 'Ana Soporte', observacion: 'Equipo obsoleto', sede: 'Central' },
];
