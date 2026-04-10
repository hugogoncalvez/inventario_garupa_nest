import { muniLogo, infoLogo } from './logo';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const ReporteRecargasGranelPdf = (reporteData, fechaDesde, fechaHasta) => {

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const formatFecha = (dateString) => {
        // Corregir el problema de la fecha por un día
        const date = new Date(dateString.replace(/-/g, '/'));
        return `${date.getDate()} de ${meses[date.getMonth()]} del ${date.getFullYear()}`;
    };

    // Construir el contenido del documento dinámicamente
    const content = [
        {
            text: `Periodo del reporte: ${formatFecha(fechaDesde)} al ${formatFecha(fechaHasta)}\n\n`,
            fontSize: 12,
            alignment: 'center',
        },
    ];

    // Mapas para el resumen global
    const resumenInsumoMap = new Map();
    const resumenCartuchoMap = new Map();

    reporteData.forEach(areaData => {
        // Añadir encabezado para cada área
        content.push({
            text: `${areaData.area} (Total Cartuchos: ${areaData.totalCartuchos} / Total Insumo: ${areaData.totalInsumo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${areaData.unidadMedida || ''})`,
            fontSize: 16,
            bold: true,
            margin: [0, 15, 0, 5],
            decoration: 'underline',
            alignment: 'left'
        });

        // Añadir tabla de detalles para los insumos del área
        content.push({
            style: 'tableExample',
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Fecha', style: 'tableHeader' },
                        { text: 'Impresora', style: 'tableHeader', alignment: 'center' },
                        { text: 'Cartucho', style: 'tableHeader', alignment: 'center' },
                        { text: 'Insumo Granel', style: 'tableHeader', alignment: 'center' },
                        { text: 'Nº Cart.', style: 'tableHeader', alignment: 'center' },
                        { text: 'Cant. Insumo', style: 'tableHeader', alignment: 'center' },
                        { text: 'Usuario', style: 'tableHeader', alignment: 'center' }
                    ],
                    ...areaData.items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(item => {
                        // Acumular para resumen de Insumo a Granel
                        const insumoKey = `${item.insumoGranelNombre}|${areaData.unidadMedida || ''}`;
                        const currentInsumo = resumenInsumoMap.get(insumoKey) || { totalInsumo: 0, totalCartuchos: 0 };
                        resumenInsumoMap.set(insumoKey, {
                            totalInsumo: currentInsumo.totalInsumo + (Number(item.insumo) || 0),
                            totalCartuchos: currentInsumo.totalCartuchos + (Number(item.cartuchos) || 0)
                        });

                        // Acumular para resumen por Modelo de Cartucho
                        const cartuchoKey = `${item.cartuchoModelo}|${item.cartuchoColor}`;
                        resumenCartuchoMap.set(cartuchoKey, (resumenCartuchoMap.get(cartuchoKey) || 0) + (Number(item.cartuchos) || 0));

                        return [
                            { text: new Date(item.fecha).toLocaleDateString(), alignment: 'left' },
                            { text: `${item.impresoraModelo} (${item.impresoraMarca})`, alignment: 'center' },
                            { text: `${item.cartuchoModelo} (${item.cartuchoColor})`, alignment: 'center' },
                            { text: `${item.insumoGranelNombre}`, alignment: 'center' },
                            { text: item.cartuchos, alignment: 'center' },
                            { text: item.insumo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'center' },
                            { text: `${item.usuarioNombre} ${item.usuarioApellido}`, alignment: 'center' }
                        ];
                    })
                ]
            },
            layout: 'lightHorizontalLines'
        });
    });

    // --- SECCIÓN DE RESUMEN FINAL ---
    if (resumenInsumoMap.size > 0) {
        content.push({ text: '', pageBreak: 'before' });

        content.push({
            text: 'Resumen Consolidado de Recargas',
            fontSize: 18,
            bold: true,
            margin: [0, 10, 0, 15],
            alignment: 'center',
            color: '#2563eb'
        });

        content.push({
            text: 'Totales por Insumo a Granel',
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5],
            color: '#475569'
        });

        content.push({
            style: 'tableSummary',
            table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Insumo a Granel', style: 'tableHeaderSummary' },
                        { text: 'Total Cartuchos Recargados', style: 'tableHeaderSummary' },
                        { text: 'Total Insumo Usado', style: 'tableHeaderSummary' }
                    ],
                    ...Array.from(resumenInsumoMap.entries()).map(([key, value]) => {
                        const [nombre, unidad] = key.split('|');
                        return [
                            { text: nombre, bold: true },
                            { text: `${value.totalCartuchos} un.`, alignment: 'center' },
                            { text: `${value.totalInsumo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unidad}`, alignment: 'center', bold: true }
                        ];
                    })
                ]
            },
            layout: 'headerLineOnly'
        });

        content.push({
            text: 'Totales por Modelo de Cartucho',
            fontSize: 14,
            bold: true,
            margin: [0, 20, 0, 5],
            color: '#475569'
        });

        content.push({
            style: 'tableSummary',
            table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Modelo de Cartucho', style: 'tableHeaderSummary' },
                        { text: 'Color', style: 'tableHeaderSummary' },
                        { text: 'Total Recargas', style: 'tableHeaderSummary' }
                    ],
                    ...Array.from(resumenCartuchoMap.entries()).map(([key, total]) => {
                        const [modelo, color] = key.split('|');
                        return [
                            { text: modelo, bold: true },
                            { text: color, alignment: 'center' },
                            { text: `${total} un.`, alignment: 'center', bold: true }
                        ];
                    }).sort((a, b) => a[0].text.localeCompare(b[0].text))
                ]
            },
            layout: 'headerLineOnly'
        });
    }


    const docDefinition = {
        pageMargins: [40, 120, 40, 55],
        header: {
            table: {
                widths: ['25%', '*', '25%'],
                heights: [100, 100, 100],
                body: [
                    [
                        { ...muniLogo },
                        { text: 'Reporte de Recargas de Insumos a Granel por Área', fontSize: 18, bold: true, alignment: 'center', margin: [0, 30, 0, 0], border: [false, false, false, true] },
                        { ...infoLogo }
                    ]
                ]
            },
            margin: [0, 0, 0, 0]
        },
        footer: function (currentPage, pageCount) {
            return { text: `Página ${currentPage.toString()} de ${pageCount}`, alignment: 'center', margin: [0, 30, 0, 0] };
        },
        content: content,
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'center',
                fillColor: '#EEEEEE'
            },
            tableHeaderSummary: {
                bold: true,
                fontSize: 12,
                color: 'white',
                alignment: 'center',
                fillColor: '#2563eb'
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            },
            tableSummary: {
                margin: [0, 5, 0, 15]
            }
        }
    };

    pdfMake.createPdf(docDefinition).open();
};

export default ReporteRecargasGranelPdf;
