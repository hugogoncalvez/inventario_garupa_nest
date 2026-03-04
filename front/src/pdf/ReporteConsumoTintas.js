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
                    ...areaData.items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(item => [
                        { text: new Date(item.fecha).toLocaleDateString(), alignment: 'left' },
                        { text: item.modelo, alignment: 'center' },
                        { text: item.tipo, alignment: 'center' },
                        { text: item.color, alignment: 'center' },
                        { text: item.consumido, alignment: 'center' }
                    ])
                ]
            },
            layout: 'lightHorizontalLines'
        });
    });


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
        content: content, // Usar el contenido generado dinámicamente
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 13,
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

export default ReporteConsumoTintas;