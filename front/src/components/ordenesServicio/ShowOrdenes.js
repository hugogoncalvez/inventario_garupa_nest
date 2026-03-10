import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ConfirmDialog from '../dialogs/ShowConfirm';
import TablePagination from '@mui/material/TablePagination';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Divider, Grid, Card, CardContent, Stack, Tooltip } from '@mui/material';
import ComprobanteServicio from '../../pdf/ComprobanteServicio';

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

function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;
    const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
    const handleBackButtonClick = (event) => onPageChange(event, page - 1);
    const handleNextButtonClick = (event) => onPageChange(event, page + 1);
    const handleLastPageButtonClick = (event) => onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}><FirstPageIcon /></IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0}><KeyboardArrowLeft /></IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}><KeyboardArrowRight /></IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}><LastPageIcon /></IconButton>
        </Box>
    );
}

const ShowOrdenes = () => {
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [ordenes, setOrdenes] = useState([]);
    const [estados, setEstados] = useState([])

    const [numOrden, setNumOrden] = useState('');
    const [equipoId, setEquipoId] = useState('');
    const [tecnico, setTecnico] = useState('');
    const [estado, setEstado] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resOrd, resEst] = await Promise.all([
                    api.get(`${URI}/ordenes`),
                    api.get(`${URI}/estado`)
                ]);
                setOrdenes(Array.isArray(resOrd.data) ? resOrd.data : []);
                setEstados(resEst.data);
            } catch (error) {
                console.error("Error cargando datos de órdenes:", error);
            }
        };
        loadData();
    }, []);

    const getOrdenes = async () => {
        const res = await api.get(`${URI}/ordenes`);
        if (Array.isArray(res.data)) {
            setOrdenes(res.data);
        } else {
            setOrdenes([]);
        }
    };

    const filteredOrdenes = useMemo(() => {
        return ordenes.filter(o => 
            (numOrden === '' || o.id.toString().includes(numOrden)) &&
            (equipoId === '' || (o.id_equipo && o.id_equipo.toString().includes(equipoId))) &&
            (tecnico === '' || (o.tecnico_asignado && o.tecnico_asignado.toLowerCase().includes(tecnico.toLowerCase()))) &&
            (estado === '' || o.estado.includes(estado)) &&
            (fechaDesde === '' || new Date(o.fecha_recepcion) >= new Date(fechaDesde)) &&
            (fechaHasta === '' || new Date(o.fecha_recepcion) <= new Date(fechaHasta + 'T23:59:59'))
        );
    }, [ordenes, numOrden, equipoId, tecnico, estado, fechaDesde, fechaHasta]);

    useEffect(() => {
        setPage(0);
    }, [filteredOrdenes.length]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClickOpen = (id) => { setOpen(true); setId(id); };
    const handleClose = (value) => {
        setOpen(false);
        if (value) deleteOrden();
    };

    const deleteOrden = async () => {
        await api.delete(`${URI}/ordenes/${id}`);
        getOrdenes();
    };

    const clearFilters = () => {
        setNumOrden(''); setEquipoId(''); setTecnico(''); setEstado(''); setFechaDesde(''); setFechaHasta('');
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Órdenes de Servicio
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/ordenes/create')}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ px: 4 }}
                >
                    Nueva Orden
                </Button>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            {/* Panel de Filtros */}
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <FilterAltIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="600">Filtros de Búsqueda</Typography>
                    </Box>
                    <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={6} md={1.5}>
                            <TextField label="Nº Orden" value={numOrden} onChange={(e) => setNumOrden(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                            <TextField label="ID Equipo" value={equipoId} onChange={(e) => setEquipoId(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField label="Técnico" value={tecnico} onChange={(e) => setTecnico(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                            <TextField select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} fullWidth size="small">
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {estados.map((e) => <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField label="Desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField label="Hasta" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} md={1.5} display="flex" justifyContent="flex-end">
                            <Button variant="text" color="secondary" startIcon={<ClearAllIcon />} onClick={clearFilters} size="small" fullWidth sx={{ height: 40 }}>
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Nº Orden</StyledTableCell>
                                <StyledTableCell align='center'>Equipo ID</StyledTableCell>
                                <StyledTableCell>Problema Reportado</StyledTableCell>
                                <StyledTableCell>Técnico</StyledTableCell>
                                <StyledTableCell align='center'>Estado</StyledTableCell>
                                <StyledTableCell align='center'>Recepción</StyledTableCell>
                                <StyledTableCell align='center'>Entrega</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrdenes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orden) => (
                                <StyledTableRow key={orden.id} hover>
                                    <StyledTableCell align='center' sx={{ fontWeight: 600 }}>{orden.id}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.id_equipo}</StyledTableCell>
                                    <StyledTableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {orden.problema_reportado}
                                    </StyledTableCell>
                                    <StyledTableCell>{orden.tecnico_asignado}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Box sx={{ 
                                            bgcolor: orden.estado === 'Entregado' ? 'success.light' : (orden.estado === 'En Reparación' ? 'warning.light' : 'info.light'),
                                            color: 'white', px: 1, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700
                                        }}>
                                            {orden.estado}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{new Date(orden.fecha_recepcion).toLocaleDateString()}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString() : '---'}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => navigate(`/ordenes/edit/${orden.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleClickOpen(orden.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Ver Comprobante"><IconButton size="small" color="info" onClick={() => ComprobanteServicio(orden)}><PictureAsPdfIcon fontSize="small" /></IconButton></Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredOrdenes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                />
            </Paper>
        </Container>
    );
}

export default ShowOrdenes;
