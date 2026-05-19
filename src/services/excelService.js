import * as XLSX from 'xlsx';

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
      'Marca': equipo.marca,
      'Modelo de Sistemas': equipo.modeloSistemas,
      'Generación': equipo.generacion,
      'Procesador': equipo.procesador || '-',
      'RAM': equipo.ram || '-',
      'Sistema Operativo': equipo.sistemaOperativo || '-',
      'Estado Sistema Operativo': equipo.estadoSO || '-',
      'Office': equipo.office || '-',
    }));

  // Crear libro de trabajo
  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datosExcel);

  // Ajustar ancho de columnas
  hoja['!cols'] = [
      { wch: 18 }, // Código Patrimonial
      { wch: 12 }, // Marca
      { wch: 18 }, // Modelo de Sistemas
      { wch: 15 }, // Generación
      { wch: 20 }, // Procesador
      { wch: 12 }, // RAM
      { wch: 18 }, // Sistema Operativo
      { wch: 20 }, // Estado Sistema Operativo
      { wch: 12 }, // Office
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
        const equiposFormateados = equipos.map((eq) => ({
            codigoPatrimonial: eq['Código Patrimonial'] || '',
            marca: eq['Marca'] || '',
            modeloSistemas: eq['Modelo de Sistemas'] || '',
            generacion: eq['Generación'] || '',
            procesador: eq['Procesador'] || '',
            ram: eq['RAM'] || '',
            sistemaOperativo: eq['Sistema Operativo'] || '',
            estadoSO: eq['Estado Sistema Operativo'] || '',
            office: eq['Office'] || '',
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
        'Marca': equipo.marca,
        'Modelo de Sistemas': equipo.modeloSistemas,
        'Generación': equipo.generacion,
        'Procesador': equipo.procesador,
        'RAM': equipo.ram,
        'Sistema Operativo': equipo.sistemaOperativo,
        'Estado Sistema Operativo': equipo.estadoSO,
        'Office': equipo.office,
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
