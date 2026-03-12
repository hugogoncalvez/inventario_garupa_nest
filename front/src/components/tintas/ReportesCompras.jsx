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
import TablePagination from '@mui/material/TablePagination';
import EventIcon from '@mui/icons-material/Event';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Card, CardContent, Grid, Chip } from '@mui/material';

import ReporteComprasPdf from '../../pdf/ReporteComprasPdf';

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

export const ReportesCompras = () => {
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
            const res = await api.get(`${URI}/reportes/compras`, {
                params: {
                    desde: new Date(fechaDesde).toISOString(),
                    hasta: new Date(fechaHasta + 'T23:59:59').toISOString()
                }
            });
            setReporteData(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || "Error al generar el reporte.");
            setReporteData([]);
        }
    };

    const generatePdf = () => {
        if (reporteData.length === 0) return;
        ReporteComprasPdf(reporteData, fechaDesde, fechaHasta);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Reporte de Compras
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
                                <StyledTableCell>Fecha</StyledTableCell>
                                <StyledTableCell>Producto</StyledTableCell>
                                <StyledTableCell>Tipo</StyledTableCell>
                                <StyledTableCell align='center'>Cantidad</StyledTableCell>
                                <StyledTableCell>Unidad</StyledTableCell>
                                <StyledTableCell>Usuario</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reporteData.length > 0 ?
                                reporteData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <StyledTableRow key={index} hover>
                                        <StyledTableCell sx={{ fontWeight: 600 }}>{new Date(row.fecha).toLocaleDateString()}</StyledTableCell>
                                        <StyledTableCell>{row.producto}</StyledTableCell>
                                        <StyledTableCell>
                                            <Chip label={row.tipo} size="small" variant="outlined" color={row.tipo === 'Insumo' ? 'primary' : 'info'} />
                                        </StyledTableCell>
                                        <StyledTableCell align='center'>
                                            <Box sx={{ bgcolor: 'success.light', color: 'white', px: 1, borderRadius: 1, fontWeight: 700, display: 'inline-block' }}>
                                                {row.cantidad}
                                            </Box>
                                        </StyledTableCell>
                                        <StyledTableCell>{row.unidad}</StyledTableCell>
                                        <StyledTableCell>{row.usuario}</StyledTableCell>
                                    </StyledTableRow>
                                ))
                                :
                                <StyledTableRow>
                                    <StyledTableCell colSpan={6} align='center' sx={{ py: 3, color: 'text.secondary' }}>
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
