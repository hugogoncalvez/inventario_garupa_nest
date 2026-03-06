import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';


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
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import ReporteRecargasGranelPdf from '../../pdf/ReporteRecargasGranelPdf'; // Se creará luego


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

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                <FirstPageIcon />
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                <LastPageIcon />
            </IconButton>
        </Box>
    );
}

function Row(props) {
    const { row } = props;
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <StyledTableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {row.area}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {row.totalCartuchos.toLocaleString()}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {row.totalInsumo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </StyledTableCell>
            </StyledTableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, marginLeft: 10 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalle de Recargas por Impresora
                            </Typography>
                            <Table size="small" aria-label="detalle-recargas">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Impresora</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cartucho</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Insumo Granel</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nº Cartuchos</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cant. Insumo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((itemRow, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(itemRow.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell component="th" scope="row">
                                                {`${itemRow.impresoraModelo} (${itemRow.impresoraMarca})`}
                                            </TableCell>
                                            <TableCell>{`${itemRow.cartuchoModelo} (${itemRow.cartuchoColor})`}</TableCell>
                                            <TableCell>{`${itemRow.insumoGranelNombre} (${itemRow.unidadMedida})`}</TableCell>
                                            <TableCell align="center">{itemRow.cartuchos}</TableCell>
                                            <TableCell align="center">{itemRow.insumo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell>{`${itemRow.usuarioNombre} ${itemRow.usuarioApellido}`}</TableCell>
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

    useEffect(() => {
        setPage(0);
    }, [reporteData.length]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

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
            const [hastaYear, hastaMonth, hastaDay] = fechaHasta.split('-').map(Number);
            const hastaDate = new Date(hastaYear, hastaMonth - 1, hastaDay);
            hastaDate.setHours(23, 59, 59, 999);

            const [desdeYear, desdeMonth, desdeDay] = fechaDesde.split('-').map(Number);
            const desdeDate = new Date(desdeYear, desdeMonth - 1, desdeDay);
            desdeDate.setHours(0, 0, 0, 0);

            const res = await api.get(`${URI}/reportes/recargas-granel`, {
                params: {
                    desde: desdeDate.toISOString(),
                    hasta: hastaDate.toISOString()
                }
            });

            // Procesar los datos para agrupar por área
            const groupedByArea = res.data.reduce((acc, item) => {
                const areaName = item['impresora.area.area'];
                if (!acc[areaName]) {
                    acc[areaName] = {
                        area: areaName,
                        items: [],
                        totalCartuchos: 0,
                        totalInsumo: 0,
                        unidadMedida: item['insumo_granel.unidad_medida']
                    };
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

            const processedData = Object.values(groupedByArea);
            setReporteData(processedData);
            setError('');
        } catch (err) {
            console.error("Error al generar el reporte de recargas:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al generar el reporte de recargas.");
            setReporteData([]);
        }
    };

    const generatePdf = () => {
        if (reporteData.length === 0) {
            setError("No hay datos para generar el PDF. Genere un reporte primero.");
            return;
        }
        ReporteRecargasGranelPdf(reporteData, fechaDesde, fechaHasta);
        setError('');
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                Reporte de Recargas de Insumos a Granel por Área
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
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            <Divider sx={{ mb: 4 }} />

            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Resultados del Reporte
            </Typography>
            <Paper>
                <TableContainer>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell />
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
                                    <StyledTableCell colSpan={4} align='center'>
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