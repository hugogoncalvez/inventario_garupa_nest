import { muniLogo, infoLogo } from './logo';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const ReporteInventarioInsumos = (cartuchos) => {
    const fechaActual = new Date().toLocaleDateString();

    const docDefinition = {
        pageMargins: [40, 120, 40, 55],
        header: {
            table: {
                widths: ['25%', '*', '25%'],
                body: [
                    [
                        { ...muniLogo },
                        {
                            text: 'Reporte de Insumos (Tintas/Toner/Drum)',
                            fontSize: 16,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 30, 0, 0]
                        },
                        {
                            text: '(Tintas/Toner/Drum)',
                            fontSize: 16,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 30, 0, 0]
                        },
                        { ...infoLogo }
                    ]
                ]
            },
            margin: [0, 0, 0, 10],
            layout: 'noBorders'
        },
        footer: function (currentPage, pageCount) {
            return {
                text: `Página ${currentPage.toString()} de ${pageCount} - Generado el ${fechaActual}`,
                alignment: 'center',
                margin: [0, 20, 0, 0],
                fontSize: 10
            };
        },
        content: [
            {
                text: `Fecha del reporte: ${fechaActual}`,
                style: 'subheader',
                alignment: 'right',
                margin: [0, 0, 0, 10]
            },
            {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Modelo', style: 'tableHeader' },
                            { text: 'Color', style: 'tableHeader' },
                            { text: 'Tipo', style: 'tableHeader' },
                            { text: 'Rec.', style: 'tableHeader' },
                            { text: 'Stock', style: 'tableHeader' },
                            { text: 'Mín.', style: 'tableHeader' }
                        ],
                        ...cartuchos.map(c => [
                            { text: c.modelo, fontSize: 10 },
                            { text: c.color || '-', fontSize: 10, alignment: 'center' },
                            { text: c.tipo, fontSize: 10, alignment: 'center' },
                            { text: c.es_recargable ? 'Sí' : 'No', fontSize: 10, alignment: 'center' },
                            {
                                text: c.stock_unidades.toString(),
                                fontSize: 10,
                                alignment: 'center',
                                bold: c.stock_unidades <= c.stock_minimo_unidades,
                                color: c.stock_unidades <= c.stock_minimo_unidades ? 'red' : 'black'
                            },
                            { text: c.stock_minimo_unidades.toString(), fontSize: 10, alignment: 'center' }
                        ])
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 2 : 1;
                    },
                    vLineWidth: function (i, node) {
                        return 0;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                    },
                    paddingLeft: function (i, node) { return 4; },
                    paddingRight: function (i, node) { return 4; },
                }
            },
        ],
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 11,
                color: 'white',
                fillColor: '#4F4F4F',
                alignment: 'center'
            },
            subheader: {
                fontSize: 12,
                italic: true
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            }
        }
    };

    pdfMake.createPdf(docDefinition).open();
};

export default ReporteInventarioInsumos;
