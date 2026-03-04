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

    const tableBody = [
        [
            { text: 'Fecha', style: 'tableHeader' },
            { text: 'Producto', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader' },
            { text: 'Unidad', style: 'tableHeader' },
            { text: 'Usuario', style: 'tableHeader' }
        ],
        ...reporteData.map(item => [
            new Date(item.fecha).toLocaleDateString(),
            item.producto,
            item.tipo,
            { text: item.cantidad, alignment: 'center' },
            item.unidad,
            item.usuario
        ])
    ];

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
        content: [
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
        ],
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 11,
                color: 'black',
                alignment: 'center',
                fillColor: '#EEEEEE'
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            }
        }
    };

    pdfMake.createPdf(docDefinition).open();
};

export default ReporteComprasPdf;
