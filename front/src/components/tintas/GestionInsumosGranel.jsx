import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
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
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ConfirmDialog from '../dialogs/ShowConfirm';
import { Divider, Card, CardContent, Stack, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ModalRegistrarCompraInsumoGranel from './ModalRegistrarCompraInsumoGranel';
import InventoryIcon from '@mui/icons-material/Inventory';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';

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

export const GestionInsumosGranel = () => {
    const { auth } = useAuth();
    const [insumosGranel, setInsumosGranel] = useState([]);
    const [id, setId] = useState('');
    const [nombre, setNombre] = useState('');
    const [sku, setSku] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('g');
    const [stockMinimo, setStockMinimo] = useState(0);
    const [isUpdate, setIsUpdate] = useState(false);
    const [error, setError] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const [openCompraInsumoGranelModal, setOpenCompraInsumoGranelModal] = useState(false);
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

    const handleChangePage = (event, newPage) => setPage(newPage);
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
            const data = { nombre: nombre.trim(), sku: sku.trim(), unidad_medida: unidadMedida, stock_minimo: parseFloat(stockMinimo) };
            if (isUpdate) {
                await api.put(`${URI}/insumos-granel/${id}`, data);
            } else {
                await api.post(`${URI}/insumos-granel`, data);
            }
            clearForm();
            getInsumosGranel();
        } catch (err) {
            console.error("Error al guardar:", err);
            setError(err.response?.data?.message || "Error al guardar.");
        }
    };

    const handleEditClick = (insumo) => {
        setId(insumo.id); setNombre(insumo.nombre); setSku(insumo.sku || '');
        setUnidadMedida(insumo.unidad_medida); setStockMinimo(insumo.stock_minimo);
        setIsUpdate(true); setError('');
    };

    const handleDeleteClick = (insumoId) => { setIdToDelete(insumoId); setOpenConfirm(true); };

    const handleConfirmClose = async (confirm) => {
        setOpenConfirm(false);
        if (confirm && idToDelete) {
            try {
                await api.delete(`${URI}/insumos-granel/${idToDelete}`, { data: { usuario_id: auth.id } });
                getInsumosGranel();
            } catch (err) {
                console.error("Error al eliminar:", err);
            }
        }
        setIdToDelete('');
    };

    const clearForm = () => {
        setId(''); setNombre(''); setSku(''); setUnidadMedida('g'); setStockMinimo(0); setIsUpdate(false); setError('');
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
                if (!value || parseFloat(value) < 0) return 'Ingrese una cantidad válida';
            }
        });
        if (nuevaCantidad !== undefined && nuevaCantidad !== null) {
            try {
                await api.post(`${URI}/insumos-granel/movimientos/ajuste`, {
                    insumo_granel_id: insumo.id,
                    nueva_cantidad: parseFloat(nuevaCantidad),
                    usuario_id: auth.id
                });
                Swal.fire('¡Ajustado!', 'Stock corregido.', 'success');
                getInsumosGranel();
            } catch (err) {
                console.error("Error al ajustar:", err);
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Insumos a Granel
                </Typography>
                <Button variant="contained" color="success" onClick={() => setOpenCompraInsumoGranelModal(true)} startIcon={<ShoppingCartIcon />}>
                    Registrar Compra
                </Button>
            </Box>

            <ConfirmDialog open={openConfirm} onClose={handleConfirmClose} />
            <ModalRegistrarCompraInsumoGranel open={openCompraInsumoGranelModal} onClose={() => setOpenCompraInsumoGranelModal(false)} onCompraExitosa={getInsumosGranel} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" mb={2}>
                                {isUpdate ? 'Editar Insumo' : 'Nuevo Insumo'}
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Stack spacing={2}>
                                    <TextField label="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth size="small" />
                                    <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} fullWidth size="small" />
                                    <TextField select label="Unidad" value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} fullWidth size="small">
                                        <MenuItem value="g">Gramos (g)</MenuItem>
                                        <MenuItem value="kg">Kilogramos (kg)</MenuItem>
                                        <MenuItem value="ml">Mililitros (ml)</MenuItem>
                                        <MenuItem value="l">Litros (l)</MenuItem>
                                    </TextField>
                                    <TextField label="Stock Mínimo" type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} fullWidth size="small" />
                                    <Button type="submit" variant="contained" fullWidth startIcon={<SaveOutlinedIcon />}>
                                        {isUpdate ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                    <Button variant="outlined" fullWidth onClick={clearForm} startIcon={<ClearAllIcon />}>
                                        {isUpdate ? 'Cancelar' : 'Limpiar'}
                                    </Button>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: '65vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Nombre</StyledTableCell>
                                        <StyledTableCell align='center'>SKU</StyledTableCell>
                                        <StyledTableCell align='center'>Unidad</StyledTableCell>
                                        <StyledTableCell align='center'>Stock Actual</StyledTableCell>
                                        <StyledTableCell align='center'>Stock Mínimo</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {insumosGranel.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((insumo) => (
                                        <StyledTableRow key={insumo.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 600 }}>{insumo.nombre}</StyledTableCell>
                                            <StyledTableCell align='center'>{insumo.sku || '---'}</StyledTableCell>
                                            <StyledTableCell align='center'>{insumo.unidad_medida}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Box sx={{ 
                                                    bgcolor: insumo.stock_actual <= insumo.stock_minimo ? 'error.light' : 'success.light',
                                                    color: 'white', px: 1, borderRadius: 1, fontSize: '0.85rem', fontWeight: 700, display: 'inline-block'
                                                }}>
                                                    {parseFloat(insumo.stock_actual).toLocaleString('es-AR')}
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell align='center'>{insumo.stock_minimo}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleEditClick(insumo)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleDeleteClick(insumo.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Ajustar Stock"><IconButton size="small" color="info" onClick={() => handleAdjustStock(insumo)}><InventoryIcon fontSize="small" /></IconButton></Tooltip>
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
                            count={insumosGranel.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
