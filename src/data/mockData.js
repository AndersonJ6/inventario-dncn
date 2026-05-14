export const mockUsuarios = [
  { id: 1, nombre: 'Anderson Jiménez',  area: 'Sistemas',      sede: 'Central', email: 'anderson@inei.gob.pe' },
  { id: 2, nombre: 'María López',       area: 'Estadística',   sede: 'Garzón',  email: 'mlopez@inei.gob.pe'   },
  { id: 3, nombre: 'Carlos Quispe',     area: 'Administración', sede: 'Central', email: 'cquispe@inei.gob.pe'  },
  { id: 4, nombre: 'Rosa Huamán',       area: 'Informática',   sede: 'Garzón',  email: 'rhuaman@inei.gob.pe'  },
];

export const mockEquipos = [
  { id: 1,  codigo: 'PC-001',  tipo: 'PC',        marca: 'HP',      modelo: 'ProDesk 400',   serie: 'SN001', procesador: 'Intel i5', ram: '8GB',  disco: '500GB SSD', so: 'Windows 11', estado: 'En uso',        sede: 'Central', area: 'Sistemas',      usuario: 1, observaciones: '' },
  { id: 2,  codigo: 'PC-002',  tipo: 'PC',        marca: 'Dell',    modelo: 'OptiPlex 3080', serie: 'SN002', procesador: 'Intel i7', ram: '16GB', disco: '1TB SSD',   so: 'Windows 11', estado: 'En uso',        sede: 'Garzón',  area: 'Estadística',   usuario: 2, observaciones: '' },
  { id: 3,  codigo: 'MON-001', tipo: 'Monitor',   marca: 'LG',      modelo: '24MK430H',      serie: 'SN003', procesador: '',         ram: '',     disco: '',          so: '',           estado: 'En uso',        sede: 'Central', area: 'Sistemas',      usuario: 1, observaciones: '' },
  { id: 4,  codigo: 'IMP-001', tipo: 'Impresora', marca: 'Epson',   modelo: 'L3150',         serie: 'SN004', procesador: '',         ram: '',     disco: '',          so: '',           estado: 'En almacén',    sede: 'Central', area: 'Administración', usuario: null, observaciones: '' },
  { id: 5,  codigo: 'PC-003',  tipo: 'PC',        marca: 'Lenovo',  modelo: 'ThinkCentre',   serie: 'SN005', procesador: 'Intel i3', ram: '4GB',  disco: '1TB HDD',   so: 'Windows 10', estado: 'En mantenimiento', sede: 'Garzón', area: 'Informática',  usuario: 4, observaciones: 'Falla en disco' },
  { id: 6,  codigo: 'PRY-001', tipo: 'Proyector', marca: 'Epson',   modelo: 'S41+',          serie: 'SN006', procesador: '',         ram: '',     disco: '',          so: '',           estado: 'En uso',        sede: 'Garzón',  area: 'Estadística',   usuario: null, observaciones: '' },
  { id: 7,  codigo: 'TEC-001', tipo: 'Teclado',   marca: 'Logitech',modelo: 'K120',          serie: 'SN007', procesador: '',         ram: '',     disco: '',          so: '',           estado: 'En almacén',    sede: 'Central', area: 'Sistemas',      usuario: null, observaciones: '' },
  { id: 8,  codigo: 'PC-004',  tipo: 'PC',        marca: 'HP',      modelo: 'EliteDesk 800', serie: 'SN008', procesador: 'Intel i7', ram: '16GB', disco: '512GB SSD', so: 'Windows 11', estado: 'Formateado',    sede: 'Central', area: 'Administración', usuario: 3, observaciones: 'Formateado reciente' },
  { id: 9,  codigo: 'PC-005',  tipo: 'PC',        marca: 'Dell',    modelo: 'Vostro 3670',   serie: 'SN009', procesador: 'Intel i5', ram: '8GB',  disco: '1TB HDD',   so: 'Windows 10', estado: 'Dado de baja',  sede: 'Garzón',  area: 'Estadística',   usuario: null, observaciones: 'Sin reparación' },
  { id: 10, codigo: 'MON-002', tipo: 'Monitor',   marca: 'Samsung', modelo: 'F24T450',       serie: 'SN010', procesador: '',         ram: '',     disco: '',          so: '',           estado: 'En uso',        sede: 'Garzón',  area: 'Informática',   usuario: 4, observaciones: '' },
];