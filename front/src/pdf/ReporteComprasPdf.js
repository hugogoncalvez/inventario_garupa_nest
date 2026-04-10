import { muniLogo, infoLogo } from './logo';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const ReporteComprasPdf = (reporteData, fechaDesde, fechaHasta) => {

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const formatFecha = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString.replace(/-/g, '/'));
        return `${date.getDate()} de ${meses[date.getMonth()]} del ${date.getFullYear()}`;
    };

    // Acumular para el resumen global
    const resumenMap = new Map();

    const tableBody = [
        [
            { text: 'Fecha', style: 'tableHeader' },
            { text: 'Producto', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader' },
            { text: 'Unidad', style: 'tableHeader' },
            { text: 'Usuario', style: 'tableHeader' }
        ],
        ...reporteData.map(item => {
            const key = `${item.producto}|${item.tipo}|${item.unidad}`;
            resumenMap.set(key, (resumenMap.get(key) || 0) + (Number(item.cantidad) || 0));

            return [
                new Date(item.fecha).toLocaleDateString(),
                item.producto,
                item.tipo,
                { text: item.cantidad, alignment: 'center' },
                item.unidad,
                item.usuario
            ];
        })
    ];

    // Contenido del resumen
    const resumenData = Array.from(resumenMap.entries()).map(([key, total]) => {
        const [producto, tipo, unidad] = key.split('|');
        return { producto, tipo, unidad, total };
    }).sort((a, b) => a.producto.localeCompare(b.producto));

    const content = [
        {
            text: `Periodo del reporte: ${formatFecha(fechaDesde)} al ${formatFecha(fechaHasta)}\n\n`,
            fontSize: 12,
            alignment: 'center',
        },
        {
            style: 'tableExample',
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                body: tableBody
            },
            layout: 'lightHorizontalLines'
        }
    ];

    if (resumenData.length > 0) {
        content.push({ text: '', pageBreak: 'before' });

        content.push({
            text: 'Resumen Consolidado de Compras',
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
                        { text: 'Producto', style: 'tableHeaderSummary' },
                        { text: 'Tipo', style: 'tableHeaderSummary' },
                        { text: 'Cantidad Total', style: 'tableHeaderSummary' },
                        { text: 'Unidad', style: 'tableHeaderSummary' }
                    ],
                    ...resumenData.map(item => [
                        { text: item.producto, bold: true },
                        { text: item.tipo, alignment: 'center' },
                        { text: item.total.toLocaleString(undefined, { maximumFractionDigits: 2 }), alignment: 'center', bold: true },
                        { text: item.unidad, alignment: 'center' }
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
    }

    const docDefinition = {
        pageMargins: [40, 120, 40, 55],
        header: {
            table: {
                widths: ['25%', '*', '25%'],
                body: [
                    [
                        { ...muniLogo },
                        { text: 'Reporte de Compras', fontSize: 18, bold: true, alignment: 'center', margin: [0, 30, 0, 0], border: [false, false, false, true] },
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
                fontSize: 11,
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

export default ReporteComprasPdf;
