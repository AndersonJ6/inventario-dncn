import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporta equipos a archivo PDF
 * @param {Array} equipos - Lista de equipos a exportar
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 */
export const exportEquiposPDF = (equipos, nombreArchivo = 'inventario-equipos') => {
  if (!equipos || equipos.length === 0) {
    alert('No hay equipos para exportar');
    return;
  }

  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-PE');

  // Titulo
  doc.setFontSize(16);
  doc.text('Inventario de Equipos Tecnológicos', 14, 15);
  
  // Información general
  doc.setFontSize(10);
  doc.text(`Fecha de exportación: ${fecha}`, 14, 22);
  doc.text(`Total de equipos: ${equipos.length}`, 14, 28);

  // Tabla
  const columnas = [
    'Código',
    'Nombre',
    'Tipo',
    'Marca',
    'Modelo',
    'Estado',
    'Sede',
    'Área',
  ];

  const datos = equipos.map(equipo => [
    equipo.codigoPatrimonial,
    equipo.nombre.substring(0, 15),
    equipo.tipo,
    equipo.marca,
    equipo.modelo.substring(0, 12),
    equipo.estado,
    equipo.sede,
    equipo.area,
  ]);

  doc.autoTable({
    head: [columnas],
    body: datos,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta mantenimientos a archivo PDF
 * @param {Array} mantenimientos - Lista de mantenimientos a exportar
 * @param {Array} equipos - Lista de equipos para referencia
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 */
export const exportMantenimientosPDF = (mantenimientos, equipos, nombreArchivo = 'inventario-mantenimientos') => {
  if (!mantenimientos || mantenimientos.length === 0) {
    alert('No hay mantenimientos para exportar');
    return;
  }

  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-PE');

  // Titulo
  doc.setFontSize(16);
  doc.text('Registros de Mantenimiento', 14, 15);
  
  // Información general
  doc.setFontSize(10);
  doc.text(`Fecha de exportación: ${fecha}`, 14, 22);
  doc.text(`Total de registros: ${mantenimientos.length}`, 14, 28);

  // Tabla
  const columnas = [
    'Equipo',
    'Tipo',
    'Descripción',
    'Estado',
    'Fecha',
    'Técnico',
    'Sede',
  ];

  const datos = mantenimientos.map(mant => {
    const equipo = equipos.find(e => e.id === mant.equipoId);
    return [
      equipo?.nombre.substring(0, 12) || `ID: ${mant.equipoId}`,
      mant.tipo,
      mant.descripcion.substring(0, 20),
      mant.estado,
      mant.fecha,
      mant.tecnico,
      mant.sede,
    ];
  });

  doc.autoTable({
    head: [columnas],
    body: datos,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [46, 125, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta movimientos a archivo PDF
 * @param {Array} movimientos - Lista de movimientos a exportar
 * @param {Array} equipos - Lista de equipos para referencia
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 */
export const exportMovimientosPDF = (movimientos, equipos, nombreArchivo = 'inventario-movimientos') => {
  if (!movimientos || movimientos.length === 0) {
    alert('No hay movimientos para exportar');
    return;
  }

  const doc = new jsPDF('l'); // Orientación horizontal para más columnas
  const fecha = new Date().toLocaleDateString('es-PE');

  // Titulo
  doc.setFontSize(16);
  doc.text('Registro de Movimientos de Equipos', 14, 15);
  
  // Información general
  doc.setFontSize(10);
  doc.text(`Fecha de exportación: ${fecha}`, 14, 22);
  doc.text(`Total de movimientos: ${movimientos.length}`, 14, 28);

  // Tabla
  const columnas = [
    'Equipo',
    'Tipo',
    'Origen',
    'Destino',
    'Fecha',
    'Usuario',
    'Observación',
    'Sede',
  ];

  const datos = movimientos.map(mov => {
    const equipo = equipos.find(e => e.id === mov.equipoId);
    return [
      equipo?.nombre.substring(0, 12) || `ID: ${mov.equipoId}`,
      mov.tipo,
      mov.origen.substring(0, 12),
      mov.destino.substring(0, 12),
      mov.fecha,
      mov.usuario,
      mov.observacion?.substring(0, 15) || '-',
      mov.sede,
    ];
  });

  doc.autoTable({
    head: [columnas],
    body: datos,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [230, 81, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta reporte completo en PDF con estadísticas
 */
export const exportReportePDF = (equipos, mantenimientos, movimientos, estadisticas) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-PE');

  // Portada
  doc.setFontSize(24);
  doc.text('REPORTE DE INVENTARIO', 14, 40);
  
  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 14, 60);
  doc.text(`Generado por: Sistema de Inventario Tecnológico`, 14, 70);

  // Página 2: Estadísticas
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Estadísticas Generales', 14, 15);

  doc.setFontSize(11);
  let yPos = 30;
  const estadisticasData = [
    { label: 'Total de Equipos', valor: estadisticas?.total || equipos?.length || 0 },
    { label: 'En Uso', valor: estadisticas?.enUso || 0 },
    { label: 'En Mantenimiento', valor: estadisticas?.enMantenimiento || 0 },
    { label: 'En Almacén', valor: estadisticas?.enAlmacen || 0 },
    { label: 'Mantenimientos Pendientes', valor: mantenimientos?.filter(m => m.estado === 'pendiente').length || 0 },
    { label: 'Movimientos Registrados', valor: movimientos?.length || 0 },
  ];

  estadisticasData.forEach(stat => {
    doc.text(`${stat.label}:`, 14, yPos);
    doc.setFont(undefined, 'bold');
    doc.text(String(stat.valor), 120, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 8;
  });

  // Página 3: Tabla de Equipos
  if (equipos && equipos.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Inventario de Equipos', 14, 15);

    const columnas = ['Código', 'Nombre', 'Tipo', 'Marca', 'Estado', 'Sede'];
    const datos = equipos.slice(0, 50).map(eq => [
      eq.codigoPatrimonial,
      eq.nombre.substring(0, 12),
      eq.tipo,
      eq.marca,
      eq.estado,
      eq.sede,
    ]);

    doc.autoTable({
      head: [columnas],
      body: datos,
      startY: 25,
      theme: 'grid',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Pie de página en todas las páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`reporte-inventario-${new Date().toISOString().split('T')[0]}.pdf`);
};
