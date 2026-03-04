import { muniLogo, infoLogo } from './logo';
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const ActaRecargaTintaPdf = (recargaData) => {

    const { insumoGranel, cartucho, impresora, area, cantidadInsumo, cantidadCartuchos, fechaRecarga } = recargaData;

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const fecha = new Date(fechaRecarga);
    const mes = meses[fecha.getMonth()];
    const dia = fecha.getDate();
    const anio = fecha.getFullYear();

    const docDefinition = {
        pageMargins: [40, 155, 40, 55],
        header: {
            table: {
                widths: ['25%', '*', '25%'],
                heights: [100, 100, 100],
                body: [
                    [
                        { ...muniLogo },
                        { text: 'Subdirección de Informática\nActa de Recarga de Insumo', fontSize: 18, bold: true, alignment: 'center', margin: [0, 20, 0, 0], border: [false, false, false, true] },
                        { ...infoLogo }
                    ]
                ]
            }
        },
        footer: function (currentPage, pageCount) {
            return { text: `Página ${currentPage.toString()} de ${pageCount}`, alignment: 'center', margin: [0, 30, 0, 0] };
        },
        content: [
            {
                text: `Garupá, Misiones, ${dia} de ${mes} del año ${anio}.\n\n`,
                fontSize: 13,
                bold: false,
                alignment: 'right',
            },
            {
                text: '\nPor medio de la presente se deja constancia de la recarga de un insumo con el siguiente detalle:\n\n',
                fontSize: 13,
                bold: false,
                alignment: 'justify',
            },
            {
                text: 'Detalle de Recarga:\n\n',
                fontSize: 20,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
                margin: [0, 0, 0, 10]
            },
            {
                table: {
                    widths: ['30%', '70%'],
                    heights: [20],
                    body: [
                        [{ text: 'Área de Destino:', style: 'tableHeader' }, { text: `${area.area}`, fontSize: 13, alignment: 'center' }],
                        [{ text: 'Impresora:', style: 'tableHeader' }, { text: `${impresora.marca} ${impresora.modelo}`, fontSize: 13, alignment: 'center' }],
                        [{ text: 'Insumo a Granel Utilizado:', style: 'tableHeader' }, { text: `${insumoGranel.nombre}`, fontSize: 13, alignment: 'center' }],
                        [{ text: 'Cantidad Utilizada:', style: 'tableHeader' }, { text: `${cantidadInsumo} ${insumoGranel.unidad_medida}`, fontSize: 13, alignment: 'center' }],
                        [{ text: 'Cartucho Recargado:', style: 'tableHeader' }, { text: cartucho ? `${cartucho.modelo} (${cartucho.color})` : 'No especificado', fontSize: 13, alignment: 'center' }],
                        [{ text: 'Número de Cartuchos Recargados:', style: 'tableHeader' }, { text: `${cantidadCartuchos}`, fontSize: 13, alignment: 'center' }]
                    ]
                },
                layout: 'lightHorizontalLines'
            },
            '\n\n\n\n\n',
            {
                text: `\n\nFirma del Responsable:_________________________________________`,
                fontSize: 12,
                bold: false,
                alignment: 'right',
            },
            {
                text: `\n\nAclaración:_______________________________________________________`,
                fontSize: 12,
                bold: false,
                alignment: 'right',
            },
            {
                text: `\n\nD.N.I. Nº:________________________________________________________`,
                fontSize: 12,
                bold: false,
                alignment: 'right',
            },
        ],
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'left',
                fillColor: '#EEEEEE',
                margin: [5, 5, 5, 5]
            },
        }
    };

    pdfMake.createPdf(docDefinition).open();
};

export default ActaRecargaTintaPdf;
