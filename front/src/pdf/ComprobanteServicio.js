import { muniLogo, infoLogo } from './logo';

let _pdfMake = null; // Variable para almacenar pdfMake después de la carga dinámica

async function loadPdfMakeAndFonts() {
    if (!_pdfMake) {
        const pdfMakeModule = await import('pdfmake/build/pdfmake');
        const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
        _pdfMake = pdfMakeModule.default;
        _pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
    return _pdfMake;
}

const ComprobanteServicio = async (orden) => { // Hacer la función asíncrona
    const pdfMake = await loadPdfMakeAndFonts(); // Cargar pdfmake dinámicamente

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    let fecha = new Date();
    let mes = meses[fecha.getMonth()];
    let dia = fecha.getDate();
    let anio = fecha.getFullYear();

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
                        text: 'Subdirección de Informática\nComprobante de Servicio',
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
    };

    var dd = {
        pageMargins: [40, 155, 40, 55],
        header: encabezado,
        footer: function (currentPage, pageCount) {
            return { text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center', margin: [0, 30, 0, 0] };
        },
        content: [
            // Fecha
            {
                text: `Garupá, Misiones, ${dia} de ${mes} del año ${anio}.-\n\n`,
                fontSize: 13,
                bold: false,
                alignment: 'right',
            },
            
            // Información básica en tabla
            {
                table: {
                    widths: ['30%', '70%'],
                    heights: [25, 25],
                    headerRows: 0,
                    body: [
                        [
                            {
                                text: 'Nº de Orden:',
                                fontSize: 14,
                                bold: true,
                                alignment: 'left',
                                border: [true, true, true, true],
                                margin: [5, 5, 5, 5]
                            },
                            {
                                text: `${orden.id}`,
                                fontSize: 13,
                                bold: false,
                                alignment: 'left',
                                border: [true, true, true, true],
                                margin: [5, 5, 5, 5]
                            }
                        ],
                        [
                            {
                                text: 'Equipo ID:',
                                fontSize: 14,
                                bold: true,
                                alignment: 'left',
                                border: [true, true, true, true],
                                margin: [5, 5, 5, 5]
                            },
                            {
                                text: `${orden.id_equipo}`,
                                fontSize: 13,
                                bold: false,
                                alignment: 'left',
                                border: [true, true, true, true],
                                margin: [5, 5, 5, 5]
                            }
                        ],
                        [
                            {
                                text: 'Técnico Asignado:',
                                fontSize: 14,
                                bold: true,
                                alignment: 'left',
                                border: [true, true, true, true],
                                margin: [5, 5, 5, 5]
                            },
                            {
                                text: `${orden.tecnico_asignado}`,
                                fontSize: 13,
                                bold: false,
                                alignment: 'left',
                                border: [true, true, true, true],
                                margin: [5, 5, 5, 5]
                            }
                        ]
                    ]
                }
            },

            '\n\n',

            // Sección Problema Reportado
            {
                text: 'PROBLEMA REPORTADO',
                fontSize: 16,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
                margin: [0, 0, 0, 10]
            },
            {
                table: {
                    widths: ['100%'],
                    body: [
                        [
                            {
                                text: `${orden.problema_reportado}`,
                                fontSize: 12,
                                bold: false,
                                alignment: 'justify',
                                border: [true, true, true, true],
                                margin: [10, 10, 10, 10]
                            }
                        ]
                    ]
                }
            },

            '\n\n',

            // Sección Trabajo Realizado
            {
                text: 'TRABAJO REALIZADO',
                fontSize: 16,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
                margin: [0, 0, 0, 10]
            },
            {
                table: {
                    widths: ['100%'],
                    body: [
                        [
                            {
                                text: `${orden.trabajo_realizado || 'Pendiente de realizar'}`,
                                fontSize: 12,
                                bold: false,
                                alignment: 'justify',
                                border: [true, true, true, true],
                                margin: [10, 10, 10, 10],
                                color: orden.trabajo_realizado ? '#000000' : '#888888'
                            }
                        ]
                    ]
                }
            },

            '\n\n\n',

            // Sección de firmas
            {
                text: 'CONFORMIDAD Y RECEPCIÓN DEL SERVICIO',
                fontSize: 14,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
                margin: [0, 0, 0, 20]
            },

            `\n\n\n`,

            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            // Línea de firma del técnico
                            {
                                canvas: [
                                    {
                                        type: 'line',
                                        x1: 20, y1: 0,
                                        x2: 200, y2: 0,
                                        lineWidth: 1
                                    }
                                ]
                            },
                            {
                                text: `Firma del Técnico: ${orden.tecnico_asignado}`,
                                fontSize: 12,
                                alignment: 'center',
                                margin: [0, 10, 0, 0]
                            }
                        ]
                    },
                    {
                        width: '50%',
                        stack: [
                            // Línea de firma del usuario
                            {
                                canvas: [
                                    {
                                        type: 'line',
                                        x1: 20, y1: 0,
                                        x2: 200, y2: 0,
                                        lineWidth: 1
                                    }
                                ]
                            },
                            {
                                text: 'Firma del Usuario: _________________________',
                                fontSize: 12,
                                alignment: 'left',
                                margin: [0, 10, 0, 10]
                            },
                            {
                                text: 'D.N.I. Nº: _________________________________',
                                fontSize: 12,
                                alignment: 'left',
                                margin: [0, 0, 0, 0]
                            }
                        ]
                    }
                ]
            }
        ],
        styles: {
            header: {
                fontSize: 28,
                bold: true
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }
        }
    };

    pdfMake.createPdf(dd).open();
};

export default ComprobanteServicio;