import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { muniLogo, infoLogo } from './logo'

const ActaDevolucion = async (items) => {

   // const actualPdfMake = pdfMake.default || pdfMake;

    //actualPdfMake.vfs = pdfFonts.pdfMake.vfs;

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
                        text: 'Subdirección de Informática\nActa de Devolución',
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
        //pageOrientation: 'landscape',
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
            //`\nGarupá, Misiones. a los ${dia} del mes de ${mes} del año ${anio}\n\n`,
            {
                text: '\nPor medio de la presente se deja constancia de que los bienes, detallados más abajo, se entregan en calidad de DEVOLUCIÓN.\n\n',
                fontSize: 13,
                bold: false,
                alignment: 'justify',
            },

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
                            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],

                            body: elementos

                        }
                    },
                    { width: '*', text: '' }
                ]

            },
            //    (data.estado !== 'Nuevo') ? {
            //         text: `\nSe deja constancia que el/los elemento/s, arriba detallado/s, se encuentra/n en perfecto estado de funcionamiento.\n\n`,
            //         fontSize: 13,
            //         bold: false,
            //         alignment: 'justify',
            //     }:
            `\n\n\n`,
            {
                text: `\n\nFirma:______________________________________________________`,
                fontSize: 12,
                bold: false,
                alignment: 'right',
            },
            {
                text: `\n\nAclararión:_________________________________________________`,
                fontSize: 12,
                bold: false,
                alignment: 'right',
            },
            {
                text: `\n\nD.N.I. Nº:__________________________________________________`,
                fontSize: 12,
                bold: false,
                alignment: 'right',
            },
            // {
            //     text: `\n\nCaracter:___________________________________________________`,
            //     fontSize: 12,
            //     bold: false,
            //     alignment: 'right',
            // }
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
export default ActaDevolucion