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

export default function ModalRegistrarCompra({ open, onClose, onCompraExitosa }) {
    const { auth } = useAuth();

    const [insumos, setInsumos] = useState([]);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [listaCompras, setListaCompras] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchInsumos();
            setListaCompras([]);
            setError('');
            setCantidad('');
            setSelectedInsumoId('');
        }
    }, [open]);

    const fetchInsumos = async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos`);
            setInsumos(res.data);
        } catch (err) {
            console.error("Error fetching insumos for purchase modal:", err);
            setError("Error al cargar los insumos. Intente nuevamente.");
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
        if (listaCompras.length === 0) {
            setError("La lista de compras está vacía.");
            return;
        }

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
            console.error("Error al registrar compra:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al registrar la compra.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Registrar Compra de Insumos (Carga Masiva)</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            select
                            label="Insumo"
                            value={selectedInsumoId}
                            onChange={(e) => setSelectedInsumoId(e.target.value)}
                            fullWidth
                        >
                            {insumos.map((insumo) => (
                                <MenuItem key={insumo.id} value={insumo.id}>
                                    {`${insumo.modelo} (${insumo.color}) - Stock Actual: ${insumo.stock_unidades}`}
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
                            inputProps={{ min: 1 }}
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
