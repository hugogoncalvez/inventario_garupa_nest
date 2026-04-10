import { muniLogo, infoLogo } from './logo';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const ReporteConsumoTintas = (reporteData, fechaDesde, fechaHasta) => {

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

    // Mapa para el resumen total acumulado
    const resumenMap = new Map();

    reporteData.forEach(areaData => {
        // Añadir encabezado para cada área
        content.push({
            text: `${areaData.area} (Total Insumos: ${areaData.totalArea})`,
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
                widths: ['auto', '*', 'auto', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Fecha', style: 'tableHeader' },
                        { text: 'Modelo', style: 'tableHeader', alignment: 'center' },
                        { text: 'Tipo', style: 'tableHeader', alignment: 'center' },
                        { text: 'Color', style: 'tableHeader', alignment: 'center' },
                        { text: 'Cantidad', style: 'tableHeader', alignment: 'center' }
                    ],
                    ...areaData.items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(item => {
                        // Acumular para el resumen global
                        const key = `${item.modelo}|${item.color}|${item.tipo}`;
                        const consumido = Number(item.consumido) || 0;
                        resumenMap.set(key, (resumenMap.get(key) || 0) + consumido);

                        return [
                            { text: new Date(item.fecha).toLocaleDateString(), alignment: 'left' },
                            { text: item.modelo, alignment: 'center' },
                            { text: item.tipo, alignment: 'center' },
                            { text: item.color, alignment: 'center' },
                            { text: consumido, alignment: 'center' }
                        ];
                    })
                ]
            },
            layout: 'lightHorizontalLines'
        });
    });

    // --- SECCIÓN DE RESUMEN FINAL ---
    const resumenData = Array.from(resumenMap.entries()).map(([key, total]) => {
        const [modelo, color, tipo] = key.split('|');
        return { modelo, color, tipo, total };
    }).sort((a, b) => a.modelo.localeCompare(b.modelo));

    if (resumenData.length > 0) {
        // Añadir una página nueva para el resumen final
        content.push({ text: '', pageBreak: 'before' });

        content.push({
            text: 'Resumen Consolidado de Consumo',
            fontSize: 18,
            bold: true,
            margin: [0, 10, 0, 15],
            alignment: 'center',
            color: '#2563eb'
        });

        content.push({
            style: 'tableSummary',
            table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Modelo de Insumo', style: 'tableHeaderSummary' },
                        { text: 'Color', style: 'tableHeaderSummary' },
                        { text: 'Tipo', style: 'tableHeaderSummary' },
                        { text: 'Total Consumido', style: 'tableHeaderSummary' }
                    ],
                    ...resumenData.map(item => [
                        { text: item.modelo, bold: true },
                        { text: item.color, alignment: 'center' },
                        { text: item.tipo, alignment: 'center' },
                        { text: `${item.total} un.`, alignment: 'center', bold: true }
                    ])
                ]
            },
            layout: {
                fillColor: function (rowIndex, node, columnIndex) {
                    return (rowIndex % 2 === 0) ? '#f8fafc' : null;
                },
                hLineColor: '#e2e8f0',
                vLineColor: '#e2e8f0',
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
            }
        });

        const granTotal = resumenData.reduce((acc, curr) => acc + curr.total, 0);
        content.push({
            text: `Total de Insumos Entregados: ${granTotal} unidades`,
            fontSize: 14,
            bold: true,
            margin: [0, 20, 0, 0],
            alignment: 'right',
            color: '#1e293b'
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
                        { text: 'Reporte de Consumo de Insumos por Área', fontSize: 18, bold: true, alignment: 'center', margin: [0, 30, 0, 0], border: [false, false, false, true] },
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

export default ReporteConsumoTintas;