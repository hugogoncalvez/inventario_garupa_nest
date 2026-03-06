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
import ClearAllIcon from '@mui/icons-material/ClearAll'; // Importar el nuevo icono
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import ModalRegistrarEntrega from './ModalRegistrarEntrega';
import ModalRegistrarCompra from './ModalRegistrarCompra';
import ModalRegistrarRecarga from './ModalRegistrarRecarga';
import useAuth from '../../hooks/useAuth';
import ReporteInventarioInsumos from '../../pdf/ReporteInventarioInsumos';

// Estilos de la tabla
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

// Acciones de paginación
function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
    const handleBackButtonClick = (event) => onPageChange(event, page - 1);
    const handleNextButtonClick = (event) => onPageChange(event, page + 1);
    const handleLastPageButtonClick = (event) => onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page"><FirstPageIcon /></IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page"><KeyboardArrowLeft /></IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page"><KeyboardArrowRight /></IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page"><LastPageIcon /></IconButton>
        </Box>
    );
}


const GestionCartuchos = () => {
    // Estados principales
    const [cartuchos, setCartuchos] = useState([]);
    const [filteredCartuchos, setFilteredCartuchos] = useState([]);
    const navigate = useNavigate();
    const { auth } = useAuth();

    // Estados para modales
    const [openEntregaModal, setOpenEntregaModal] = useState(false);
    const [openCompraModal, setOpenCompraModal] = useState(false);
    const [openRecargaModal, setOpenRecargaModal] = useState(false);

    // Estados de paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados de los filtros
    const [filtroModelo, setFiltroModelo] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroRecargable, setFiltroRecargable] = useState('Todos');

    // Carga inicial de datos
    useEffect(() => {
        getCartuchos();
    }, []);

    // Aplicar filtros cuando cambian los datos o los filtros
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
        setFilteredCartuchos(items);
    }, [cartuchos, filtroModelo, filtroTipo, filtroRecargable]);

    // Obtener datos de la API
    const getCartuchos = async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos`, { params: { includeInsumoGranel: 'true' } });
            setCartuchos(res.data);
        } catch (error) {
            console.error("Error al obtener los cartuchos:", error);
        }
    };

    // Eliminar un cartucho
    const deleteCartucho = async (id) => {
        try {
            await api.delete(`${URI}/tintas/cartuchos/${id}`, { data: { usuario_id: auth.id } });
            getCartuchos(); // Refrescar lista
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

    // Handlers de paginación
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFiltroModelo('');
        setFiltroTipo('Todos');
        setFiltroRecargable('Todos');
    };

    // Ajustar stock
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
        <>
            <Typography component="h1" variant="h4" sx={{ mt: { xs: 4, md: 9 }, mb: 4, fontWeight: 'bold' }}>
                Gestión de Insumos
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center">
                {/* Columna de Botones */}
                <Grid item xs={12} lg={7}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: { xs: 'center', lg: 'flex-start' }
                    }}>
                        <Button variant="contained" onClick={() => navigate('/tintas/cartuchos/create')} startIcon={<AddCircleOutlineIcon />}>Agregar Insumo</Button>
                        <Button variant="contained" onClick={() => setOpenCompraModal(true)} startIcon={<ShoppingCartIcon />}>Compra</Button>
                        <Button variant="contained" onClick={() => setOpenEntregaModal(true)} startIcon={<SendIcon />}>Entrega</Button>
                        <Button variant="contained" onClick={() => setOpenRecargaModal(true)} startIcon={<RecyclingIcon />}>Recarga</Button>
                        <Button variant="contained" onClick={() => ReporteInventarioInsumos(filteredCartuchos)} color="error" startIcon={<PictureAsPdfIcon />}>PDF</Button>
                    </Box>
                </Grid>

                {/* Columna de Filtros */}
                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', boxShadow: 2 }}>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            size="small"
                            value={filtroModelo}
                            onChange={(e) => setFiltroModelo(e.target.value)}
                            sx={{ flexGrow: 1, minWidth: '120px' }}
                        />
                        <FormControl size="small" sx={{ flexGrow: 1, minWidth: '110px' }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select value={filtroTipo} label="Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="Tinta">Tinta</MenuItem>
                                <MenuItem value="Toner">Toner</MenuItem>
                                <MenuItem value="Drum">Drum</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ flexGrow: 1, minWidth: '110px' }}>
                            <InputLabel>Rec.</InputLabel>
                            <Select value={filtroRecargable} label="Rec." onChange={(e) => setFiltroRecargable(e.target.value)}>
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="Sí">Sí</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title="Limpiar Filtros">
                            <IconButton color="primary" onClick={handleClearFilters} size="small">
                                <ClearAllIcon />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                </Grid>
            </Grid>

            {/* Modales */}
            <ModalRegistrarEntrega open={openEntregaModal} onClose={() => setOpenEntregaModal(false)} onEntregaExitosa={getCartuchos} />
            <ModalRegistrarCompra open={openCompraModal} onClose={() => setOpenCompraModal(false)} onCompraExitosa={getCartuchos} />
            <ModalRegistrarRecarga open={openRecargaModal} onClose={() => setOpenRecargaModal(false)} onRecargaExitosa={getCartuchos} />

            {/* Tabla de Datos */}
            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
                <TableContainer sx={{ maxHeight: 650, overflowX: 'auto' }}>
                    <Table stickyHeader aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Modelo</StyledTableCell>
                                <StyledTableCell align='center'>SKU</StyledTableCell>
                                <StyledTableCell align='center'>Color</StyledTableCell>
                                <StyledTableCell align='center'>Tipo</StyledTableCell>
                                <StyledTableCell align='center'>Recargable</StyledTableCell>
                                <StyledTableCell align='center'>Stock Unidades</StyledTableCell>
                                <StyledTableCell align='center'>Stock Mínimo Unidades</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCartuchos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cartucho) => (
                                <StyledTableRow key={cartucho.id}>
                                    <StyledTableCell align='left'>{cartucho.modelo}</StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.sku}</StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.color}</StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.tipo}</StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.es_recargable ? 'Sí' : 'No'}</StyledTableCell>
                                    <StyledTableCell align='center' sx={{ fontWeight: 'bold', color: cartucho.stock_unidades <= cartucho.stock_minimo_unidades ? 'red' : 'green' }}>
                                        {cartucho.stock_unidades}
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.stock_minimo_unidades}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar"><IconButton aria-label="edit" onClick={() => navigate(`/tintas/cartuchos/edit/${cartucho.id}`)}><EditIcon /></IconButton></Tooltip>
                                        <Tooltip title="Eliminar"><IconButton aria-label="delete" onClick={() => handleDelete(cartucho.id)}><DeleteForeverIcon /></IconButton></Tooltip>
                                        <Tooltip title="Ajustar Stock"><IconButton onClick={() => handleAdjustStockUnidades(cartucho)} aria-label="ajustar stock"><InventoryIcon /></IconButton></Tooltip>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredCartuchos.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>
        </>
    );
};

export default GestionCartuchos;

