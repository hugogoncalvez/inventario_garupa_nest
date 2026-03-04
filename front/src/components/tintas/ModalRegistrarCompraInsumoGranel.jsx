import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useAuth from '../../hooks/useAuth';

import { URI } from '../../config';

export default function ModalRegistrarCompraInsumoGranel({ open, onClose, onCompraExitosa }) {
    const { auth } = useAuth();

    const [insumosGranel, setInsumosGranel] = useState([]);
    const [selectedInsumoGranelId, setSelectedInsumoGranelId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchInsumosGranel();
            setError('');
            setSelectedInsumoGranelId('');
            setCantidad('');
        }
    }, [open]);

    const fetchInsumosGranel = async () => {
        try {
            const res = await axios.get(`${URI}/insumos-granel`);
            setInsumosGranel(res.data);
        } catch (err) {
            console.error("Error fetching insumos a granel for purchase modal:", err);
            setError("Error al cargar los insumos a granel. Intente nuevamente.");
        }
    };

    const handleSubmit = async () => {
        if (!selectedInsumoGranelId || !cantidad || parseFloat(cantidad) <= 0) {
            setError("Por favor, complete todos los campos y asegúrese que la cantidad sea positiva.");
            return;
        }

        try {
            await axios.post(`${URI}/insumos-granel/movimientos/compra`, {
                insumo_granel_id: selectedInsumoGranelId,
                cantidad: parseFloat(cantidad),
                usuario_id: auth.id
            });
            onCompraExitosa();
            onClose();
        } catch (err) {
            console.error("Error al registrar compra de insumo a granel:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al registrar la compra del insumo a granel.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Compra de Insumo</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        select
                        label="Insumo a Granel"
                        value={selectedInsumoGranelId}
                        onChange={(e) => setSelectedInsumoGranelId(e.target.value)}
                        fullWidth
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value="">
                            <em>Seleccione un Insumo a Granel</em>
                        </MenuItem>
                        {insumosGranel.map((insumo) => (
                            <MenuItem key={insumo.id} value={insumo.id}>
                                {`${insumo.nombre} (${insumo.unidad_medida})`}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Cantidad Comprada"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0.001, step: 0.001 }}
                        helperText="Cantidad de insumo comprado"
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Registrar Compra
                </Button>
            </DialogActions>
        </Dialog>
    );
}