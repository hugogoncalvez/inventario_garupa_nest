import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, Grid2 as Grid, Box, Divider, Stack
} from '@mui/material';
import RecyclingIcon from '@mui/icons-material/Recycling';
import useAuth from '../../hooks/useAuth';
import ActaRecargaTintaPdf from '../../pdf/ActaRecargaTinta.js';

export default function ModalRegistrarRecarga({ open, onClose, onRecargaExitosa }) {
    const { auth } = useAuth();

    const [insumosGranel, setInsumosGranel] = useState([]);
    const [cartuchosRecargables, setCartuchosRecargables] = useState([]);
    const [areas, setAreas] = useState([]);
    const [impresoras, setImpresoras] = useState([]);

    const [selectedInsumoGranelId, setSelectedInsumoGranelId] = useState('');
    const [selectedCartuchoId, setSelectedCartuchoId] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedImpresoraId, setSelectedImpresoraId] = useState('');
    const [cantidadCartuchos, setCantidadCartuchos] = useState(1);
    const [cantidadInsumo, setCantidadInsumo] = useState('');
    const [filteredImpresoras, setFilteredImpresoras] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchData();
            setError('');
            setSelectedInsumoGranelId('');
            setSelectedCartuchoId('');
            setSelectedAreaId('');
            setSelectedImpresoraId('');
            setCantidadCartuchos(1);
            setCantidadInsumo('');
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const [insumosGranelRes, cartuchosRes, areasRes, impresorasRes] = await Promise.all([
                api.get(`${URI}/insumos-granel`),
                api.get(`${URI}/tintas/cartuchos?includeInsumoGranel=true`),
                api.get(`${URI}/areas`),
                api.get(`${URI}/tintas/impresoras`)
            ]);
            setInsumosGranel(insumosGranelRes.data);
            setCartuchosRecargables(cartuchosRes.data.filter(c => c.es_recargable));
            setAreas(areasRes.data);
            setImpresoras(impresorasRes.data);
        } catch (err) {
            setError("Error al cargar datos.");
        }
    };

    useEffect(() => {
        if (selectedAreaId) {
            setFilteredImpresoras(impresoras.filter(imp => imp.area_id === selectedAreaId));
            setSelectedImpresoraId('');
        } else {
            setFilteredImpresoras([]);
        }
    }, [selectedAreaId, impresoras]);

    const handleSubmit = async () => {
        setError('');
        if (!selectedInsumoGranelId || !selectedCartuchoId || !selectedImpresoraId || cantidadCartuchos < 1 || !cantidadInsumo) {
            setError("Complete todos los campos obligatorios.");
            return;
        }

        const insumoGranel = insumosGranel.find(i => i.id === selectedInsumoGranelId);
        if (insumoGranel && insumoGranel.stock_actual < parseFloat(cantidadInsumo)) {
            setError(`Stock insuficiente. Disponible: ${insumoGranel.stock_actual}`);
            return;
        }

        try {
            await api.post(`${URI}/tintas/movimientos/recarga`, {
                insumo_granel_id: selectedInsumoGranelId,
                unidad_cartucho_id: selectedCartuchoId,
                impresora_id: selectedImpresoraId,
                cantidad_cartuchos: parseInt(cantidadCartuchos),
                cantidad_insumo: parseFloat(cantidadInsumo),
                usuario_id: auth.id
            });

            const insumoGranelSeleccionado = insumosGranel.find(i => i.id === selectedInsumoGranelId);
            const cartuchoSeleccionado = cartuchosRecargables.find(c => c.id === selectedCartuchoId);
            const impresoraSeleccionada = impresoras.find(i => i.id === selectedImpresoraId);
            const areaSeleccionada = areas.find(a => a.id === selectedAreaId);

            if (insumoGranelSeleccionado && cartuchoSeleccionado && impresoraSeleccionada && areaSeleccionada) {
                ActaRecargaTintaPdf({
                    insumoGranel: insumoGranelSeleccionado,
                    cartucho: cartuchoSeleccionado,
                    impresora: impresoraSeleccionada,
                    area: areaSeleccionada,
                    usuario: auth,
                    cantidadCartuchos: parseInt(cantidadCartuchos),
                    cantidadInsumo: parseFloat(cantidadInsumo),
                    fechaRecarga: new Date()
                });
            }

            onRecargaExitosa();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrar.");
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: 'warning.main' }}>
                <RecyclingIcon /> Registrar Recarga de Insumo
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            label="Área de la Impresora"
                            value={selectedAreaId}
                            onChange={(e) => setSelectedAreaId(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            {areas.map((area) => <MenuItem key={area.id} value={area.id}>{area.area}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            label="Seleccionar Impresora"
                            value={selectedImpresoraId}
                            onChange={(e) => setSelectedImpresoraId(e.target.value)}
                            fullWidth
                            size="small"
                            disabled={!selectedAreaId}
                        >
                            {filteredImpresoras.map((impresora) => <MenuItem key={impresora.id} value={impresora.id}>{impresora.modelo}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            label="Insumo a Granel Utilizado"
                            value={selectedInsumoGranelId}
                            onChange={(e) => setSelectedInsumoGranelId(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            {insumosGranel.map((insumo) => (
                                <MenuItem key={insumo.id} value={insumo.id}>
                                    {`${insumo.nombre} - Disponible: ${insumo.stock_actual} ${insumo.unidad_medida}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            label="Modelo de Cartucho"
                            value={selectedCartuchoId}
                            onChange={(e) => setSelectedCartuchoId(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            {cartuchosRecargables.map((cartucho) => <MenuItem key={cartucho.id} value={cartucho.id}>{`${cartucho.modelo} (${cartucho.color})`}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Nº de Cartuchos"
                            type="number"
                            value={cantidadCartuchos}
                            onChange={(e) => setCantidadCartuchos(e.target.value)}
                            fullWidth
                            size="small"
                            slotProps={{ input: { min: 1 } }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Cant. Granel Usada"
                            type="number"
                            value={cantidadInsumo}
                            onChange={(e) => setCantidadInsumo(e.target.value)}
                            fullWidth
                            size="small"
                            slotProps={{ input: { min: 0 } }}
                            helperText={selectedInsumoGranelId ? `Medida: ${insumosGranel.find(i => i.id === selectedInsumoGranelId)?.unidad_medida}` : ""}
                        />
                    </Grid>

                    {error && (
                        <Grid size={{ xs: 12 }}>
                            <Typography color="error" variant="caption" sx={{ fontWeight: 600 }}>⚠️ {error}</Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: 'var(--mui-palette-background-default)' }}>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="warning" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>
                    Registrar Recarga
                </Button>
            </DialogActions>
        </Dialog>
    );
}
