import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';


import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useAuth from '../../hooks/useAuth'; // Para obtener el usuario_id



export default function ModalRegistrarCompra({ open, onClose, onCompraExitosa }) {
    const { auth } = useAuth();

    const [insumos, setInsumos] = useState([]);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchInsumos();
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

    const handleSubmit = async () => {
        if (!selectedInsumoId || !cantidad || cantidad <= 0) {
            setError("Por favor, complete todos los campos y asegúrese que la cantidad sea positiva.");
            return;
        }

        try {
            await api.post(`${URI}/tintas/movimientos/compra`, {
                cartucho_id: selectedInsumoId,
                cantidad: parseInt(cantidad),
                usuario_id: auth.id // Asegúrate de que 'auth.id' contenga el ID del usuario logueado
            });
            onCompraExitosa(); // Notifica al componente padre para que recargue la lista de insumos
            onClose(); // Cierra el modal
        } catch (err) {
            console.error("Error al registrar compra:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al registrar la compra.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Registrar Compra de Insumo</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
                    <TextField
                        select
                        label="Insumo"
                        value={selectedInsumoId}
                        onChange={(e) => setSelectedInsumoId(e.target.value)}
                        fullWidth
                    >
                        {insumos.map((insumo) => (
                            <MenuItem key={insumo.id} value={insumo.id}>
                                {`${insumo.modelo} (${insumo.color}) - Stock: ${insumo.stock_unidades}`}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        fullWidth
                        inputProps={{ min: 1 }}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Registrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}