import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
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
import SendIcon from '@mui/icons-material/Send';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RecyclingIcon from '@mui/icons-material/Recycling';
import TablePagination from '@mui/material/TablePagination';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import InventoryIcon from '@mui/icons-material/Inventory';
import Swal from 'sweetalert2';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Container, Card, CardContent, Stack, Chip } from '@mui/material';

import ModalRegistrarEntrega from './ModalRegistrarEntrega';
import ModalRegistrarCompra from './ModalRegistrarCompra';
import ModalRegistrarRecarga from './ModalRegistrarRecarga';
import useAuth from '../../hooks/useAuth';
import ReporteInventarioInsumos from '../../pdf/ReporteInventarioInsumos';

// Estilos de la tabla
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

const GestionCartuchos = () => {
    const [cartuchos, setCartuchos] = useState([]);
    const [filteredCartuchos, setFilteredCartuchos] = useState([]);
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [openEntregaModal, setOpenEntregaModal] = useState(false);
    const [openCompraModal, setOpenCompraModal] = useState(false);
    const [openRecargaModal, setOpenRecargaModal] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [filtroModelo, setFiltroModelo] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroRecargable, setFiltroRecargable] = useState('Todos');
    const [filtroStock, setFiltroStock] = useState('Todos');

    useEffect(() => {
        getCartuchos();
    }, []);

    useEffect(() => {
        let items = [...cartuchos];
        if (filtroModelo) {
            items = items.filter(c => c.modelo.toLowerCase().includes(filtroModelo.toLowerCase()));
        }
        if (filtroTipo !== 'Todos') {
            items = items.filter(c => c.tipo === filtroTipo);
        }
        if (filtroRecargable !== 'Todos') {
            const esRecargable = filtroRecargable === 'Sí';
            items = items.filter(c => c.es_recargable === esRecargable);
        }
        if (filtroStock !== 'Todos') {
            items = items.filter(c => {
                const stock = c.stock_unidades;
                const min = c.stock_minimo_unidades;
                const umbralMedio = min === 0 ? 5 : min * 2;
                
                if (filtroStock === 'Bajo') return stock <= min;
                if (filtroStock === 'Medio') return stock > min && stock <= umbralMedio;
                if (filtroStock === 'Alto') return stock > umbralMedio;
                return true;
            });
        }
        setFilteredCartuchos(items);
    }, [cartuchos, filtroModelo, filtroTipo, filtroRecargable, filtroStock]);

    const getCartuchos = async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos`, { params: { includeInsumoGranel: 'true' } });
            setCartuchos(res.data);
        } catch (error) {
            console.error("Error al obtener los cartuchos:", error);
        }
    };

    const deleteCartucho = async (id) => {
        try {
            await api.delete(`${URI}/tintas/cartuchos/${id}`, { data: { usuario_id: auth.id } });
            getCartuchos();
        } catch (error) {
            console.error("Error al eliminar el cartucho:", error);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, ¡bórralo!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCartucho(id);
                Swal.fire('¡Eliminado!', 'El insumo ha sido eliminado.', 'success');
            }
        });
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFiltroModelo('');
        setFiltroTipo('Todos');
        setFiltroRecargable('Todos');
        setFiltroStock('Todos');
    };

    const handleAdjustStockUnidades = async (cartucho) => {
        const { value: nuevaCantidad } = await Swal.fire({
            title: `Ajustar stock de ${cartucho.modelo} (${cartucho.color})`,
            input: 'number',
            inputValue: cartucho.stock_unidades,
            showCancelButton: true,
            confirmButtonText: 'Ajustar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value || parseInt(value) < 0 || isNaN(parseInt(value))) {
                    return 'Ingrese una cantidad numérica válida y positiva';
                }
            }
        });

        if (nuevaCantidad !== undefined && nuevaCantidad !== null) {
            try {
                await api.post(`${URI}/tintas/movimientos/ajuste`, {
                    cartucho_id: cartucho.id,
                    nueva_cantidad: parseInt(nuevaCantidad),
                    usuario_id: auth.id
                });
                Swal.fire('¡Ajustado!', 'El stock se ha ajustado correctamente.', 'success');
                getCartuchos();
            } catch (err) {
                console.error("Error al ajustar stock de unidades:", err.response ? err.response.data : err);
                Swal.fire('Error', err.response?.data?.message || 'Hubo un error al ajustar el stock.', 'error');
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Gestión de Insumos
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Button variant="contained" size="small" onClick={() => navigate('/tintas/cartuchos/create')} startIcon={<AddCircleOutlineIcon />}>Nuevo Insumo</Button>
                    <Button variant="contained" size="small" color="success" onClick={() => setOpenCompraModal(true)} startIcon={<ShoppingCartIcon />}>Compra</Button>
                    <Button variant="contained" size="small" color="info" onClick={() => setOpenEntregaModal(true)} startIcon={<SendIcon />}>Entrega</Button>
                    <Button variant="contained" size="small" color="warning" onClick={() => setOpenRecargaModal(true)} startIcon={<RecyclingIcon />}>Recarga</Button>
                    <Button variant="contained" size="small" color="error" onClick={() => ReporteInventarioInsumos(filteredCartuchos)} startIcon={<PictureAsPdfIcon />}>Reporte PDF</Button>
                </Stack>
            </Box>

            {/* Panel de Filtros */}
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <FilterAltIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="600">Filtros de Búsqueda</Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField label="Buscar por Modelo" variant="outlined" size="small" value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select value={filtroTipo} label="Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Tinta">Tinta</MenuItem>
                                    <MenuItem value="Toner">Toner</MenuItem>
                                    <MenuItem value="Drum">Drum</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Recargable</InputLabel>
                                <Select value={filtroRecargable} label="Recargable" onChange={(e) => setFiltroRecargable(e.target.value)}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Sí">Sí</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Estado Stock</InputLabel>
                                <Select value={filtroStock} label="Estado Stock" onChange={(e) => setFiltroStock(e.target.value)}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Bajo">Bajo (Crítico)</MenuItem>
                                    <MenuItem value="Medio">Medio (Alerta)</MenuItem>
                                    <MenuItem value="Alto">Alto (Óptimo)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
                            <Button variant="text" color="secondary" startIcon={<ClearAllIcon />} onClick={handleClearFilters} size="small" fullWidth sx={{ height: 40 }}>
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <ModalRegistrarEntrega open={openEntregaModal} onClose={() => setOpenEntregaModal(false)} onEntregaExitosa={getCartuchos} />
            <ModalRegistrarCompra open={openCompraModal} onClose={() => setOpenCompraModal(false)} onCompraExitosa={getCartuchos} />
            <ModalRegistrarRecarga open={openRecargaModal} onClose={() => setOpenRecargaModal(false)} onRecargaExitosa={getCartuchos} />

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Modelo</StyledTableCell>
                                <StyledTableCell align='center'>SKU</StyledTableCell>
                                <StyledTableCell align='center'>Color</StyledTableCell>
                                <StyledTableCell align='center'>Tipo</StyledTableCell>
                                <StyledTableCell align='center'>Recargable</StyledTableCell>
                                <StyledTableCell align='center'>Stock</StyledTableCell>
                                <StyledTableCell align='center'>Mínimo</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCartuchos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cartucho) => (
                                <StyledTableRow key={cartucho.id} hover>
                                    <StyledTableCell sx={{ fontWeight: 600 }}>{cartucho.modelo}</StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.sku || '---'}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                            <Box sx={{ 
                                                width: 14, 
                                                height: 14, 
                                                borderRadius: '50%', 
                                                background: (() => {
                                                    const color = cartucho.color?.toLowerCase() || '';
                                                    if (color.includes('tricolor')) return 'conic-gradient(#00ffff, #ff00ff, #ffff00)';
                                                    if (color.includes('negro') || color.includes('black')) return 'black';
                                                    if (color.includes('cian') || color.includes('cyan')) return '#00ffff';
                                                    if (color.includes('magenta')) return '#ff00ff';
                                                    if (color.includes('amarillo') || color.includes('yellow')) return '#ffff00';
                                                    return '#bdbdbd'; // Gris para otros
                                                })(), 
                                                border: '1px solid #ddd' 
                                            }} />
                                            {cartucho.color}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.tipo}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Chip label={cartucho.es_recargable ? 'Sí' : 'No'} size="small" color={cartucho.es_recargable ? 'primary' : 'default'} variant="outlined" />
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Box sx={{ 
                                            bgcolor: (() => {
                                                const stock = cartucho.stock_unidades;
                                                const min = cartucho.stock_minimo_unidades;
                                                const umbralMedio = min === 0 ? 5 : min * 2;
                                                
                                                if (stock <= min) return 'error.main'; // Rojo para bajo stock (crítico)
                                                if (stock <= umbralMedio) return 'warning.main'; // Amarillo/Naranja para medio
                                                return 'success.light'; // Verde para alto
                                            })(),
                                            color: 'white', 
                                            px: 1.5, 
                                            py: 0.5,
                                            borderRadius: 1, 
                                            fontSize: '0.9rem', 
                                            fontWeight: 700,
                                            display: 'inline-block', 
                                            minWidth: 35
                                        }}>
                                            {cartucho.stock_unidades}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.stock_minimo_unidades}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => navigate(`/tintas/cartuchos/edit/${cartucho.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleDelete(cartucho.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Ajustar Stock"><IconButton size="small" color="info" onClick={() => handleAdjustStockUnidades(cartucho)}><InventoryIcon fontSize="small" /></IconButton></Tooltip>
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
                    count={filteredCartuchos.length}
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

export default GestionCartuchos;
