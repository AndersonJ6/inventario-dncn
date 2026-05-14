import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporta equipos a archivo Excel
 * @param {Array} equipos - Lista de equipos a exportar
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 */
export const exportEquiposExcel = (equipos, nombreArchivo = 'inventario-equipos') => {
  if (!equipos || equipos.length === 0) {
    alert('No hay equipos para exportar');
    return;
  }

  // Preparar datos para Excel
  const datosExcel = equipos.map(equipo => ({
    'Código Patrimonial': equipo.codigoPatrimonial,
    'Nombre': equipo.nombre,
    'Tipo': equipo.tipo,
    'Marca': equipo.marca,
    'Modelo': equipo.modelo,
    'Número de Serie': equipo.serie,
    'Procesador': equipo.procesador || '-',
    'RAM': equipo.ram || '-',
    'Disco': equipo.disco || '-',
    'Sistema Operativo': equipo.sistemaOperativo || '-',
    'Estado': equipo.estado,
    'Sede': equipo.sede,
    'Área': equipo.area,
    'Usuario Asignado': equipo.usuarioAsignado || '-',
    'Observaciones': equipo.observaciones,
    'Fecha de Adquisición': equipo.fechaAdquisicion,
  }));

  // Crear libro de trabajo
  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datosExcel);

  // Ajustar ancho de columnas
  hoja['!cols'] = [
    { wch: 18 }, // Código Patrimonial
    { wch: 20 }, // Nombre
    { wch: 15 }, // Tipo
    { wch: 12 }, // Marca
    { wch: 15 }, // Modelo
    { wch: 15 }, // Número de Serie
    { wch: 20 }, // Procesador
    { wch: 12 }, // RAM
    { wch: 12 }, // Disco
    { wch: 20 }, // Sistema Operativo
    { wch: 15 }, // Estado
    { wch: 12 }, // Sede
    { wch: 15 }, // Área
    { wch: 15 }, // Usuario Asignado
    { wch: 30 }, // Observaciones
    { wch: 15 }, // Fecha de Adquisición
  ];

  XLSX.utils.book_append_sheet(libro, hoja, 'Equipos');
  XLSX.writeFile(libro, `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta mantenimientos a archivo Excel
 * @param {Array} mantenimientos - Lista de mantenimientos a exportar
 * @param {Array} equipos - Lista de equipos para referencia
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 */
export const exportMantenimientosExcel = (mantenimientos, equipos, nombreArchivo = 'inventario-mantenimientos') => {
  if (!mantenimientos || mantenimientos.length === 0) {
    alert('No hay mantenimientos para exportar');
    return;
  }

  // Preparar datos para Excel
  const datosExcel = mantenimientos.map(mant => {
    const equipo = equipos.find(e => e.id === mant.equipoId);
    return {
      'Código Equipo': equipo?.codigoPatrimonial || `ID: ${mant.equipoId}`,
      'Nombre Equipo': equipo?.nombre || `ID: ${mant.equipoId}`,
      'Tipo de Mantenimiento': mant.tipo,
      'Descripción': mant.descripcion,
      'Estado': mant.estado,
      'Fecha': mant.fecha,
      'Técnico': mant.tecnico,
      'Sede': mant.sede,
    };
  });

  // Crear libro de trabajo
  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datosExcel);

  // Ajustar ancho de columnas
  hoja['!cols'] = [
    { wch: 18 }, // Código Equipo
    { wch: 20 }, // Nombre Equipo
    { wch: 18 }, // Tipo de Mantenimiento
    { wch: 30 }, // Descripción
    { wch: 12 }, // Estado
    { wch: 12 }, // Fecha
    { wch: 15 }, // Técnico
    { wch: 12 }, // Sede
  ];

  XLSX.utils.book_append_sheet(libro, hoja, 'Mantenimientos');
  XLSX.writeFile(libro, `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta movimientos a archivo Excel
 * @param {Array} movimientos - Lista de movimientos a exportar
 * @param {Array} equipos - Lista de equipos para referencia
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 */
export const exportMovimientosExcel = (movimientos, equipos, nombreArchivo = 'inventario-movimientos') => {
  if (!movimientos || movimientos.length === 0) {
    alert('No hay movimientos para exportar');
    return;
  }

  // Preparar datos para Excel
  const datosExcel = movimientos.map(mov => {
    const equipo = equipos.find(e => e.id === mov.equipoId);
    return {
      'Código Equipo': equipo?.codigoPatrimonial || `ID: ${mov.equipoId}`,
      'Nombre Equipo': equipo?.nombre || `ID: ${mov.equipoId}`,
      'Tipo de Movimiento': mov.tipo,
      'Origen': mov.origen,
      'Destino': mov.destino,
      'Fecha': mov.fecha,
      'Usuario': mov.usuario,
      'Observación': mov.observacion,
      'Sede': mov.sede,
    };
  });

  // Crear libro de trabajo
  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datosExcel);

  // Ajustar ancho de columnas
  hoja['!cols'] = [
    { wch: 18 }, // Código Equipo
    { wch: 20 }, // Nombre Equipo
    { wch: 18 }, // Tipo de Movimiento
    { wch: 15 }, // Origen
    { wch: 15 }, // Destino
    { wch: 12 }, // Fecha
    { wch: 15 }, // Usuario
    { wch: 30 }, // Observación
    { wch: 12 }, // Sede
  ];

  XLSX.utils.book_append_sheet(libro, hoja, 'Movimientos');
  XLSX.writeFile(libro, `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Importa equipos desde archivo Excel
 * @param {File} archivo - Archivo Excel a importar
 * @returns {Promise<Array>} Array de equipos importados
 */
export const importEquiposExcel = (archivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const datos = e.target.result;
        const libro = XLSX.read(datos, { type: 'binary' });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        const equipos = XLSX.utils.sheet_to_json(hoja);

        // Mapear columnas del Excel al formato esperado
        const equiposFormateados = equipos.map((eq, index) => ({
          id: Math.max(0, ...equipos.map(e => e.id || 0)) + index + 1,
          codigoPatrimonial: eq['Código Patrimonial'] || '',
          nombre: eq['Nombre'] || '',
          tipo: eq['Tipo'] || 'PC',
          marca: eq['Marca'] || '',
          modelo: eq['Modelo'] || '',
          serie: eq['Número de Serie'] || '',
          procesador: eq['Procesador'] || null,
          ram: eq['RAM'] || null,
          disco: eq['Disco'] || null,
          sistemaOperativo: eq['Sistema Operativo'] || null,
          estado: eq['Estado'] || 'En almacén',
          sede: eq['Sede'] || 'Garzón',
          area: eq['Área'] || '',
          usuarioAsignado: eq['Usuario Asignado'] ? Number(eq['Usuario Asignado']) : null,
          observaciones: eq['Observaciones'] || '',
          fechaAdquisicion: eq['Fecha de Adquisición'] || '',
        }));

        resolve(equiposFormateados);
      } catch (error) {
        reject(new Error(`Error al procesar el archivo: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsBinaryString(archivo);
  });
};

