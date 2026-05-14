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
  { id: 1, nombre: 'Admin Principal', email: 'admin@tech.com', rol: 'admin', sede: 'Central' },
  { id: 2, nombre: 'Carlos Técnico',  email: 'tecnico@tech.com', rol: 'tecnico', sede: 'Garzón' },
  { id: 3, nombre: 'María Viewer',    email: 'viewer@tech.com', rol: 'visualizador', sede: 'Central' },
  { id: 4, nombre: 'Juan Técnico',    email: 'juan@tech.com', rol: 'tecnico', sede: 'Garzón' },
  { id: 5, nombre: 'Ana Soporte',     email: 'soporte@tech.com', rol: 'tecnico', sede: 'Central' },
];

// Equipos con todos los campos requeridos
export const mockEquipos = [
  // Sede Garzón
  { 
    id: 1, 
    codigoPatrimonial: 'GAR-PC-001',
    nombre: 'PC-ADMIN-01', 
    tipo: 'PC', 
    marca: 'Dell', 
    modelo: 'OptiPlex 7090', 
    serie: 'SN001', 
    procesador: 'Intel Core i5-10400', 
    ram: '16GB DDR4', 
    disco: '512GB SSD', 
    sistemaOperativo: 'Windows 11 Pro', 
    estado: 'En uso', 
    sede: 'Garzón', 
    area: 'Administración', 
    usuarioAsignado: 1, 
    observaciones: 'Equipo principal de administración', 
    fechaAdquisicion: '2022-01-15' 
  },
  { 
    id: 2, 
    codigoPatrimonial: 'GAR-LAP-001',
    nombre: 'LAP-TEC-01', 
    tipo: 'PC', 
    marca: 'HP', 
    modelo: 'EliteBook 840', 
    serie: 'SN002', 
    procesador: 'Intel Core i7-1165G7', 
    ram: '16GB DDR4', 
    disco: '1TB SSD', 
    sistemaOperativo: 'Windows 11 Pro', 
    estado: 'En uso', 
    sede: 'Garzón', 
    area: 'Soporte TI', 
    usuarioAsignado: 2, 
    observaciones: 'Laptop para soporte técnico', 
    fechaAdquisicion: '2022-03-20' 
  },
  { 
    id: 3, 
    codigoPatrimonial: 'GAR-IMP-001',
    nombre: 'IMP-ADM-01', 
    tipo: 'Impresora', 
    marca: 'Epson', 
    modelo: 'L3150', 
    serie: 'SN003', 
    procesador: null, 
    ram: null, 
    disco: null, 
    sistemaOperativo: null, 
    estado: 'En mantenimiento', 
    sede: 'Garzón', 
    area: 'Administración', 
    usuarioAsignado: null, 
    observaciones: 'Impresora multifunción', 
    fechaAdquisicion: '2021-06-10' 
  },
  { 
    id: 4, 
    codigoPatrimonial: 'GAR-MON-001',
    nombre: 'MON-VIS-01', 
    tipo: 'Monitor/Pantalla', 
    marca: 'Dell', 
    modelo: 'P2419H', 
    serie: 'SN004', 
    procesador: null, 
    ram: null, 
    disco: null, 
    sistemaOperativo: null, 
    estado: 'En uso', 
    sede: 'Garzón', 
    area: 'Recursos Humanos', 
    usuarioAsignado: 3, 
    observaciones: 'Monitor 24" Full HD', 
    fechaAdquisicion: '2023-02-01' 
  },
  { 
    id: 5, 
    codigoPatrimonial: 'GAR-TEC-001',
    nombre: 'TEC-TEC-01', 
    tipo: 'Teclado', 
    marca: 'Logitech', 
    modelo: 'K380', 
    serie: 'SN005', 
    procesador: null, 
    ram: null, 
    disco: null, 
    sistemaOperativo: null, 
    estado: 'En almacén', 
    sede: 'Garzón', 
    area: 'Soporte TI', 
    usuarioAsignado: null, 
    observaciones: 'Teclado inalámbrico', 
    fechaAdquisicion: '2020-08-15' 
  },
  // Sede Central
  { 
    id: 6, 
    codigoPatrimonial: 'CEN-PC-001',
    nombre: 'PC-DIR-01', 
    tipo: 'PC', 
    marca: 'Lenovo', 
    modelo: 'ThinkCentre M70q', 
    serie: 'SN006', 
    procesador: 'AMD Ryzen 5 5500U', 
    ram: '8GB DDR4', 
    disco: '256GB SSD', 
    sistemaOperativo: 'Windows 10 Pro', 
    estado: 'En uso', 
    sede: 'Central', 
    area: 'Dirección', 
    usuarioAsignado: 1, 
    observaciones: 'Equipo de dirección ejecutiva', 
    fechaAdquisicion: '2023-01-10' 
  },
  { 
    id: 7, 
    codigoPatrimonial: 'CEN-PROJ-001',
    nombre: 'PROJ-SAL-01', 
    tipo: 'Proyector', 
    marca: 'Epson', 
    modelo: 'EB-S41', 
    serie: 'SN007', 
    procesador: null, 
    ram: null, 
    disco: null, 
    sistemaOperativo: null, 
    estado: 'En uso', 
    sede: 'Central', 
    area: 'Ventas', 
    usuarioAsignado: null, 
    observaciones: 'Proyector para presentaciones', 
    fechaAdquisicion: '2022-11-05' 
  },
  { 
    id: 8, 
    codigoPatrimonial: 'CEN-PC-002',
    nombre: 'PC-FIN-01', 
    tipo: 'PC', 
    marca: 'HP', 
    modelo: 'ProDesk 400 G6', 
    serie: 'SN008', 
    procesador: 'Intel Core i3-9100', 
    ram: '8GB DDR4', 
    disco: '500GB HDD', 
    sistemaOperativo: 'Windows 10 Pro', 
    estado: 'Formateado', 
    sede: 'Central', 
    area: 'Finanzas', 
    usuarioAsignado: null, 
    observaciones: 'Pendiente de asignación', 
    fechaAdquisicion: '2021-09-20' 
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
