import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';


import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TablePagination from '@mui/material/TablePagination';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ClearAllIcon from '@mui/icons-material/ClearAll'; // Correct import path
import ConfirmDialog from '../dialogs/ShowConfirm';
import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ModalRegistrarCompraInsumoGranel from './ModalRegistrarCompraInsumoGranel';
import InventoryIcon from '@mui/icons-material/Inventory'; // For stock adjustment
import Swal from 'sweetalert2'; // For input dialogs
import useAuth from '../../hooks/useAuth'; // Import useAuth
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip


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


export const GestionInsumosGranel = () => {
    const { auth } = useAuth(); // Use auth hook

    const [insumosGranel, setInsumosGranel] = useState([]);
    const [id, setId] = useState('');
    const [nombre, setNombre] = useState('');
    const [sku, setSku] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('g'); // Default to grams
    const [stockMinimo, setStockMinimo] = useState(0);
    const [isUpdate, setIsUpdate] = useState(false);
    const [error, setError] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const [openCompraInsumoGranelModal, setOpenCompraInsumoGranelModal] = useState(false);

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        getInsumosGranel();
    }, []);

    const getInsumosGranel = async () => {
        try {
            const res = await api.get(`${URI}/insumos-granel`);
            setInsumosGranel(res.data);
        } catch (err) {
            console.error("Error al obtener insumos a granel:", err);
            setError("Error al cargar insumos a granel.");
        }
    };

    // Pagination Handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!nombre.trim() || !unidadMedida) {
            setError('El nombre y la unidad de medida son obligatorios.');
            return;
        }

        try {
            const data = {
                nombre: nombre.trim(),
                sku: sku.trim(),
                unidad_medida: unidadMedida,
                stock_minimo: parseFloat(stockMinimo)
            };
            if (isUpdate) {
                await api.put(`${URI}/insumos-granel/${id}`, data);
            } else {
                await api.post(`${URI}/insumos-granel`, data);
            }
            clearForm();
            getInsumosGranel();
        } catch (err) {
            console.error("Error al guardar insumo a granel:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al guardar el insumo a granel.");
        }
    };

    const handleEditClick = (insumo) => {
        setId(insumo.id);
        setNombre(insumo.nombre);
        setSku(insumo.sku || '');
        setUnidadMedida(insumo.unidad_medida);
        setStockMinimo(insumo.stock_minimo);
        setIsUpdate(true);
        setError('');
    };

    const handleDeleteClick = (insumoId) => {
        setIdToDelete(insumoId);
        setOpenConfirm(true);
    };

    const handleConfirmClose = async (confirm) => {
        setOpenConfirm(false);
        if (confirm && idToDelete) {
            try {
                await api.delete(`${URI}/insumos-granel/${idToDelete}`, { data: { usuario_id: auth.id } });
                getInsumosGranel();
            } catch (err) {
                console.error("Error al eliminar insumo a granel:", err.response ? err.response.data : err);
                Swal.fire('Error', err.response?.data?.message || "Error al eliminar el insumo a granel.", 'error');
            }
        }
        setIdToDelete('');
    };

    const clearForm = () => {
        setId('');
        setNombre('');
        setSku('');
        setUnidadMedida('g');
        setStockMinimo(0);
        setIsUpdate(false);
        setError('');
    };

    const handleAdjustStock = async (insumo) => {
        const { value: nuevaCantidad } = await Swal.fire({
            title: `Ajustar stock de ${insumo.nombre}`,
            input: 'number',
            inputValue: insumo.stock_actual,
            showCancelButton: true,
            confirmButtonText: 'Ajustar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value || parseFloat(value) < 0) {
                    return 'Ingrese una cantidad válida y positiva';
                }
                if (isNaN(parseFloat(value))) {
                    return 'El valor debe ser numérico';
                }
            }
        });

        if (nuevaCantidad !== undefined && nuevaCantidad !== null) { // Check if user didn't cancel
            try {
                await api.post(`${URI}/insumos-granel/movimientos/ajuste`, {
                    insumo_granel_id: insumo.id,
                    nueva_cantidad: parseFloat(nuevaCantidad),
                    usuario_id: auth.id // Use auth.id
                });
                Swal.fire('¡Ajustado!', 'El stock se ha ajustado correctamente.', 'success');
                getInsumosGranel();
            } catch (err) {
                console.error("Error al ajustar stock:", err.response ? err.response.data : err);
                Swal.fire('Error', err.response?.data?.message || 'Hubo un error al ajustar el stock.', 'error');
            }
        }
    };

    return (
        <Container component="main" maxWidth="md" sx={{ mt: { xs: 4, md: 10 }, mb: 4 }}>
            <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Gestión de Insumos a Granel
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {isUpdate ? 'Editar Insumo a Granel' : 'Crear Nuevo Insumo a Granel'}
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="nombre"
                                required
                                label="Nombre del Insumo"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                helperText="Ej: Polvo de Toner Negro"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="sku"
                                label="SKU"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                helperText="Código de producto (opcional)"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="unidad_medida"
                                required
                                label="Unidad de Medida"
                                value={unidadMedida}
                                onChange={(e) => setUnidadMedida(e.target.value)}
                                helperText="Unidad para stock y movimientos"
                                fullWidth
                            >
                                <MenuItem value="g">Gramos (g)</MenuItem>
                                <MenuItem value="kg">Kilogramos (kg)</MenuItem>
                                <MenuItem value="ml">Mililitros (ml)</MenuItem>
                                <MenuItem value="l">Litros (l)</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="stockMinimo"
                                label="Stock Mínimo"
                                type="number"
                                value={stockMinimo}
                                onChange={(e) => setStockMinimo(e.target.value)}
                                inputProps={{ min: 0, step: 0.001 }}
                                helperText="Nivel mínimo de stock"
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={isUpdate ? <SaveOutlinedIcon /> : <AddCircleOutlineIcon />}
                        >
                            {isUpdate ? 'Actualizar' : 'Guardar'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={clearForm}
                            startIcon={<ClearAllIcon />}
                        >
                            {isUpdate ? 'Cancelar' : 'Limpiar'}
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => setOpenCompraInsumoGranelModal(true)}
                            startIcon={<ShoppingCartIcon />}
                        >
                            Registrar Compra
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Divider sx={{ mb: 4 }} />

            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Listado de Insumos a Granel
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
                <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                    <Table stickyHeader aria-label="insumos granel table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Nombre</StyledTableCell>
                                <StyledTableCell align='center'>SKU</StyledTableCell>
                                <StyledTableCell align='center'>Unidad</StyledTableCell>
                                <StyledTableCell align='center'>Stock Actual</StyledTableCell>
                                <StyledTableCell align='center'>Stock Mínimo</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {insumosGranel.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((insumo) => (
                                <StyledTableRow key={insumo.id}>
                                    <StyledTableCell align='left'>{insumo.nombre}</StyledTableCell>
                                    <StyledTableCell align='center'>{insumo.sku}</StyledTableCell>
                                    <StyledTableCell align='center'>{insumo.unidad_medida}</StyledTableCell>
                                    <StyledTableCell
                                        align='center'
                                        sx={{
                                            fontWeight: 'bold',
                                            color: insumo.stock_actual <= insumo.stock_minimo ? 'red' : 'green'
                                        }}
                                    >
                                        {parseFloat(insumo.stock_actual).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>
                                        {parseFloat(insumo.stock_minimo).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleEditClick(insumo)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton onClick={() => handleDeleteClick(insumo.id)}>
                                                <DeleteForeverIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Ajustar Stock">
                                            <IconButton
                                                onClick={() => handleAdjustStock(insumo)}
                                                aria-label="ajustar stock"
                                            >
                                                <InventoryIcon />
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
                    count={insumosGranel.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>

            <ConfirmDialog
                open={openConfirm}
                onClose={handleConfirmClose}
            />
            <ModalRegistrarCompraInsumoGranel
                open={openCompraInsumoGranelModal}
                onClose={() => setOpenCompraInsumoGranelModal(false)}
                onCompraExitosa={getInsumosGranel}
            />
        </Container>
    );
};