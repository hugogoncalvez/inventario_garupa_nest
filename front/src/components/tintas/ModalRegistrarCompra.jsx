import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Divider, Stack
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import useAuth from '../../hooks/useAuth';

export default function ModalRegistrarCompra({ open, onClose, onCompraExitosa }) {
    const { auth } = useAuth();

    const [insumos, setInsumos] = useState([]);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [listaCompras, setListaCompras] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchInsumos();
            setListaCompras([]);
            setError('');
            setCantidad('');
            setSelectedInsumoId('');
            setLoading(false);
        }
    }, [open]);

    const fetchInsumos = async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos`);
            setInsumos(res.data);
        } catch (err) {
            console.error("Error fetching insumos:", err);
            setError("Error al cargar los insumos.");
        }
    };

    const handleAddToLista = () => {
        setError('');
        if (!selectedInsumoId || !cantidad || parseInt(cantidad) <= 0) {
            setError("Seleccione un insumo y una cantidad válida.");
            return;
        }

        const insumo = insumos.find(i => i.id === selectedInsumoId);
        
        const newCompra = {
            rowId: Date.now(),
            cartucho_id: insumo.id,
            cantidad: parseInt(cantidad),
            display: {
                insumo: `${insumo.modelo} (${insumo.color})`
            }
        };

        setListaCompras(prev => [...prev, newCompra]);
        setSelectedInsumoId('');
        setCantidad('');
    };

    const handleRemoveFromLista = (rowId) => {
        setListaCompras(prev => prev.filter(item => item.rowId !== rowId));
    };

    const handleSubmit = async () => {
        if (listaCompras.length === 0 || loading) return;

        // Verificación instantánea de conexión
        if (!window.navigator.onLine) {
            setError("No tienes conexión a internet. Revisa tu red antes de intentar registrar la compra.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                usuario_id: auth.id,
                items: listaCompras.map(({ cartucho_id, cantidad }) => ({
                    cartucho_id,
                    cantidad
                }))
            };

            await api.post(`${URI}/tintas/movimientos/compra`, payload);
            onCompraExitosa();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrar la compra.");
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: 'primary.main' }}>
                <ShoppingCartIcon color="primary" />
                Registrar Compra de Insumos
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ p: 2.5, bgcolor: 'var(--mui-palette-action-hover)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 7, md: 8 }}>
                            <TextField
                                select
                                label="Seleccionar Insumo / Cartucho"
                                value={selectedInsumoId}
                                onChange={(e) => setSelectedInsumoId(e.target.value)}
                                fullWidth
                                size="small"
                                disabled={loading}
                            >
                                {insumos.map((insumo) => (
                                    <MenuItem key={insumo.id} value={insumo.id}>
                                        {`${insumo.modelo} (${insumo.color}) - Stock: ${insumo.stock_unidades}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 8, sm: 3, md: 3 }}>
                            <TextField
                                label="Cantidad"
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                fullWidth
                                size="small"
                                slotProps={{ input: { min: 1 } }}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 2, md: 1 }} display="flex" justifyContent="center">
                            <IconButton onClick={handleAddToLista} color="primary" disabled={loading} sx={{ bgcolor: 'var(--mui-palette-background-paper)', boxShadow: 'var(--mui-shadows-1)' }}>
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>

                {error && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                        ⚠️ {error}
                    </Typography>
                )}

                <TableContainer component={Paper} elevation={0} sx={{ mt: 3, maxHeight: 350, border: '1px solid var(--mui-palette-divider)', borderRadius: 2 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Insumo</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Cant.</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listaCompras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                                        La lista está vacía. Seleccione insumos arriba.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listaCompras.map((item) => (
                                    <TableRow key={item.rowId} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{item.display.insumo}</TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="800">{item.cantidad}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleRemoveFromLista(item.rowId)} color="error" disabled={loading}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: 'var(--mui-palette-background-default)' }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }} disabled={loading}>Cancelar</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={listaCompras.length === 0 || loading}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                    {loading ? 'Finalizando...' : 'Finalizar Compra'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
