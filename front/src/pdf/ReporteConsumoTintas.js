import { muniLogo, infoLogo } from './logo';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const ReporteConsumoTintas = (reporteData, fechaDesde, fechaHasta) => {

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const formatFecha = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString.replace(/-/g, '/'));
        return `${date.getDate()} de ${meses[date.getMonth()]} del ${date.getFullYear()}`;
    };

    const content = [
        {
            text: `Periodo del reporte: ${formatFecha(fechaDesde)} al ${formatFecha(fechaHasta)}\n\n`,
            fontSize: 12,
            alignment: 'center',
        },
    ];

    const resumenEntregasMap = new Map();
    const resumenRecargasMap = new Map();

    reporteData.forEach(areaData => {
        const hasEntregas = areaData.entregas && areaData.entregas.length > 0;
        const hasRecargas = areaData.recargas && areaData.recargas.length > 0;

        if (!hasEntregas && !hasRecargas) return;

        // Encabezado del Área
        content.push({
            text: `Área: ${areaData.area}`,
            fontSize: 15,
            bold: true,
            margin: [0, 15, 0, 5],
            color: '#1e293b'
        });

        // 1. Tabla de Entregas
        if (hasEntregas) {
            content.push({
                text: `Entregas de Insumos Nuevos (Total: ${areaData.totalEntregas} un.)`,
                fontSize: 12,
                bold: true,
                margin: [0, 5, 0, 3],
                color: '#2563eb'
            });

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
                        ...areaData.entregas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(item => {
                            const key = `${item.modelo}|${item.color}|${item.tipo}`;
                            const consumido = Number(item.consumido) || 0;
                            resumenEntregasMap.set(key, (resumenEntregasMap.get(key) || 0) + consumido);

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
        }

        // 2. Tabla de Recargas
        if (hasRecargas) {
            content.push({
                text: `Recargas Realizadas (Total: ${areaData.totalRecargasCartuchos} un. / ${areaData.totalRecargasInsumo.toLocaleString()} ${areaData.unidadMedida || 'g'})`,
                fontSize: 12,
                bold: true,
                margin: [0, 8, 0, 3],
                color: '#059669'
            });

            content.push({
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Fecha', style: 'tableHeaderGreen' },
                            { text: 'Impresora', style: 'tableHeaderGreen', alignment: 'center' },
                            { text: 'Cartucho / Insumo', style: 'tableHeaderGreen', alignment: 'center' },
                            { text: 'Cant. Recargas', style: 'tableHeaderGreen', alignment: 'center' },
                            { text: 'Insumo Usado', style: 'tableHeaderGreen', alignment: 'center' }
                        ],
                        ...areaData.recargas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(item => {
                            const key = `${item.insumoGranelNombre}|${item.unidadMedida}`;
                            const insumoUsado = Number(item.insumo) || 0;
                            const cartuchos = Number(item.cartuchos) || 0;

                            const prev = resumenRecargasMap.get(key) || { cartuchos: 0, insumo: 0 };
                            resumenRecargasMap.set(key, {
                                cartuchos: prev.cartuchos + cartuchos,
                                insumo: prev.insumo + insumoUsado
                            });

                            return [
                                { text: new Date(item.fecha).toLocaleDateString(), alignment: 'left' },
                                { text: `${item.impresoraModelo} (${item.impresoraMarca})`, alignment: 'center' },
                                { text: `${item.cartuchoModelo} (${item.cartuchoColor}) - ${item.insumoGranelNombre}`, alignment: 'center' },
                                { text: cartuchos, alignment: 'center' },
                                { text: `${insumoUsado} ${item.unidadMedida}`, alignment: 'center' }
                            ];
                        })
                    ]
                },
                layout: 'lightHorizontalLines'
            });
        }
    });

    // --- SECCIÓN DE RESUMEN CONSOLIDADO FINAL ---
    const resumenEntregas = Array.from(resumenEntregasMap.entries()).map(([key, total]) => {
        const [modelo, color, tipo] = key.split('|');
        return { modelo, color, tipo, total };
    }).sort((a, b) => a.modelo.localeCompare(b.modelo));

    const resumenRecargas = Array.from(resumenRecargasMap.entries()).map(([key, data]) => {
        const [nombre, unidad] = key.split('|');
        return { nombre, unidad, ...data };
    });

    if (resumenEntregas.length > 0 || resumenRecargas.length > 0) {
        content.push({ text: '', pageBreak: 'before' });

        content.push({
            text: 'Resumen Consolidado General',
            fontSize: 18,
            bold: true,
            margin: [0, 10, 0, 15],
            alignment: 'center',
            color: '#2563eb'
        });

        if (resumenEntregas.length > 0) {
            content.push({ text: 'Total Entregas de Insumos Nuevos:', fontSize: 13, bold: true, margin: [0, 5, 0, 5], color: '#1e293b' });
            content.push({
                style: 'tableSummary',
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Modelo', style: 'tableHeaderSummary' },
                            { text: 'Color', style: 'tableHeaderSummary' },
                            { text: 'Tipo', style: 'tableHeaderSummary' },
                            { text: 'Total Entregado', style: 'tableHeaderSummary' }
                        ],
                        ...resumenEntregas.map(item => [
                            { text: item.modelo, bold: true },
                            { text: item.color, alignment: 'center' },
                            { text: item.tipo, alignment: 'center' },
                            { text: `${item.total} un.`, alignment: 'center', bold: true }
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            });
        }

        if (resumenRecargas.length > 0) {
            content.push({ text: 'Total Recargas con Insumos a Granel:', fontSize: 13, bold: true, margin: [0, 15, 0, 5], color: '#1e293b' });
            content.push({
                style: 'tableSummary',
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Insumo a Granel', style: 'tableHeaderGreen' },
                            { text: 'Cartuchos Recargados', style: 'tableHeaderGreen' },
                            { text: 'Total Consumido', style: 'tableHeaderGreen' }
                        ],
                        ...resumenRecargas.map(item => [
                            { text: item.nombre, bold: true },
                            { text: `${item.cartuchos} un.`, alignment: 'center' },
                            { text: `${item.insumo.toLocaleString()} ${item.unidad}`, alignment: 'center', bold: true }
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            });
        }
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
                        { text: 'Reporte de Consumo y Recargas por Área', fontSize: 17, bold: true, alignment: 'center', margin: [0, 30, 0, 0], border: [false, false, false, true] },
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
                color: 'white',
                alignment: 'center',
                fillColor: '#2563eb'
            },
            tableHeaderGreen: {
                bold: true,
                fontSize: 11,
                color: 'white',
                alignment: 'center',
                fillColor: '#059669'
            },
            tableHeaderSummary: {
                bold: true,
                fontSize: 11,
                color: 'white',
                alignment: 'center',
                fillColor: '#1d4ed8'
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