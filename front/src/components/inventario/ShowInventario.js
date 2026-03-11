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
import ConfirmDialog from '../dialogs/ShowConfirm'
import ShowMsg from '../dialogs/ShowMsg'
import TablePagination from '@mui/material/TablePagination';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import { Divider, FormControl, Grid, Card, CardContent, Stack } from '@mui/material';
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

const ShowInventario = () => {
    const [open, setOpen] = useState(false)
    const [id, setId] = useState('')
    const [inventario, setInventario] = useState([]);
    const [componentes, setComponentes] = useState([])
    const [estados, setEstados] = useState([])
    const [areas, setAreas] = useState([])

    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('');
    const [area, setArea] = useState('');
    const [numInv, setNumInv] = useState('');
    const [numPc, setNumPc] = useState('');
    const [usuario, setUsuario] = useState('');

    const [noSelected, setNoSelected] = useState(false)
    const [noSelected2, setNoSelected2] = useState(false)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([])
    const [marcados, setMarcados] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                // Carga paralela para mayor velocidad en TiDB Cloud
                const [resInv, resComp, resEst, resAreas] = await Promise.all([
                    api.get(`${URI}/inventario/`),
                    api.get(`${URI}/tipos`),
                    api.get(`${URI}/estado`),
                    api.get(`${URI}/areas`)
                ]);
                
                setInventario(resInv.data);
                setMarcados(new Array(resInv.data.length).fill(false));
                setComponentes(resComp.data);
                setEstados(resEst.data);
                setAreas(resAreas.data);
            } catch (error) {
                console.error("Error cargando datos iniciales:", error);
            }
        };
        loadData();
    }, []);


    const getInventario = async () => {
        const res = await api.get(`${URI}/inventario/`);
        setInventario(res.data);
        setMarcados(new Array(res.data.length).fill(false));
    };

    const filteredInventario = useMemo(() => {
        return inventario.filter(inv => 
            (tipo === '' || inv.tipo.includes(tipo)) &&
            (estado === '' || inv.estado.includes(estado)) &&
            (area === '' || inv.area.includes(area)) &&
            (numInv === '' || inv.num_inventario.toLowerCase().includes(numInv.toLowerCase())) &&
            (numPc === '' || inv.num_pc.toLowerCase().includes(numPc.toLowerCase())) &&
            (usuario === '' || (inv.usuario && inv.usuario.toLowerCase().includes(usuario.toLowerCase())))
        );
    }, [inventario, tipo, estado, area, numInv, numPc, usuario]);

    useEffect(() => {
        setPage(0);
        setMarcados(new Array(filteredInventario.length).fill(false));
        setSelected([]);
    }, [filteredInventario.length]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClickOpen = (id) => { setOpen(true); setId(id) };
    const handleClose = (value) => {
        setOpen(false);
        if (value) deleteInv();
    };

    const deleteInv = async () => {
        await api.delete(`${URI}/inventario/${id}`)
        getInventario();
    }

    const checksSelected = (event, row, i) => {
        const isChecked = event.target.checked;
        const newMarcados = [...marcados];
        newMarcados[i] = isChecked;
        setMarcados(newMarcados);

        if (isChecked) {
            setSelected(prev => [...prev, row]);
        } else {
            setSelected(prev => prev.filter(item => item.id !== row.id));
        }
    }

    const checksTodos = () => {
        const allChecked = marcados.every(Boolean);
        setMarcados(new Array(filteredInventario.length).fill(!allChecked));
        setSelected(!allChecked ? filteredInventario : []);
    }

    const clearFilters = () => {
        setTipo(''); setEstado(''); setArea(''); setNumInv(''); setNumPc(''); setUsuario('');
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            {noSelected && <ShowMsg msg='Debe Seleccionar un item del inventario' ruta='#' error={true} titulo='Acta de Entrega' color='red' />}
            {noSelected2 && <ShowMsg msg='Debe Seleccionar un número de PC' ruta='#' error={true} titulo='Auditoría' color='red' />}
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Inventario Informática
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/inventario/create')}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ px: 4 }}
                >
                    Nuevo Item
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
                    <Grid container spacing={1.5} alignItems="flex-start">
                        <Grid item xs={12} sm={4} md={1.5}>
                            <TextField select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} fullWidth size="small">
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {componentes.map((e) => <MenuItem key={e.id} value={e.tipo}>{e.tipo}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} md={1.5}>
                            <TextField select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} fullWidth size="small">
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {estados.map((e) => <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} md={1.5}>
                            <TextField select label="Área" value={area} onChange={(e) => setArea(e.target.value)} fullWidth size="small">
                                <MenuItem value=""><em>Todas</em></MenuItem>
                                {areas.map((e) => <MenuItem key={e.id} value={e.area}>{e.area}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <TextField label="Nº Inventario" value={numInv} onChange={(e) => setNumInv(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <TextField label="Nº de PC" value={numPc} onChange={(e) => setNumPc(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <TextField label="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} md={1.5} display="flex" alignItems="center">
                            <Button 
                                variant="text" 
                                color="secondary" 
                                startIcon={<ClearAllIcon />} 
                                onClick={clearFilters}
                                fullWidth
                                size="small"
                                sx={{ height: 40 }}
                            >
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
                                <StyledTableCell padding="checkbox">
                                    <Checkbox
                                        sx={{ color: 'white !important' }}
                                        indeterminate={marcados.includes(true) && marcados.includes(false)}
                                        checked={(marcados.length > 0) && marcados.every(Boolean)}
                                        onChange={checksTodos}
                                    />
                                </StyledTableCell>
                                <StyledTableCell align='center'>Inv. Nº</StyledTableCell>
                                <StyledTableCell align='center'>PC</StyledTableCell>
                                <StyledTableCell>Tipo</StyledTableCell>
                                <StyledTableCell>Descripción</StyledTableCell>
                                <StyledTableCell>Marca</StyledTableCell>
                                <StyledTableCell>Nº Serie</StyledTableCell>
                                <StyledTableCell>Área</StyledTableCell>
                                <StyledTableCell>Usuario</StyledTableCell>
                                <StyledTableCell align='center'>Estado</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInventario.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                                <StyledTableRow key={row.id} hover>
                                    <StyledTableCell padding="checkbox">
                                        <Checkbox checked={marcados[i] || false} onChange={(e) => checksSelected(e, row, i)} />
                                    </StyledTableCell>
                                    <StyledTableCell align='center' sx={{ fontWeight: 600 }}>{row.num_inventario}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.num_pc}</StyledTableCell>
                                    <StyledTableCell>{row.tipo}</StyledTableCell>
                                    <StyledTableCell>{row.descripcion}</StyledTableCell>
                                    <StyledTableCell>{row.marca}</StyledTableCell>
                                    <StyledTableCell>{row.num_serie}</StyledTableCell>
                                    <StyledTableCell>{row.area}</StyledTableCell>
                                    <StyledTableCell>{row.usuario}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Box sx={{ 
                                            bgcolor: row.estado === 'Bueno' ? 'success.light' : (row.estado === 'Regular' ? 'warning.light' : 'error.light'),
                                            color: 'white', px: 1, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700
                                        }}>
                                            {row.estado}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => navigate(`/edit/${row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleClickOpen(row.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredInventario.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                />
            </Paper>

            <Box mt={3} display="flex" gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    color="error"
                    disabled={selected.length === 0}
                    onClick={() => ActaEntrega(selected)}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Acta Entrega
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={selected.length === 0}
                    onClick={() => ActaDevolucion(selected)}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Acta Devolución
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={filteredInventario.length === 0}
                    onClick={() => Auditoria(filteredInventario)}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Auditoria
                </Button>
            </Box>
        </Container>
    );
}

export default ShowInventario;
