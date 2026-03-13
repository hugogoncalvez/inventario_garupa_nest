import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip,    TextField, MenuItem, Container, Card, CardContent, 
    Stack, Chip, TablePagination 
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ConfirmDialog from '../dialogs/ShowConfirm';
import ComprobanteServicio from '../../pdf/ComprobanteServicio';

// Estilos de la tabla optimizados para MUI v7
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: 'var(--mui-palette-primary-main)',
        color: 'var(--mui-palette-common-white)',
        fontSize: 14,
        fontWeight: 600,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'var(--mui-palette-action-hover)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const ShowOrdenes = () => {
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [ordenes, setOrdenes] = useState([]);
    const [estados, setEstados] = useState([]);

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
                console.error("Error cargando datos:", error);
            }
        };
        loadData();
    }, []);

    const getOrdenes = async () => {
        const res = await api.get(`${URI}/ordenes`);
        setOrdenes(Array.isArray(res.data) ? res.data : []);
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
        <Container maxWidth="xl" sx={{ mt: 12, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                <Typography variant="h4" fontWeight="800" color="primary">
                    Órdenes de Servicio
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/ordenes/create')}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ borderRadius: 2 }}
                >
                    Nueva Orden
                </Button>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2} gap={1}>
                        <FilterAltIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Filtros de Búsqueda</Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                            <TextField label="Nº Orden" value={numOrden} onChange={(e) => setNumOrden(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                            <TextField label="ID Equipo" value={equipoId} onChange={(e) => setEquipoId(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField label="Técnico" value={tecnico} onChange={(e) => setTecnico(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                            <TextField select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} fullWidth size="small">
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {estados.map((e) => <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField label="Desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField label="Hasta" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 1.5 }} display="flex" justifyContent="flex-end">
                            <Button variant="outlined" color="secondary" startIcon={<ClearAllIcon />} onClick={clearFilters} size="small" fullWidth sx={{ borderRadius: 2 }}>
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--mui-palette-divider)' }}>
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>ID</StyledTableCell>
                                <StyledTableCell align='center'>Equipo</StyledTableCell>
                                <StyledTableCell>Problema Reportado</StyledTableCell>
                                <StyledTableCell>Técnico</StyledTableCell>
                                <StyledTableCell align='center'>Estado</StyledTableCell>
                                <StyledTableCell align='center'>Recepción</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrdenes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orden) => (
                                <StyledTableRow key={orden.id} hover>
                                    <StyledTableCell align='center' sx={{ fontWeight: 700 }}>{orden.id}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.id_equipo}</StyledTableCell>
                                    <StyledTableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {orden.problema_reportado}
                                    </StyledTableCell>
                                    <StyledTableCell>{orden.tecnico_asignado}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Chip 
                                            label={orden.estado} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 700, fontSize: '0.7rem',
                                                bgcolor: orden.estado === 'Entregado' ? 'var(--mui-palette-success-main)' : (orden.estado === 'En Reparación' ? 'var(--mui-palette-warning-main)' : 'var(--mui-palette-info-main)'),
                                                color: '#fff'
                                            }}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{new Date(orden.fecha_recepcion).toLocaleDateString()}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="Editar"><IconButton size="small" color="success" onClick={() => navigate(`/ordenes/edit/${orden.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleClickOpen(orden.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="PDF"><IconButton size="small" color="info" onClick={() => ComprobanteServicio(orden)}><PictureAsPdfIcon fontSize="small" /></IconButton></Tooltip>
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
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Filas"
                />
            </Paper>
        </Container>
    );
}

export default ShowOrdenes;