/**
 * Exporta todos los datos (equipos, mantenimientos, movimientos) en un libro Excel con múltiples hojas
 */
export const exportTodoExcel = (equipos, mantenimientos, movimientos, nombreArchivo = 'inventario-completo') => {
  if (!equipos && !mantenimientos && !movimientos) {
    alert('No hay datos para exportar');
    return;
  }

  const libro = XLSX.utils.book_new();

  // Hoja de Equipos
  if (equipos && equipos.length > 0) {
    const datosEquipos = equipos.map(equipo => ({
      'Código Patrimonial': equipo.codigoPatrimonial,
      'Nombre': equipo.nombre,
      'Tipo': equipo.tipo,
      'Marca': equipo.marca,
      'Modelo': equipo.modelo,
      'Estado': equipo.estado,
      'Sede': equipo.sede,
      'Área': equipo.area,
      'Fecha de Adquisición': equipo.fechaAdquisicion,
    }));
    const hojaEquipos = XLSX.utils.json_to_sheet(datosEquipos);
    XLSX.utils.book_append_sheet(libro, hojaEquipos, 'Equipos');
  }

  // Hoja de Mantenimientos
  if (mantenimientos && mantenimientos.length > 0) {
    const datosMantenimientos = mantenimientos.map(mant => {
      const equipo = equipos?.find(e => e.id === mant.equipoId);
      return {
        'Equipo': equipo?.nombre || `ID: ${mant.equipoId}`,
        'Tipo': mant.tipo,
        'Estado': mant.estado,
        'Fecha': mant.fecha,
        'Técnico': mant.tecnico,
        'Sede': mant.sede,
      };
    });
    const hojaMantenimientos = XLSX.utils.json_to_sheet(datosMantenimientos);
    XLSX.utils.book_append_sheet(libro, hojaMantenimientos, 'Mantenimientos');
  }

  // Hoja de Movimientos
  if (movimientos && movimientos.length > 0) {
    const datosMovimientos = movimientos.map(mov => {
      const equipo = equipos?.find(e => e.id === mov.equipoId);
      return {
        'Equipo': equipo?.nombre || `ID: ${mov.equipoId}`,
        'Tipo': mov.tipo,
        'Origen': mov.origen,
        'Destino': mov.destino,
        'Fecha': mov.fecha,
        'Usuario': mov.usuario,
        'Sede': mov.sede,
      };
    });
    const hojaMovimientos = XLSX.utils.json_to_sheet(datosMovimientos);
    XLSX.utils.book_append_sheet(libro, hojaMovimientos, 'Movimientos');
  }

  XLSX.writeFile(libro, `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
};
