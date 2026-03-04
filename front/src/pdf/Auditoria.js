import { muniLogo, infoLogo } from './logo'
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

// let _pdfMake = null; // Variable para almacenar pdfMake después de la carga dinámica

// async function loadPdfMakeAndFonts() {
//     if (!_pdfMake) {
//         const pdfMakeModule = await import('pdfmake/build/pdfmake');
//         const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
//         _pdfMake = pdfMakeModule.default;
//         _pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
//     }
//     return _pdfMake;
// }

const Auditoria = async (items) => { // Hacer la función asíncrona
    //   const pdfMake = await loadPdfMakeAndFonts(); // Cargar pdfmake dinámicamente

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];


    let fecha = new Date()

    let mes = meses[fecha.getMonth()]
    let dia = fecha.getDate()
    let anio = fecha.getFullYear()

    let area = items[0].area
    let responsable = items[0].resp_area


    var encabezado = {

        table: {
            widths: ['25%', '*', '25%'],
            heights: [100, 100, 100],

            body: [
                [
                    {
                        ...muniLogo

                    },
                    {
                        text: '\n\nSubdirección de Informática\n',
                        fontSize: 18,
                        bold: true,
                        alignment: 'center',
                        margin: [0, 20, 0, 0],
                        border: [false, false, false, true],

                    },
                    {
                        ...infoLogo

                    }
                ]
            ]
        }
    }

    var headers = {
        fila_0: {
            col_1: { text: 'N° de inventario', style: 'tableHeader', alignment: 'center' },
            col_2: { text: 'Tipo', style: 'tableHeader', alignment: 'center' },
            col_3: { text: 'Descripción', style: 'tableHeader', alignment: 'center' },
            col_4: { text: 'Marca', style: 'tableHeader', alignment: 'center' },
            col_5: { text: 'N° de serie', style: 'tableHeader', alignment: 'center' },
            col_6: { text: 'Estado', style: 'tableHeader', alignment: 'center' }
        },
    }


    var elementos = [];

    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            var header = headers[key];
            var row = [];
            row.push({ text: header.col_1, alignment: 'center' });
            row.push({ text: header.col_2, alignment: 'center' });
            row.push({ text: header.col_3, alignment: 'center' });
            row.push({ text: header.col_4, alignment: 'center' });
            row.push({ text: header.col_5, alignment: 'center' });
            row.push({ text: header.col_6, alignment: 'center' });
            elementos.push(row);
        }
    }
    for (var key2 in items) {
        if (items.hasOwnProperty(key2)) {
            var data = items[key2];
            var row2 = [];
            row2.push({ text: data.num_inventario, alignment: 'center' });
            row2.push({ text: data.tipo, alignment: 'center' });
            row2.push({ text: data.descripcion, alignment: 'center' });
            row2.push({ text: data.marca, alignment: 'center' });
            row2.push({ text: data.num_serie, alignment: 'center' });
            row2.push({ text: data.estado, alignment: 'center' });
            elementos.push(row2);
        }
    }

    var dd = {
        pageMargins: [40, 155, 40, 55],
        pageOrientation: 'landscape',
        header: encabezado,
        footer: function (currentPage, pageCount) {
            return { text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center', margin: [0, 30, 0, 0] };
        },
        content: [
            {
                text: `Garupá, Misiones, ${dia} de ${mes} del año ${anio}.-\n\n`,
                fontSize: 13,
                bold: false,
                alignment: 'right',
            },
            {
                text: 'Auditoría Informática:\n\n',
                fontSize: 20,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
            },
            //`\nGarupá, Misiones. a los ${dia} del mes de ${mes} del año ${anio}\n\n`,
            // {
            //     text: '\nPor medio de la presente se deja constancia de los elementos informáticos entregados al abajo firmante para su uso y cargo, los cuales se detallan a continuación:\n\n',
            //     fontSize: 13,
            //     bold: false,
            //     alignment: 'justify',
            // },

            //{ text: 'A simple table (no headers, no width specified, no spans, no styling)', style: 'sta' },
            //'The following table has nothing more than a body array',
            {
                // style: 'tableExample',
                table: {
                    widths: ['30%', '70%'],
                    heights: [20, 20],
                    headerRows: 1,
                    // keepWithHeaderRows: 1,
                    body: [
                        [{
                            text: 'Area',
                            fontSize: 16,
                            bold: true,
                            alignment: 'center',
                            // margin: [0, 10, 0, 0],
                            border: [true, true, true, true],

                        },
                        {
                            text: 'Responsable',
                            fontSize: 16,
                            bold: true,
                            alignment: 'center',
                            // margin: [0, 10, 0, 0],
                            border: [true, true, true, true],

                        }],
                        [{
                            text: area,
                            fontSize: 14,
                            bold: false,
                            alignment: 'center',
                            // margin: [0, 10, 0, 0],
                            border: [true, true, true, true],

                        },
                        {
                            text: responsable,
                            fontSize: 14,
                            bold: false,
                            alignment: 'center',
                            // margin: [0, 10, 0, 0],
                            border: [true, true, true, true],

                        }]
                    ]
                }
            },
            '\n\n',
            {
                text: 'Elementos:\n\n',
                fontSize: 20,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
            },
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            widths: [60, 60, 200, 70, 100, 60],
                            body: elementos
                        }
                    },
                    { width: '*', text: '' }
                ]

            },
            '\n\n\n',
            {
                // style: 'tableExample',
                table: {
                    widths: ['30%', '70%'],
                    heights: [20, 20],
                    headerRows: 1,
                    // keepWithHeaderRows: 1,
                    body: [
                        [{
                            text: 'Número de PC',
                            fontSize: 16,
                            bold: true,
                            alignment: 'center',
                            // margin: [0, 10, 0, 0],
                            border: [true, true, true, true],

                        },
                        {
                            text: items[0].num_pc,
                            fontSize: 16,
                            bold: true,
                            alignment: 'center',
                            // margin: [0, 10, 0, 0],
                            border: [true, true, true, true],

                        }],
                    ]
                }
            },

        ],
        styles: {
            header: {
                fontSize: 28,
                bold: true
            },
            subheader: {
                fontSize: 15,
                bold: true
            },
            quote: {
                italics: true
            },
            small: {
                fontSize: 8
            },
            sta: {
                fontSize: 11,
                bold: false,
                alignment: 'justify'
            }
        }
    }



    pdfMake.createPdf(dd).open();
}
export default Auditoria