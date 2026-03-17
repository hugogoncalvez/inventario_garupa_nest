import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip,    TextField, MenuItem, Container, Card, CardContent, 
    Stack, Chip, TablePagination, Divider 
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import ConfirmDialog from '../dialogs/ShowConfirm';
import ModalRegistrarCompraInsumoGranel from './ModalRegistrarCompraInsumoGranel';

// Estilos de la tabla optimizados
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

export const GestionInsumosGranel = () => {
    const { auth } = useAuth();
    const [insumosGranel, setInsumosGranel] = useState([]);
    
    // Form State
    const [form, setForm] = useState({
        id: '',
        nombre: '',
        sku: '',
        unidad_medida: 'g',
        stock_minimo: 0
    });
    const [isUpdate, setIsUpdate] = useState(false);
    
    // UI State
    const [openConfirm, setOpenConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const [openCompraModal, setOpenCompraModal] = useState(false);
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
            console.error("Error al obtener insumos:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) return;
        
        try {
            const data = { 
                nombre: form.nombre.trim(), 
                sku: form.sku.trim(), 
                unidad_medida: form.unidad_medida, 
                stock_minimo: parseFloat(form.stock_minimo) 
            };
            
            if (isUpdate) {
                await api.put(`${URI}/insumos-granel/${form.id}`, data);
            } else {
                await api.post(`${URI}/insumos-granel`, data);
            }
            clearForm();
            getInsumosGranel();
            Swal.fire('¡Éxito!', 'Insumo guardado correctamente.', 'success');
        } catch (err) {
            Swal.fire('Error', 'No se pudo guardar el insumo.', 'error');
        }
    };

    const handleEditClick = (insumo) => {
        setForm({ ...insumo });
        setIsUpdate(true);
    };

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setOpenConfirm(true);
    };

    const handleConfirmClose = async (confirm) => {
        setOpenConfirm(false);
        if (confirm && idToDelete) {
            await api.delete(`${URI}/insumos-granel/${idToDelete}`, { data: { usuario_id: auth.id } });
            getInsumosGranel();
        }
        setIdToDelete('');
    };

    const clearForm = () => {
        setForm({ id: '', nombre: '', sku: '', unidad_medida: 'g', stock_minimo: 0 });
        setIsUpdate(false);
    };

    const handleAdjustStock = async (insumo) => {
        const { value: nueva } = await Swal.fire({
            title: `Ajustar: ${insumo.nombre}`,
            input: 'number',
            inputValue: insumo.stock_actual,
            showCancelButton: true
        });
        if (nueva) {
            await api.post(`${URI}/insumos-granel/movimientos/ajuste`, {
                insumo_granel_id: insumo.id,
                nueva_cantidad: parseFloat(nueva),
                usuario_id: auth.id
            });
            getInsumosGranel();
        }
    };

    const handleSendStockSummary = async () => {
        try {
            await api.post(`${URI}/tintas/whatsapp/resumen-stock`);
            Swal.fire({
                title: '¡Enviado!',
                text: 'El resumen de stock se ha enviado al grupo de WhatsApp.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo enviar el resumen por WhatsApp.', 'error');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                <Typography variant="h4" fontWeight="800" color="primary">
                    Insumos a Granel
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => setOpenCompraModal(true)} 
                        startIcon={<ShoppingCartIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        Registrar Compra
                    </Button>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={handleSendStockSummary} 
                        startIcon={<WhatsAppIcon />}
                        sx={{ borderRadius: 2, bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                    >
                        WhatsApp
                    </Button>
                </Stack>
            </Box>

            <ConfirmDialog open={openConfirm} onClose={handleConfirmClose} />
            <ModalRegistrarCompraInsumoGranel open={openCompraModal} onClose={() => setOpenCompraModal(false)} onCompraExitosa={getInsumosGranel} />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, position: 'sticky', top: 100 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2} gap={1}>
                                <AddCircleOutlineIcon color="primary" />
                                <Typography variant="h6" fontWeight="700">
                                    {isUpdate ? 'Editar Insumo' : 'Nuevo Insumo'}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Box component="form" onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField name="nombre" label="Nombre del Insumo" required value={form.nombre} onChange={handleChange} fullWidth size="small" />
                                    <TextField name="sku" label="SKU / Código" value={form.sku} onChange={handleChange} fullWidth size="small" />
                                    <TextField select name="unidad_medida" label="Unidad de Medida" value={form.unidad_medida} onChange={handleChange} fullWidth size="small">
                                        <MenuItem value="g">Gramos (g)</MenuItem>
                                        <MenuItem value="kg">Kilogramos (kg)</MenuItem>
                                        <MenuItem value="ml">Mililitros (ml)</MenuItem>
                                        <MenuItem value="l">Litros (l)</MenuItem>
                                    </TextField>
                                    <TextField name="stock_minimo" label="Stock Mínimo de Alerta" type="number" value={form.stock_minimo} onChange={handleChange} fullWidth size="small" />
                                    <Button type="submit" variant="contained" fullWidth startIcon={<SaveOutlinedIcon />} sx={{ py: 1.2, borderRadius: 2 }}>
                                        {isUpdate ? 'Actualizar Registro' : 'Guardar Insumo'}
                                    </Button>
                                    <Button variant="outlined" color="secondary" fullWidth onClick={clearForm} startIcon={<ClearAllIcon />} sx={{ borderRadius: 2 }}>
                                        {isUpdate ? 'Cancelar Edición' : 'Limpiar'}
                                    </Button>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--mui-palette-divider)' }}>
                        <TableContainer sx={{ maxHeight: '65vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Insumo</StyledTableCell>
                                        <StyledTableCell align='center'>Unidad</StyledTableCell>
                                        <StyledTableCell align='center'>Stock Actual</StyledTableCell>
                                        <StyledTableCell align='center'>Estado</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {insumosGranel.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((insumo) => (
                                        <StyledTableRow key={insumo.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 700 }}>
                                                <Typography variant="body2" fontWeight="700">{insumo.nombre}</Typography>
                                                <Typography variant="caption" color="text.secondary">{insumo.sku || 'Sin SKU'}</Typography>
                                            </StyledTableCell>
                                            <StyledTableCell align='center'>{insumo.unidad_medida}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Typography variant="body2" fontWeight="800">
                                                    {parseFloat(insumo.stock_actual).toLocaleString('es-AR')}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Chip 
                                                    size="small"
                                                    label={parseFloat(insumo.stock_actual) <= parseFloat(insumo.stock_minimo) ? 'Bajo' : 'OK'}
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        bgcolor: parseFloat(insumo.stock_actual) <= parseFloat(insumo.stock_minimo) ? 'var(--mui-palette-error-main)' : 'var(--mui-palette-success-main)',
                                                        color: '#fff'
                                                    }}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Editar"><IconButton size="small" color="success" onClick={() => handleEditClick(insumo)}><EditIcon fontSize="small" /></IconButton></Tooltip>
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
                            onPageChange={(e, p) => setPage(p)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            labelRowsPerPage="Filas"
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
