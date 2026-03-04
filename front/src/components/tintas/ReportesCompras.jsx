import React, { useState, useEffect } from 'react';
import { URI } from '../../config';
import axios from 'axios';
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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { styled } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Divider } from '@mui/material';

import ReporteComprasPdf from '../../pdf/ReporteComprasPdf';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#4F4F4F',
        color: theme.palette.common.white,
        fontSize: 18,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        borderRight: '1px solid #E0E0E0',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
}));

function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => { onPageChange(event, 0); };
    const handleBackButtonClick = (event) => { onPageChange(event, page - 1); };
    const handleNextButtonClick = (event) => { onPageChange(event, page + 1); };
    const handleLastPageButtonClick = (event) => { onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1)); };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page"><FirstPageIcon /></IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page"><KeyboardArrowLeft /></IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page"><KeyboardArrowRight /></IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page"><LastPageIcon /></IconButton>
        </Box>
    );
}


export const ReportesCompras = () => {
    const [reporteData, setReporteData] = useState([]);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setPage(0);
    }, [reporteData.length]);

    const handleChangePage = (event, newPage) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleGenerateReport = async () => {
        if (!fechaDesde || !fechaHasta) {
            setError("Por favor, seleccione ambas fechas para generar el reporte.");
            return;
        }

        try {
            const hastaDate = new Date(fechaHasta);
            hastaDate.setHours(23, 59, 59, 999);
            const desdeDate = new Date(fechaDesde);
            desdeDate.setHours(0, 0, 0, 0);

            const res = await axios.get(`${URI}/reportes/compras`, {
                params: {
                    desde: desdeDate.toISOString(),
                    hasta: hastaDate.toISOString()
                }
            });

            setReporteData(res.data);
            setError('');
        } catch (err) {
            console.error("Error al generar el reporte de compras:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al generar el reporte.");
            setReporteData([]);
        }
    };

    const generatePdf = () => {
        if (reporteData.length === 0) {
            setError("No hay datos para generar el PDF. Genere un reporte primero.");
            return;
        }
        ReporteComprasPdf(reporteData, fechaDesde, fechaHasta);
        setError('');
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                Reporte de Compras
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Seleccionar Rango de Fechas</Typography>
                <TextField
                    label="Fecha Desde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mr: 2, mb: 2 }}
                />
                <TextField
                    label="Fecha Hasta"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mr: 2, mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={handleGenerateReport}
                    startIcon={<EventIcon />}
                    sx={{ mt: 1, mb: 2, mr: 2 }}
                >
                    Generar Reporte
                </Button>
                <Button
                    variant="contained"
                    onClick={generatePdf}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ mt: 1, mb: 2 }}
                    disabled={reporteData.length === 0}
                >
                    Generar PDF
                </Button>
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
                )}
            </Paper>

            <Divider sx={{ mb: 4 }} />

            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Resultados del Reporte
            </Typography>
            <Paper>
                <TableContainer>
                    <Table aria-label="reporte compras table">
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
                                    <StyledTableRow key={index}>
                                        <StyledTableCell>{new Date(row.fecha).toLocaleDateString()}</StyledTableCell>
                                        <StyledTableCell>{row.producto}</StyledTableCell>
                                        <StyledTableCell>{row.tipo}</StyledTableCell>
                                        <StyledTableCell align='center'>{row.cantidad}</StyledTableCell>
                                        <StyledTableCell>{row.unidad}</StyledTableCell>
                                        <StyledTableCell>{row.usuario}</StyledTableCell>
                                    </StyledTableRow>
                                ))
                                :
                                <StyledTableRow>
                                    <StyledTableCell colSpan={6} align='center'>
                                        No hay datos para el rango de fechas seleccionado.
                                    </StyledTableCell>
                                </StyledTableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={reporteData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>
        </Container>
    );
};
