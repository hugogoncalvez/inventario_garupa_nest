import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import EventIcon from '@mui/icons-material/Event';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PrintIcon from '@mui/icons-material/Print';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Chip, Tooltip, Tabs, Tab } from '@mui/material';

import ReporteConsumoTintas from '../../pdf/ReporteConsumoTintas';
import ActaEntregaTintasPdf from '../../pdf/ActaEntregaTintas';
import ActaRecargaTinta from '../../pdf/ActaRecargaTinta';

// estilos de la tabla
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 14,
        fontWeight: 600,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function Row(props) {
    const { row } = props;
    const [open, setOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <React.Fragment>
            <StyledTableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <StyledTableCell width="50">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {row.area}
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Chip 
                        label={`${row.totalEntregas} un.`} 
                        size="small" 
                        sx={{ 
                            fontWeight: 800, 
                            bgcolor: 'primary.main', 
                            color: '#fff',
                            minWidth: 60
                        }} 
                    />
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Chip 
                        label={`${row.totalRecargasCartuchos} un. (${row.totalRecargasInsumo.toLocaleString()} ${row.unidadMedida || 'g'})`} 
                        size="small" 
                        sx={{ 
                            fontWeight: 800, 
                            bgcolor: 'success.main', 
                            color: '#fff',
                            minWidth: 80
                        }} 
                    />
                </StyledTableCell>
            </StyledTableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, marginLeft: 4 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} textColor="secondary" indicatorColor="secondary">
                                    <Tab label={`📦 Entregas Directas (${row.entregas.length})`} sx={{ fontWeight: 700 }} />
                                    <Tab label={`🧪 Recargas a Granel (${row.recargas.length})`} sx={{ fontWeight: 700 }} />
                                </Tabs>
                            </Box>

                            {/* Pestaña 1: Entregas Directas */}
                            {tabIndex === 0 && (
                                <Box sx={{ mb: 2 }}>
                                    {row.entregas.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">No hay entregas directas registradas en este período.</Typography>
                                    ) : (
                                        <Table size="small" aria-label="detalle-entregas">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'var(--mui-palette-action-hover)' }}>
                                                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Modelo</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Color</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Re-imprimir</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {row.entregas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((itemRow, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{new Date(itemRow.fecha).toLocaleDateString()} {new Date(itemRow.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                        <TableCell>{itemRow.modelo}</TableCell>
                                                        <TableCell>{itemRow.tipo}</TableCell>
                                                        <TableCell>{itemRow.color}</TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ bgcolor: 'primary.main', color: '#fff', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 800, display: 'inline-block' }}>
                                                                {itemRow.consumido}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Re-imprimir Acta de Entrega">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="info" 
                                                                    onClick={() => {
                                                                        ActaEntregaTintasPdf({
                                                                            items: [{
                                                                                modelo: itemRow.modelo,
                                                                                color: itemRow.color,
                                                                                tipo: itemRow.tipo,
                                                                                cantidad: itemRow.consumido,
                                                                                impresora: {
                                                                                    modelo: itemRow.impresora_modelo,
                                                                                    marca: itemRow.impresora_marca
                                                                                }
                                                                            }],
                                                                            area: { area: row.area },
                                                                            usuario: { 
                                                                                nombre: itemRow.usuario_nombre, 
                                                                                apellido: itemRow.usuario_apellido,
                                                                                usuario: itemRow.usuario_login 
                                                                            },
                                                                            fechaEntrega: new Date(itemRow.fecha)
                                                                        });
                                                                    }}
                                                                >
                                                                    <PrintIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </Box>
                            )}

                            {/* Pestaña 2: Recargas a Granel */}
                            {tabIndex === 1 && (
                                <Box sx={{ mb: 2 }}>
                                    {row.recargas.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">No hay recargas a granel registradas en este período.</Typography>
                                    ) : (
                                        <Table size="small" aria-label="detalle-recargas">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'var(--mui-palette-action-hover)' }}>
                                                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Impresora</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Cartucho</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Insumo Usado</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Recargas</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Total Insumo</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Re-imprimir</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {row.recargas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((itemRow, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{new Date(itemRow.fecha).toLocaleDateString()} {new Date(itemRow.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                        <TableCell>{`${itemRow.impresoraModelo} (${itemRow.impresoraMarca})`}</TableCell>
                                                        <TableCell>{`${itemRow.cartuchoModelo} (${itemRow.cartuchoColor})`}</TableCell>
                                                        <TableCell>{itemRow.insumoGranelNombre}</TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ bgcolor: 'primary.main', color: '#fff', px: 1, py: 0.5, borderRadius: 1, fontWeight: 700, display: 'inline-block' }}>
                                                                {itemRow.cartuchos}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ bgcolor: 'success.main', color: '#fff', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 800, display: 'inline-block' }}>
                                                                {`${itemRow.insumo.toLocaleString()} ${itemRow.unidadMedida}`}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Re-imprimir Acta de Recarga">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="info" 
                                                                    onClick={() => {
                                                                        ActaRecargaTinta({
                                                                            insumoGranel: { nombre: itemRow.insumoGranelNombre, unidad_medida: itemRow.unidadMedida },
                                                                            cartucho: { modelo: itemRow.cartuchoModelo, color: itemRow.cartuchoColor },
                                                                            impresora: { modelo: itemRow.impresoraModelo, marca: itemRow.impresoraMarca },
                                                                            area: { area: row.area },
                                                                            usuario: { nombre: itemRow.usuarioNombre, apellido: itemRow.usuarioApellido },
                                                                            cantidadCartuchos: itemRow.cartuchos,
                                                                            cantidadInsumo: itemRow.insumo,
                                                                            fechaRecarga: new Date(itemRow.fecha)
                                                                        });
                                                                    }}
                                                                >
                                                                    <PrintIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export const ReportesTinta = () => {
    const [reporteData, setReporteData] = useState([]);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => { setPage(0); }, [reporteData.length]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleGenerateReport = async () => {
        if (!fechaDesde || !fechaHasta) {
            setError("Por favor, seleccione ambas fechas.");
            return;
        }

        try {
            const [resEntregas, resRecargas] = await Promise.all([
                api.get(`${URI}/reportes/consumo-por-area`, {
                    params: {
                        desde: new Date(fechaDesde).toISOString(),
                        hasta: new Date(fechaHasta + 'T23:59:59').toISOString()
                    }
                }),
                api.get(`${URI}/reportes/recargas-granel`, {
                    params: {
                        desde: new Date(fechaDesde).toISOString(),
                        hasta: new Date(fechaHasta + 'T23:59:59').toISOString()
                    }
                })
            ]);

            const areasMap = {};

            // 1. Procesar Entregas Directas
            resEntregas.data.forEach(item => {
                const areaName = item['impresora.area.area'] || 'Sin Área';
                if (!areasMap[areaName]) {
                    areasMap[areaName] = { 
                        area: areaName, 
                        entregas: [], 
                        recargas: [], 
                        totalEntregas: 0, 
                        totalRecargasCartuchos: 0, 
                        totalRecargasInsumo: 0,
                        unidadMedida: '' 
                    };
                }
                const cantidad = parseInt(item.cantidad, 10) || 0;
                areasMap[areaName].entregas.push({
                    modelo: item['cartucho.modelo'],
                    color: item['cartucho.color'],
                    tipo: item['cartucho.tipo'],
                    consumido: cantidad,
                    fecha: item.fecha,
                    impresora_modelo: item['impresora.modelo'],
                    impresora_marca: item['impresora.marca'],
                    usuario_nombre: item['usuario.nombre'],
                    usuario_apellido: item['usuario.apellido'],
                    usuario_login: item['usuario.usuario']
                });
                areasMap[areaName].totalEntregas += cantidad;
            });

            // 2. Procesar Recargas a Granel
            resRecargas.data.forEach(item => {
                const areaName = item['impresora.area.area'] || 'Sin Área';
                if (!areasMap[areaName]) {
                    areasMap[areaName] = { 
                        area: areaName, 
                        entregas: [], 
                        recargas: [], 
                        totalEntregas: 0, 
                        totalRecargasCartuchos: 0, 
                        totalRecargasInsumo: 0,
                        unidadMedida: item['insumo_granel.unidad_medida'] || '' 
                    };
                }

                const insumoConsumido = parseFloat(item.total_insumo_consumido) || 0;
                const cartuchosRecargados = parseInt(item.total_cartuchos_recargados, 10) || 0;

                areasMap[areaName].recargas.push({
                    impresoraModelo: item['impresora.modelo'],
                    impresoraMarca: item['impresora.marca'],
                    cartuchoModelo: item['unidad_cartucho.modelo'],
                    cartuchoColor: item['unidad_cartucho.color'],
                    insumoGranelNombre: item['insumo_granel.nombre'],
                    unidadMedida: item['insumo_granel.unidad_medida'],
                    usuarioNombre: item['usuario.nombre'],
                    usuarioApellido: item['usuario.apellido'],
                    cartuchos: cartuchosRecargados,
                    insumo: insumoConsumido,
                    fecha: item.fecha
                });

                areasMap[areaName].totalRecargasCartuchos += cartuchosRecargados;
                areasMap[areaName].totalRecargasInsumo += insumoConsumido;
                if (!areasMap[areaName].unidadMedida) {
                    areasMap[areaName].unidadMedida = item['insumo_granel.unidad_medida'] || '';
                }
            });

            setReporteData(Object.values(areasMap));
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || "Error al generar el reporte.");
            setReporteData([]);
        }
    };

    const generatePdf = () => {
        if (reporteData.length === 0) return;
        ReporteConsumoTintas(reporteData, fechaDesde, fechaHasta);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Reporte de Consumo y Recargas por Área
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    onClick={generatePdf}
                    startIcon={<PictureAsPdfIcon />}
                    disabled={reporteData.length === 0}
                    sx={{ px: 4, borderRadius: 2 }}
                >
                    Generar PDF
                </Button>
            </Box>

            {/* Panel de Filtros */}
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <FilterAltIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="600">Rango de Fechas</Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField label="Desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField label="Hasta" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <Button variant="contained" fullWidth onClick={handleGenerateReport} startIcon={<EventIcon />} sx={{ height: 40, borderRadius: 2, fontWeight: 700 }}>
                                Consultar
                            </Button>
                        </Grid>
                        {error && (
                            <Grid item xs={12}>
                                <Typography color="error" variant="caption">{error}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell width="50" />
                                <StyledTableCell>Área Municipal</StyledTableCell>
                                <StyledTableCell align='center'>📦 Entregas Directas (Nuevos)</StyledTableCell>
                                <StyledTableCell align='center'>🧪 Recargas Realizadas (Granel)</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reporteData.length > 0 ?
                                reporteData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <Row key={index} row={row} />
                                ))
                                :
                                <StyledTableRow>
                                    <StyledTableCell colSpan={4} align='center' sx={{ py: 3, color: 'text.secondary' }}>
                                        No hay datos para el rango seleccionado.
                                    </StyledTableCell>
                                </StyledTableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={reporteData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                />
            </Paper>
        </Container>
    );
};

