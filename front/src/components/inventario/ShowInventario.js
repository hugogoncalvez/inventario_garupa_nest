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
import Box from '@mui/material/Box'; // Importar Box
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
import ConfirmDialog from '../dialogs/ShowConfirm'
import ShowMsg from '../dialogs/ShowMsg'
import TablePagination from '@mui/material/TablePagination';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import { Divider, FormControl } from '@mui/material';
import { FormGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ActaEntrega from '../../pdf/ActaEntrega';
import Auditoria from '../../pdf/Auditoria';
import ActaDevolucion from '../../pdf/ActaDevolucion';
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

// Componente personalizado para las acciones de paginación
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


const ShowInventario = () => {

    // --- Dialog State ---
    const [open, setOpen] = useState(false)
    const [id, setId] = useState('')

    // --- Data State ---
    const [inventario, setInventario] = useState([]);
    const [componentes, setComponentes] = useState([])
    const [estados, setEstados] = useState([])
    const [areas, setAreas] = useState([])

    // --- Filter State ---
    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('');
    const [area, setArea] = useState('');
    const [numInv, setNumInv] = useState('');
    const [numPc, setNumPc] = useState('');
    const [usuario, setUsuario] = useState('');

    // --- UI State ---
    const [noSelected, setNoSelected] = useState(false)
    const [noSelected2, setNoSelected2] = useState(false)

    // --- Pagination State ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- Selection State ---
    const [selected, setSelected] = useState([])
    const [marcados, setMarcados] = useState([]) // From old code
    const navigate = useNavigate();

    // --- Data Fetching ---
    useEffect(() => {
        getInventario()
        getComponentes();
        getEstado()
        getAreas()
    }, [])

    const getInventario = async () => {
        const res = await api.get(`${URI}/inventario/`);
        setInventario(res.data);

        let initialMarcados = []; // Initialize marcados
        for (let i = 0; i < res.data.length; i++) {
            initialMarcados.push(false);
        }
        setMarcados(initialMarcados);
    };
    const getComponentes = async () => {
        const res = await api.get(`${URI}/tipos`);
        setComponentes(res.data);
    }
    const getEstado = async () => {
        const res = await api.get(`${URI}/estado`);
        setEstados(res.data);
    }
    const getAreas = async () => {
        const res = await api.get(`${URI}/areas`);
        setAreas(res.data);
    }

    // --- Filtering Logic ---
    const filteredInventario = useMemo(() => {
        let filtered = inventario;

        if (tipo) {
            filtered = filtered.filter(inv => inv.tipo.includes(tipo));
        }
        if (estado) {
            filtered = filtered.filter(inv => inv.estado.includes(estado));
        }
        if (area) {
            filtered = filtered.filter(inv => inv.area.includes(area));
        }
        if (numInv) {
            filtered = filtered.filter(inv => inv.num_inventario.toLowerCase().includes(numInv.toLowerCase()));
        }
        if (numPc) {
            filtered = filtered.filter(inv => inv.num_pc.toLowerCase().includes(numPc.toLowerCase()));
        }
        if (usuario) {
            filtered = filtered.filter(inv => inv.usuario && inv.usuario.toLowerCase().includes(usuario.toLowerCase()));
        }

        return filtered;
    }, [inventario, tipo, estado, area, numInv, numPc, usuario]);

    useEffect(() => {
        setPage(0);
        // Reset marcados if inventory or filtered inventory changes significantly
        // This is important to ensure 'marcados' matches the currently displayed data
        let currentDataLength = filteredInventario.length > 0 ? filteredInventario.length : inventario.length;
        if (marcados.length !== currentDataLength) {
            let newMarcados = [];
            for (let i = 0; i < currentDataLength; i++) {
                newMarcados.push(false);
            }
            setMarcados(newMarcados);
            setSelected([]);
        }
    }, [filteredInventario.length, inventario.length, marcados.length]);


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
        setId(id)
    };

    const handleClose = (value) => {
        setOpen(false);
        if (value) {
            deleteInv();
        }
    };

    const deleteInv = async () => {
        await api.delete(`${URI}/inventario/${id}`)
        getInventario();
    }

    // --- Selection Handlers (Restored from old code) ---
    const checksSelected = (event, row, i) => {
        const selectedId = event.target.name;
        const isChecked = event.target.checked; // Use event.target.checked directly

        const newMarcados = [...marcados];
        newMarcados[i] = isChecked;
        setMarcados(newMarcados);

        if (isChecked) {
            setSelected(prev => ([...prev, row]));
        } else {
            setSelected(prev => prev.filter(item => item.id.toString() !== selectedId));
        }
    }

    const checksTodos = () => {
        const currentData = filteredInventario; // Use filteredInventario directly
        const allChecked = marcados.every(checked => checked);

        let newMarcados = currentData.map(() => !allChecked); // Toggle all
        let newSelected = [];

        if (!allChecked) { // If checking all
            newSelected = currentData;
        } else { // If unchecking all
            // newSelected and newCheckeds remain empty for unchecking
        }

        setMarcados(newMarcados);
        setSelected(newSelected);
    }



    const clearFilters = () => {
        setTipo('');
        setEstado('');
        setArea('');
        setNumInv('');
        setNumPc('');
        setUsuario('');
        // Re-initialize marcados for the full inventory after clearing filters
        let initialMarcados = [];
        for (let i = 0; i < inventario.length; i++) {
            initialMarcados.push(false);
        }
        setMarcados(initialMarcados);
        setSelected([]); // Also clear selected items when clearing filters
    };

    // --- Browser History Blocker ---
    useEffect(() => {
        const blockBack = (e) => {
            window.history.go(1);
        };
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', blockBack);
        return () => {
            window.removeEventListener('popstate', blockBack);
        };
    }, []);


    return (
        <>
            {noSelected && <ShowMsg msg='Debe Seleccionar un item del inventario' ruta='#' error={true} titulo='Acta de Entrega' color='red' />}
            {noSelected2 && <ShowMsg msg='Debe Seleccionar un número de PC' ruta='#' error={true} titulo='Auditoría' color='red' />}
            <Typography component="h1" variant="h5" sx={{ mt: 9 }}>
                Inventario Informática
            </Typography>
            <ConfirmDialog
                open={open}
                onClose={handleClose}
            />
            <Button
                variant="contained"
                sx={{ m: 5 }}
                size="large"
                onClick={() => navigate('/inventario/create')}
                startIcon={<AddCircleOutlineIcon />}
            >
                Agregar Item
            </Button>
            <Divider />
            <Divider />
            <Typography component="h1" variant="h5" sx={{ mt: 4, mb: 2 }}>
                Aplicar filtros de busqueda
            </Typography>
            <Container >
                <TextField
                    select
                    label="Componentes"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    helperText="Filtrar por componente"
                    sx={{ m: 3 }}
                >
                    {(componentes || []).map((e) => (
                        <MenuItem key={e.id} value={e.tipo}>{e.tipo}</MenuItem>
                    ))}
                </TextField>
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
                    select
                    label="Area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    helperText="filtrar por area"
                    sx={{ m: 3 }}
                >
                    {(areas || []).map((e) => (
                        <MenuItem key={e.id} value={e.area}>{e.area}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    name="Filtro_NumInv"
                    label="Filtrar por Nº Inventario"
                    value={numInv}
                    onChange={(e) => setNumInv(e.target.value)}
                    helperText='Ingrese Nº inventario'
                    sx={{ m: 3 }}
                />
                <TextField
                    name="Filtro_NumPC"
                    label="Filtrar por Nº de PC"
                    value={numPc}
                    onChange={(e) => setNumPc(e.target.value)}
                    helperText='Ingrese Nº PC'
                    sx={{ m: 3 }}
                />
                <TextField
                    name="Filtro_Usuario"
                    label="Filtrar por Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    helperText='Ingrese Usuario'
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
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='right'>
                                    <FormControl component="fieldset">
                                        <FormGroup>
                                            <FormControlLabel control={
                                                <Checkbox
                                                    sx={{ color: 'white' }}
                                                    indeterminate={marcados.includes(true) && marcados.includes(false)}
                                                    checked={(marcados.length > 0) && marcados.every(Boolean)}
                                                    onChange={checksTodos}
                                                />
                                            }></FormControlLabel>
                                        </FormGroup>
                                    </FormControl>
                                </StyledTableCell>
                                <StyledTableCell align='center'>Nº Inventario</StyledTableCell>
                                <StyledTableCell align='center'>PC</StyledTableCell>
                                <StyledTableCell align='center'>Tipo</StyledTableCell>
                                <StyledTableCell align='center'>Descripción</StyledTableCell>
                                <StyledTableCell align='center'>Marca</StyledTableCell>
                                <StyledTableCell align='center'>Nº Serie</StyledTableCell>
                                <StyledTableCell align='center'>Observaciones</StyledTableCell>
                                <StyledTableCell align='center'>Area</StyledTableCell>
                                <StyledTableCell align='center'>Usuario</StyledTableCell>
                                <StyledTableCell align='center'>Estado</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInventario.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell align='right'>
                                        <FormControl component="fieldset">
                                            <FormGroup>
                                                <FormControlLabel control={
                                                    <Checkbox
                                                        checked={marcados[i] || false}
                                                        onChange={(e) => checksSelected(e, row, i)}
                                                        name={row.id.toString()}
                                                    />
                                                }></FormControlLabel>
                                            </FormGroup>
                                        </FormControl>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{row.num_inventario}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.num_pc}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.tipo}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.descripcion}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.marca}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.num_serie}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.observaciones}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.area}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.usuario}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.estado}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar">
                                            <IconButton aria-label="edit" onClick={() => navigate(`/edit/${row.id}`)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton aria-label="delete" onClick={() => handleClickOpen(row.id)}>
                                                <DeleteForeverIcon />
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
                    count={filteredInventario.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>
            <Divider />
            <Button
                variant="contained"
                sx={{
                    m: 6, backgroundColor: '#9b2226',
                    '&:hover': {
                        backgroundColor: '#ae2012',
                    },
                }}
                disabled={selected.length === 0}
                size="large"
                onClick={(selected.length > 0) ? () => ActaEntrega(selected) : () => setNoSelected(true)}
                startIcon={<PictureAsPdfIcon />}
            >
                Acta Entrega
            </Button>
            <Button
                variant="contained"
                sx={{
                    m: 6, backgroundColor: '#9b2226',
                    '&:hover': {
                        backgroundColor: '#ae2012',
                    },
                }}
                disabled={selected.length === 0}
                size="large"
                onClick={(selected.length > 0) ? () => ActaDevolucion(selected) : () => setNoSelected(true)}
                startIcon={<PictureAsPdfIcon />}
            >
                Acta Devolución
            </Button>
            <Button
                variant="contained"
                sx={{
                    m: 6, backgroundColor: '#9b2226',
                    '&:hover': {
                        backgroundColor: '#ae2012',
                    },
                }}
                disabled={filteredInventario.length === 0}
                size="large"
                onClick={(filteredInventario.length > 0) ? () => Auditoria(filteredInventario) : () => setNoSelected2(true)}
                startIcon={<PictureAsPdfIcon />}
            >
                Auditoria
            </Button>
        </>
    );
}


export default ShowInventario;