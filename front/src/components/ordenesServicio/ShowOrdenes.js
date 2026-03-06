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
import Box from '@mui/material/Box'; // Importar Box para el componente TablePaginationActions
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
import { Divider } from '@mui/material';
import ComprobanteServicio from '../../pdf/ComprobanteServicio';
import Tooltip from '@mui/material/Tooltip';


// estilos de la tabla

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

// Componente personalizado para las acciones de paginación (copiado de ShowInventario.js)
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


const ShowOrdenes = () => {

    // --- Dialog State ---
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');

    // --- Data State ---
    const [ordenes, setOrdenes] = useState([]);
    const [estados, setEstados] = useState([])

    // --- Filter State ---
    const [numOrden, setNumOrden] = useState('');
    const [equipoId, setEquipoId] = useState('');
    const [tecnico, setTecnico] = useState('');
    const [estado, setEstado] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');


    // --- Pagination State ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();

    // --- Data Fetching ---
    useEffect(() => {
        getOrdenes();
        getEstados();
    }, []);

    const getOrdenes = async () => {
        const res = await api.get(`${URI}/ordenes`);
        if (Array.isArray(res.data)) {
            setOrdenes(res.data);
        } else {
            console.error("Error fetching ordenes: response is not an array", res.data);
            setOrdenes([]); // Evita el crash
        }
    };

    const getEstados = async () => {
        const res = await api.get(`${URI}/estado`);
        setEstados(res.data);
    }

    // --- Filtering Logic ---
    const filteredOrdenes = useMemo(() => {
        let filtered = ordenes;

        if (numOrden) {
            filtered = filtered.filter(o => o.id.toString().includes(numOrden));
        }
        if (equipoId) {
            filtered = filtered.filter(o => o.id_equipo.toString().includes(equipoId));
        }
        if (tecnico) {
            filtered = filtered.filter(o => o.tecnico_asignado && o.tecnico_asignado.toLowerCase().includes(tecnico.toLowerCase()));
        }
        if (estado) {
            filtered = filtered.filter(o => o.estado.includes(estado));
        }
        if (fechaDesde) {
            filtered = filtered.filter(o => new Date(o.fecha_recepcion) >= new Date(fechaDesde));
        }
        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999); // Include the whole day
            filtered = filtered.filter(o => new Date(o.fecha_recepcion) <= hasta);
        }


        return filtered;
    }, [ordenes, numOrden, equipoId, tecnico, estado, fechaDesde, fechaHasta]);

    useEffect(() => {
        setPage(0);
    }, [filteredOrdenes.length]);


    // --- Pagination Handlers ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- Dialog Handlers ---
    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const handleClose = (value) => {
        setOpen(false);
        if (value) {
            deleteOrden();
        }
    };

    const deleteOrden = async () => {
        await api.delete(`${URI}/ordenes/${id}`);
        getOrdenes();
    };

    // --- Filter Clearing ---
    const clearFilters = () => {
        setNumOrden('');
        setEquipoId('');
        setTecnico('');
        setEstado('');
        setFechaDesde('');
        setFechaHasta('');
    };

    return (
        <>
            <Typography component="h1" variant="h5" sx={{ mt: 9 }}>
                Órdenes de Servicio
            </Typography>
            <ConfirmDialog
                open={open}
                onClose={handleClose}
            />
            <Button
                variant="contained"
                sx={{ m: 5 }}
                size="large"
                onClick={() => navigate('/ordenes/create')}
                startIcon={<AddCircleOutlineIcon />}
            >
                Agregar Orden
            </Button>
            <Divider />
            <Typography component="h1" variant="h5" sx={{ mt: 4, mb: 2 }}>
                Aplicar filtros de busqueda
            </Typography>
            <Container >
                <TextField
                    name="Filtro_NumOrden"
                    label="Filtrar por Nº Orden"
                    value={numOrden}
                    onChange={(e) => setNumOrden(e.target.value)}
                    helperText='Ingrese Nº Orden'
                    sx={{ m: 3 }}
                />
                <TextField
                    name="Filtro_EquipoId"
                    label="Filtrar por ID Equipo"
                    value={equipoId}
                    onChange={(e) => setEquipoId(e.target.value)}
                    helperText='Ingrese ID Equipo'
                    sx={{ m: 3 }}
                />
                <TextField
                    name="Filtro_Tecnico"
                    label="Filtrar por Técnico"
                    value={tecnico}
                    onChange={(e) => setTecnico(e.target.value)}
                    helperText='Ingrese Técnico'
                    sx={{ m: 3 }}
                />
                <TextField
                    select
                    label="Estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    helperText="Filtrar por estado"
                    sx={{ m: 3 }}
                >
                    {(estados || []).map((e) => (
                        <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    name="Filtro_FechaDesde"
                    label="Fecha Recepción Desde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{ m: 3 }}
                />
                <TextField
                    name="Filtro_FechaHasta"
                    label="Fecha Recepción Hasta"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{ m: 3 }}
                />
                <Button
                    variant="contained"
                    sx={{
                        m: 5, backgroundColor: '#446A46',
                        '&:hover': {
                            backgroundColor: '#2f5731',
                        },
                    }}
                    size="large"
                    onClick={clearFilters}
                    startIcon={<ClearAllIcon />}
                >
                    Limpiar Filtros
                </Button>
            </Container>
            <Divider sx={{ mb: 2 }} />
            <Paper>
                <TableContainer>
                    <Table stickyHeader sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Nº Orden</StyledTableCell>
                                <StyledTableCell align='center'>Equipo ID</StyledTableCell>
                                <StyledTableCell align='center'>Problema Reportado</StyledTableCell>
                                <StyledTableCell align='center'>Técnico</StyledTableCell>
                                <StyledTableCell align='center'>Estado</StyledTableCell>
                                <StyledTableCell align='center'>Fecha Recepción</StyledTableCell>
                                <StyledTableCell align='center'>Fecha Entrega</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrdenes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orden) => (
                                <StyledTableRow key={orden.id}>
                                    <StyledTableCell align='center'>{orden.id}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.id_equipo}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.problema_reportado}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.tecnico_asignado}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.estado}</StyledTableCell>
                                    <StyledTableCell align='center'>{new Date(orden.fecha_recepcion).toLocaleDateString()}</StyledTableCell>
                                    <StyledTableCell align='center'>{orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString() : 'Pendiente'}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar">
                                            <IconButton aria-label="edit" onClick={() => navigate(`/ordenes/edit/${orden.id}`)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton aria-label="delete" onClick={() => handleClickOpen(orden.id)}>
                                                <DeleteForeverIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Generar PDF">
                                            <IconButton aria-label="pdf" onClick={() => ComprobanteServicio(orden)}>
                                                <PictureAsPdfIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredOrdenes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions} // Aquí se integra el componente personalizado
                />
            </Paper>
        </>
    );
}

export default ShowOrdenes;