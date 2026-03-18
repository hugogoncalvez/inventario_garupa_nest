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
import { Card, CardContent, Grid, Chip } from '@mui/material';

import ReporteRecargasGranelPdf from '../../pdf/ReporteRecargasGranelPdf';

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

    return (
        <React.Fragment>
            <StyledTableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <StyledTableCell width="50">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {row.area}
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Chip 
                        label={`${row.totalCartuchos} unidades`} 
                        size="small" 
                        variant="filled" 
                        sx={{ 
                            fontWeight: 800, 
                            bgcolor: 'primary.main', 
                            color: '#fff',
                            minWidth: 80 
                        }} 
                    />
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Chip 
                        label={`${row.totalInsumo.toLocaleString()} ${row.unidadMedida}`} 
                        size="small" 
                        variant="filled" 
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
                        <Box sx={{ margin: 2, marginLeft: 6 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="700" color="secondary">
                                Detalle de Recargas por Impresora
                            </Typography>
                            <Table size="small" aria-label="detalle-recargas">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Impresora</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Cartucho</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Insumo</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Cant. Recargas</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Total Insumo</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((itemRow, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{new Date(itemRow.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell>{`${itemRow.impresoraModelo} (${itemRow.impresoraMarca})`}</TableCell>
                                            <TableCell>{`${itemRow.cartuchoModelo} (${itemRow.cartuchoColor})`}</TableCell>
                                            <TableCell>{itemRow.insumoGranelNombre}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: '#fff', 
                                                    px: 1, 
                                                    py: 0.5,
                                                    borderRadius: 1, 
                                                    fontWeight: 700, 
                                                    display: 'inline-block',
                                                    minWidth: 24
                                                }}>
                                                    {itemRow.cartuchos}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ 
                                                    bgcolor: 'success.main', 
                                                    color: '#fff', 
                                                    px: 1.5, 
                                                    py: 0.5,
                                                    borderRadius: 1, 
                                                    fontWeight: 800, 
                                                    display: 'inline-block' 
                                                }}>
                                                    {`${itemRow.insumo.toLocaleString()} ${itemRow.unidadMedida}`}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{`${itemRow.usuarioNombre || ''} ${itemRow.usuarioApellido || ''}`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export const ReportesRecargasGranel = () => {
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
            const res = await api.get(`${URI}/reportes/recargas-granel`, {
                params: {
                    desde: new Date(fechaDesde).toISOString(),
                    hasta: new Date(fechaHasta + 'T23:59:59').toISOString()
                }
            });

            const groupedByArea = res.data.reduce((acc, item) => {
                const areaName = item['impresora.area.area'];
                if (!acc[areaName]) {
                    acc[areaName] = { area: areaName, items: [], totalCartuchos: 0, totalInsumo: 0, unidadMedida: item['insumo_granel.unidad_medida'] };
                }
                const insumoConsumido = parseFloat(item.total_insumo_consumido) || 0;
                const cartuchosRecargados = parseInt(item.total_cartuchos_recargados, 10) || 0;

                acc[areaName].items.push({
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
                acc[areaName].totalCartuchos += cartuchosRecargados;
                acc[areaName].totalInsumo += insumoConsumido;
                return acc;
            }, {});

            setReporteData(Object.values(groupedByArea));
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || "Error al generar el reporte.");
            setReporteData([]);
        }
    };

    const generatePdf = () => {
        if (reporteData.length === 0) return;
        ReporteRecargasGranelPdf(reporteData, fechaDesde, fechaHasta);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Reporte de Recargas
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    onClick={generatePdf}
                    startIcon={<PictureAsPdfIcon />}
                    disabled={reporteData.length === 0}
                    sx={{ px: 4 }}
                >
                    Generar PDF
                </Button>
            </Box>

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
                            <Button variant="contained" fullWidth onClick={handleGenerateReport} startIcon={<EventIcon />} sx={{ height: 40 }}>
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
                                <StyledTableCell>Área</StyledTableCell>
                                <StyledTableCell align='center'>Total Cartuchos Recargados</StyledTableCell>
                                <StyledTableCell align='center'>Total Insumo Consumido</StyledTableCell>
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
