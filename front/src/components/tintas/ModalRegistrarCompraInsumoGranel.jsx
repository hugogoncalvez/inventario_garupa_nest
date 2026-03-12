import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, Grid, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import useAuth from '../../hooks/useAuth';

export default function ModalRegistrarCompraInsumoGranel({ open, onClose, onCompraExitosa }) {
    const { auth } = useAuth();

    const [insumosGranel, setInsumosGranel] = useState([]);
    const [selectedInsumoGranelId, setSelectedInsumoGranelId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [listaCompras, setListaCompras] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchInsumosGranel();
            setListaCompras([]);
            setError('');
            setSelectedInsumoGranelId('');
            setCantidad('');
        }
    }, [open]);

    const fetchInsumosGranel = async () => {
        try {
            const res = await api.get(`${URI}/insumos-granel`);
            setInsumosGranel(res.data);
        } catch (err) {
            console.error("Error fetching insumos a granel for purchase modal:", err);
            setError("Error al cargar los insumos a granel. Intente nuevamente.");
        }
    };

    const handleAddToLista = () => {
        setError('');
        if (!selectedInsumoGranelId || !cantidad || parseFloat(cantidad) <= 0) {
            setError("Seleccione un insumo y una cantidad válida.");
            return;
        }

        const insumo = insumosGranel.find(i => i.id === selectedInsumoGranelId);
        
        const newCompra = {
            rowId: Date.now(),
            insumo_granel_id: insumo.id,
            cantidad: parseFloat(cantidad),
            display: {
                insumo: `${insumo.nombre} (${insumo.unidad_medida})`
            }
        };

        setListaCompras(prev => [...prev, newCompra]);
        setSelectedInsumoGranelId('');
        setCantidad('');
    };

    const handleRemoveFromLista = (rowId) => {
        setListaCompras(prev => prev.filter(item => item.rowId !== rowId));
    };

    const handleSubmit = async () => {
        if (listaCompras.length === 0) {
            setError("La lista de compras está vacía.");
            return;
        }

        try {
            const payload = {
                usuario_id: auth.id,
                items: listaCompras.map(({ insumo_granel_id, cantidad }) => ({
                    insumo_granel_id,
                    cantidad
                }))
            };

            await api.post(`${URI}/insumos-granel/movimientos/compra`, payload);
            onCompraExitosa();
            onClose();
        } catch (err) {
            console.error("Error al registrar compra de insumo a granel:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al registrar la compra del insumo a granel.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Registrar Compra de Granel (Carga Masiva)</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            select
                            label="Insumo a Granel"
                            value={selectedInsumoGranelId}
                            onChange={(e) => setSelectedInsumoGranelId(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">
                                <em>Seleccione un Insumo</em>
                            </MenuItem>
                            {insumosGranel.map((insumo) => (
                                <MenuItem key={insumo.id} value={insumo.id}>
                                    {`${insumo.nombre} (${insumo.unidad_medida}) - Stock: ${insumo.stock_actual}`}
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
                            inputProps={{ min: 0.001, step: 0.001 }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={1} display="flex" alignItems="center">
                        <IconButton onClick={handleAddToLista} color="primary">
                            <AddCircleOutlineIcon />
                        </IconButton>
                    </Grid>
                </Grid>

                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Insumo</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="center">Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listaCompras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Agregue ítems a la lista de compra
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listaCompras.map((item) => (
                                    <TableRow key={item.rowId}>
                                        <TableCell>{item.display.insumo}</TableCell>
                                        <TableCell align="right">{item.cantidad}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleRemoveFromLista(item.rowId)}>
                                                <DeleteIcon color="warning" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={listaCompras.length === 0}
                >
                    Registrar Compra
                </Button>
            </DialogActions>
        </Dialog>
    );
}
