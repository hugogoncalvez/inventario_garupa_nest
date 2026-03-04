import { muniLogo, infoLogo } from './logo';
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const ActaEntregaTintasPdf = (entregaData) => {
    // La data ahora contiene un array 'items', una sola 'area', y el 'usuario'
    const { items, area, usuario, fechaEntrega } = entregaData;

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const fecha = new Date(fechaEntrega);
    const mes = meses[fecha.getMonth()];
    const dia = fecha.getDate();
    const anio = fecha.getFullYear();

    // Construir el cuerpo de la tabla de insumos dinámicamente
    const insumosTableBody = [
        // Encabezados de la tabla
        [
            { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
            { text: 'Tipo', style: 'tableHeader' },
            { text: 'Modelo', style: 'tableHeader' },
            { text: 'Color', style: 'tableHeader' },
            { text: 'Impresora Destino', style: 'tableHeader' }
        ]
    ];
    
    // Mapear cada item a una fila de la tabla
    items.forEach(item => {
        // Asegurarse de que el item y la impresora existan para evitar errores
        const impresoraModelo = item.impresora ? item.impresora.modelo : 'N/A';
        insumosTableBody.push([
            { text: item.cantidad, alignment: 'center' },
            item.tipo,
            item.modelo,
            item.color,
            impresoraModelo
        ]);
    });

    const docDefinition = {
        pageMargins: [40, 155, 40, 55],
        header: {
            table: {
                widths: ['25%', '*', '25%'],
                heights: [100, 100, 100],
                body: [
                    [
                        { ...muniLogo },
                        { text: 'Subdirección de Informática\nActa de Entrega de Insumos', fontSize: 18, bold: true, alignment: 'center', margin: [0, 20, 0, 0], border: [false, false, false, true] },
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
                text: `Por medio de la presente se deja constancia de la entrega de los siguientes insumos al área detallada a continuación:\n\n`,
                fontSize: 13,
                bold: false,
                alignment: 'justify',
            },
            // Tabla con la información del área y quién entrega
            {
                table: {
                    widths: ['30%', '70%'],
                    body: [
                        [{ text: 'Área Destino:', style: 'tableHeader' }, area.area],
                        [{ text: 'Entregado por:', style: 'tableHeader' }, `${usuario.nombre} ${usuario.apellido}`]
                    ]
                },
                layout: {
                    hLineWidth: () => 1, vLineWidth: () => 1,
                    hLineColor: () => '#DDDDDD', vLineColor: () => '#DDDDDD',
                },
                margin: [0, 0, 0, 20]
            },
            {
                text: 'Insumos Entregados:',
                fontSize: 16,
                bold: true,
                alignment: 'left',
                margin: [0, 0, 0, 10]
            },
            // Tabla principal con la lista de insumos
            {
                table: {
                    widths: ['auto', 'auto', '*', 'auto', '*'],
                    headerRows: 1,
                    body: insumosTableBody
                },
                layout: 'lightHorizontalLines'
            },
            '\n\n\n',
            {
                text: `\n\nFirma del Responsable del Área:_________________________________________`,
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
            },
        }
    };

    pdfMake.createPdf(docDefinition).open();
};

export default ActaEntregaTintasPdf;
