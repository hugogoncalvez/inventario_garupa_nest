import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Divider, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useAuth from '../../hooks/useAuth';

export default function ModalCrearPedido({ open, onClose, onPedidoExitoso }) {
    const { auth } = useAuth();
    const [insumos, setInsumos] = useState([]);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [listaPedido, setListaPedido] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchInsumos();
            setListaPedido([]);
            setError('');
            setCantidad('');
            setSelectedInsumoId('');
            setObservaciones('');
            setLoading(false);
        }
    }, [open]);

    const fetchInsumos = async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos`);
            setInsumos(res.data);
        } catch (err) {
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
        
        const newItem = {
            rowId: Date.now(),
            cartucho_id: insumo.id,
            cantidad_pedida: parseInt(cantidad),
            display: {
                insumo: `${insumo.modelo} (${insumo.color})`
            }
        };

        setListaPedido(prev => [...prev, newItem]);
        setSelectedInsumoId('');
        setCantidad('');
    };

    const handleRemoveFromLista = (rowId) => {
        setListaPedido(prev => prev.filter(item => item.rowId !== rowId));
    };

    const copyToWhatsApp = () => {
        if (listaPedido.length === 0) return;

        let text = `📦 *NUEVO PEDIDO DE INSUMOS - IT*\n`;
        text += `📅 Fecha: ${new Date().toLocaleDateString()}\n`;
        text += `👤 Solicitado por: ${auth.nombre} ${auth.apellido}\n\n`;
        
        listaPedido.forEach(item => {
            text += `• *${item.cantidad_pedida}x* ${item.display.insumo}\n`;
        });

        if (observaciones) {
            text += `\n📝 *Notas:* ${observaciones}`;
        }

        navigator.clipboard.writeText(text);
        alert("Pedido copiado al portapapeles. Ya puedes pegarlo en WhatsApp.");
    };

    const handleSubmit = async () => {
        if (listaPedido.length === 0 || loading) return;

        if (!window.navigator.onLine) {
            setError("No tienes conexión a internet.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                usuario_id: auth.id,
                observaciones,
                items: listaPedido.map(({ cartucho_id, cantidad_pedida }) => ({
                    cartucho_id,
                    cantidad_pedida
                }))
            };

            await api.post(`${URI}/pedidos`, payload);
            onPedidoExitoso();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrar el pedido.");
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: 'secondary.main' }}>
                <AssignmentIcon /> Crear Nuevo Pedido
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ p: 2.5, bgcolor: 'var(--mui-palette-action-hover)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)', mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={7}>
                            <TextField
                                select
                                label="Insumo / Cartucho"
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
                        <Grid item xs={8} sm={3}>
                            <TextField
                                label="Cantidad"
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                fullWidth
                                size="small"
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={4} sm={2} display="flex" justifyContent="center">
                            <IconButton onClick={handleAddToLista} color="secondary" disabled={loading} sx={{ bgcolor: 'var(--mui-palette-background-paper)', boxShadow: 'var(--mui-shadows-1)' }}>
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>

                <TextField
                    label="Observaciones / Notas adicionales"
                    fullWidth
                    multiline
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    sx={{ mb: 3 }}
                    disabled={loading}
                />

                {error && <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>⚠️ {error}</Typography>}

                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300, border: '1px solid var(--mui-palette-divider)', borderRadius: 2 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Insumo</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Cant. Pedida</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listaPedido.length === 0 ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>Lista de pedido vacía</TableCell></TableRow>
                            ) : (
                                listaPedido.map((item) => (
                                    <TableRow key={item.rowId} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{item.display.insumo}</TableCell>
                                        <TableCell align="right"><Typography variant="body2" fontWeight="800">{item.cantidad_pedida}</Typography></TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleRemoveFromLista(item.rowId)} color="error" disabled={loading}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: 'var(--mui-palette-background-default)', gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }} disabled={loading}>Cancelar</Button>
                <Tooltip title="Copiar texto formateado para WhatsApp">
                    <Button 
                        onClick={copyToWhatsApp} 
                        color="success" 
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        disabled={listaPedido.length === 0 || loading}
                        sx={{ fontWeight: 700 }}
                    >
                        WhatsApp
                    </Button>
                </Tooltip>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="secondary"
                    disabled={listaPedido.length === 0 || loading}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                    {loading ? 'Guardando...' : 'Guardar Pedido'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
