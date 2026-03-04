import React, { useState, useEffect } from 'react';
import { URI } from '../../config';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import useAuth from '../../hooks/useAuth';
import ActaRecargaTintaPdf from '../../pdf/ActaRecargaTinta.js';


export default function ModalRegistrarRecarga({ open, onClose, onRecargaExitosa }) {
    const { auth } = useAuth();

    // Listas maestras
    const [insumosGranel, setInsumosGranel] = useState([]);
    const [cartuchosRecargables, setCartuchosRecargables] = useState([]);
    const [areas, setAreas] = useState([]);
    const [impresoras, setImpresoras] = useState([]);

    const [selectedInsumoGranelId, setSelectedInsumoGranelId] = useState('');
    const [selectedCartuchoId, setSelectedCartuchoId] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedImpresoraId, setSelectedImpresoraId] = useState('');
    const [cantidadCartuchos, setCantidadCartuchos] = useState(1); // Número de cartuchos
    const [cantidadInsumo, setCantidadInsumo] = useState(''); // Cantidad de insumo a granel
    const [filteredImpresoras, setFilteredImpresoras] = useState([]);

    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchData();
            // Resetear estados al abrir
            setError('');
            setSelectedInsumoGranelId('');
            setSelectedCartuchoId('');
            setSelectedAreaId('');
            setSelectedImpresoraId('');
            setCantidadCartuchos(1);
            setCantidadInsumo('');
        }
    }, [open]);

    // Carga de datos iniciales
    const fetchData = async () => {
        try {
            const [insumosGranelRes, cartuchosRes, areasRes, impresorasRes] = await Promise.all([
                axios.get(`${URI}/insumos-granel`),
                axios.get(`${URI}/tintas/cartuchos?includeInsumoGranel=true`),
                axios.get(`${URI}/areas`),
                axios.get(`${URI}/tintas/impresoras`)
            ]);
            setInsumosGranel(insumosGranelRes.data);
            setCartuchosRecargables(cartuchosRes.data.filter(c => c.es_recargable));
            setAreas(areasRes.data);
            setImpresoras(impresorasRes.data);
        } catch (err) {
            console.error("Error fetching data for recharge modal:", err);
            setError("Error al cargar datos. Intente nuevamente.");
        }
    };

    // Filtrar impresoras por área seleccionada
    useEffect(() => {
        if (selectedAreaId) {
            setFilteredImpresoras(impresoras.filter(imp => imp.area_id === selectedAreaId));
            setSelectedImpresoraId(''); // Resetear impresora al cambiar de área
        } else {
            setFilteredImpresoras([]);
        }
    }, [selectedAreaId, impresoras]);

    const handleSubmit = async () => {
        setError('');

        if (!selectedInsumoGranelId || !selectedCartuchoId || !selectedImpresoraId || cantidadCartuchos < 1 || !cantidadInsumo || parseFloat(cantidadInsumo) <= 0) {
            setError("Por favor, complete todos los campos obligatorios con valores válidos.");
            return;
        }

        const insumoGranel = insumosGranel.find(i => i.id === selectedInsumoGranelId);
        if (!insumoGranel) {
            setError("Insumo a granel seleccionado no válido.");
            return;
        }

        if (insumoGranel.stock_actual < parseFloat(cantidadInsumo)) {
            setError(`No hay suficiente insumo a granel. Stock actual: ${insumoGranel.stock_actual}`);
            return;
        }

        try {
            await axios.post(`${URI}/tintas/movimientos/recarga`, {
                insumo_granel_id: selectedInsumoGranelId,
                unidad_cartucho_id: selectedCartuchoId,
                impresora_id: selectedImpresoraId,
                cantidad_cartuchos: parseInt(cantidadCartuchos),
                cantidad_insumo: parseFloat(cantidadInsumo),
                usuario_id: auth.id
            });

            // Generar el PDF
            const insumoGranelSeleccionado = insumosGranel.find(i => i.id === selectedInsumoGranelId);
            const cartuchoSeleccionado = cartuchosRecargables.find(c => c.id === selectedCartuchoId);
            const impresoraSeleccionada = impresoras.find(i => i.id === selectedImpresoraId);
            const areaSeleccionada = areas.find(a => a.id === selectedAreaId);


            if (insumoGranelSeleccionado && cartuchoSeleccionado && impresoraSeleccionada && areaSeleccionada) {
                const recargaData = {
                    insumoGranel: insumoGranelSeleccionado,
                    cartucho: cartuchoSeleccionado,
                    impresora: impresoraSeleccionada,
                    area: areaSeleccionada,
                    usuario: auth,
                    cantidadCartuchos: parseInt(cantidadCartuchos),
                    cantidadInsumo: parseFloat(cantidadInsumo),
                    fechaRecarga: new Date()
                };
                ActaRecargaTintaPdf(recargaData);
            } else {
                console.error("No se pudo encontrar datos completos para generar el PDF de recarga.");
            }

            onRecargaExitosa();
            onClose();
        } catch (err) {
            console.error("Error al registrar recarga:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al registrar la recarga.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Registrar Recarga de Insumo</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Select de Área */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Área de la Impresora"
                            value={selectedAreaId}
                            onChange={(e) => setSelectedAreaId(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">
                                <em>Seleccione un Área</em>
                            </MenuItem>
                            {areas.map((area) => (
                                <MenuItem key={area.id} value={area.id}>
                                    {area.area}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Select de Impresora */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Impresora"
                            value={selectedImpresoraId}
                            onChange={(e) => setSelectedImpresoraId(e.target.value)}
                            fullWidth
                            disabled={!selectedAreaId}
                        >
                            <MenuItem value="">
                                <em>Seleccione una Impresora</em>
                            </MenuItem>
                            {filteredImpresoras.map((impresora) => (
                                <MenuItem key={impresora.id} value={impresora.id}>
                                    {impresora.modelo}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Select de Insumo a Granel */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Insumo a Granel Utilizado"
                            value={selectedInsumoGranelId}
                            onChange={(e) => setSelectedInsumoGranelId(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">
                                <em>Seleccione un Insumo a Granel</em>
                            </MenuItem>
                            {insumosGranel.map((insumo) => (
                                <MenuItem key={insumo.id} value={insumo.id}>
                                    {`${insumo.nombre} (${insumo.unidad_medida}) - Stock: ${insumo.stock_actual}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Select de Cartucho a Recargar */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Cartucho a Recargar"
                            value={selectedCartuchoId}
                            onChange={(e) => setSelectedCartuchoId(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">
                                <em>Seleccione un Cartucho Recargable</em>
                            </MenuItem>
                            {cartuchosRecargables.map((cartucho) => (
                                <MenuItem key={cartucho.id} value={cartucho.id}>
                                    {`${cartucho.modelo} (${cartucho.color})`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Número de Cartuchos Recargados */}
                    <Grid item xs={6}>
                        <TextField
                            label="Nº de Cartuchos"
                            type="number"
                            value={cantidadCartuchos}
                            onChange={(e) => setCantidadCartuchos(e.target.value)}
                            fullWidth
                            inputProps={{ min: 1, step: 1 }}
                        />
                    </Grid>

                    {/* Cantidad de Insumo a Granel Utilizada */}
                    <Grid item xs={6}>
                        <TextField
                            label="Cantidad de Insumo"
                            type="number"
                            value={cantidadInsumo}
                            onChange={(e) => setCantidadInsumo(e.target.value)}
                            fullWidth
                            inputProps={{ min: 0, step: 'any' }}
                            helperText={`Unidad: ${insumosGranel.find(i => i.id === selectedInsumoGranelId)?.unidad_medida || 'N/A'}`}
                        />
                    </Grid>

                    {error && (
                        <Grid item xs={12}>
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Registrar Recarga
                </Button>
            </DialogActions>
        </Dialog>
    );
}