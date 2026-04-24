import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Divider, Stack, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import useAuth from '../../hooks/useAuth';
import ActaEntregaTintasPdf from '../../pdf/ActaEntregaTintas';

export default function ModalRegistrarEntrega({ open, onClose, onEntregaExitosa }) {
    const { auth } = useAuth();

    const [areas, setAreas] = useState([]);
    const [impresoras, setImpresoras] = useState([]);
    const [insumos, setInsumos] = useState([]);

    const [stagedEntrega, setStagedEntrega] = useState({ impresoraId: '', insumoId: '', cantidad: 1 });
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [filteredImpresoras, setFilteredImpresoras] = useState([]);
    const [showAllInsumos, setShowAllInsumos] = useState(false);
    const [listaEntregas, setListaEntregas] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const [areasRes, impresorasRes, insumosRes] = await Promise.all([
                        api.get(`${URI}/areas`),
                        api.get(`${URI}/tintas/impresoras`),
                        api.get(`${URI}/tintas/cartuchos`)
                    ]);
                    setAreas(areasRes.data);
                    setImpresoras(impresorasRes.data);
                    setInsumos(insumosRes.data);
                } catch (err) {
                    setError("Error al cargar datos iniciales.");
                }
            };
            fetchData();
            setListaEntregas([]);
            setSelectedAreaId('');
            setShowAllInsumos(false);
            setStagedEntrega({ impresoraId: '', insumoId: '', cantidad: 1 });
            setError('');
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (selectedAreaId) {
            setFilteredImpresoras(impresoras.filter(imp => imp.area_id === selectedAreaId));
            setStagedEntrega(prev => ({ ...prev, impresoraId: '' }));
        } else {
            setFilteredImpresoras([]);
        }
    }, [selectedAreaId, impresoras]);

    // Lógica de filtrado de insumos
    const getFilteredInsumos = () => {
        if (!stagedEntrega.impresoraId || showAllInsumos) return insumos;
        
        // Buscar insumos que tengan esta impresora en su historial
        const sugeridos = insumos.filter(ins => 
            ins.impresoras_vinculadas?.includes(Number(stagedEntrega.impresoraId))
        );

        return sugeridos.length > 0 ? sugeridos : insumos;
    };

    const handleStagedChange = (field, value) => {
        setStagedEntrega(prev => ({ ...prev, [field]: value }));
        if (field === 'impresoraId') {
            setShowAllInsumos(false); // Resetear al cambiar de impresora
        }
    };

    const handleAddToLista = () => {
        setError('');
        const { insumoId, impresoraId, cantidad } = stagedEntrega;

        if (!insumoId || !impresoraId || !cantidad || cantidad <= 0) {
            setError("Complete todos los campos para agregar.");
            return;
        }

        const insumo = insumos.find(i => i.id === insumoId);
        if (!insumo.es_recargable && cantidad > insumo.stock_unidades) {
            setError(`Stock insuficiente para ${insumo.modelo}.`);
            return;
        }

        const impresora = impresoras.find(i => i.id === impresoraId);

        const newEntrega = {
            rowId: Date.now(),
            cartucho_id: insumo.id,
            impresora_id: impresora.id,
            cantidad: parseInt(cantidad),
            display: {
                insumo: `${insumo.modelo} (${insumo.color})`,
                impresora: `${impresora.modelo} (${impresora.marca})`
            }
        };

        setListaEntregas(prev => [...prev, newEntrega]);
        setStagedEntrega(prev => ({ ...prev, insumoId: '', cantidad: 1 }));
    };

    const handleRemoveFromLista = (rowId) => {
        setListaEntregas(prev => prev.filter(item => item.rowId !== rowId));
    };

    const handleSubmit = async () => {
        if (listaEntregas.length === 0 || loading) return;

        // Verificación instantánea de conexión
        if (!window.navigator.onLine) {
            setError("No tienes conexión a internet. Revisa tu red antes de intentar registrar.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                usuario_id: auth.id,
                items: listaEntregas.map(({ cartucho_id, impresora_id, cantidad }) => ({
                    cartucho_id,
                    impresora_id,
                    cantidad
                }))
            };

            await api.post(`${URI}/tintas/movimientos/entrega`, payload);

            const area = areas.find(a => a.id === selectedAreaId);
            const itemsParaPdf = listaEntregas.map(item => ({
                ...insumos.find(i => i.id === item.cartucho_id),
                cantidad: item.cantidad,
                impresora: impresoras.find(imp => imp.id === item.impresora_id)
            }));

            ActaEntregaTintasPdf({
                items: itemsParaPdf,
                area: area,
                usuario: auth,
                fechaEntrega: new Date()
            });

            onEntregaExitosa();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrar.");
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: 'info.main' }}>
                <SendIcon /> Registrar Entrega de Insumos
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ p: 2.5, bgcolor: 'var(--mui-palette-action-hover)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)', mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField 
                                select 
                                label="Área Municipal" 
                                value={selectedAreaId} 
                                onChange={(e) => setSelectedAreaId(e.target.value)} 
                                fullWidth 
                                size="small"
                                disabled={loading}
                            >
                                {areas.map(area => <MenuItem key={area.id} value={area.id}>{area.area}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField 
                                select 
                                label="Impresora Destino" 
                                value={stagedEntrega.impresoraId} 
                                onChange={(e) => handleStagedChange('impresoraId', e.target.value)} 
                                fullWidth 
                                size="small"
                                disabled={!selectedAreaId || loading}
                            >
                                {filteredImpresoras.map(imp => <MenuItem key={imp.id} value={imp.id}>{imp.modelo} - {imp.marca}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField 
                                select 
                                label={stagedEntrega.impresoraId && !showAllInsumos && getFilteredInsumos().length < insumos.length 
                                    ? "Sugeridos para este Equipo" 
                                    : "Insumo / Cartucho"}
                                value={stagedEntrega.insumoId} 
                                onChange={(e) => handleStagedChange('insumoId', e.target.value)} 
                                fullWidth 
                                size="small"
                                disabled={loading}
                                helperText={stagedEntrega.impresoraId && getFilteredInsumos().length < insumos.length && !showAllInsumos ? (
                                    <Button 
                                        size="small" 
                                        onClick={() => setShowAllInsumos(true)} 
                                        sx={{ py: 0, fontSize: '0.65rem', minWidth: 0 }}
                                        disabled={loading}
                                    >
                                        Ver todos los insumos
                                    </Button>
                                ) : null}
                            >
                                {getFilteredInsumos().map(ins => (
                                    <MenuItem key={ins.id} value={ins.id}>
                                        {`${ins.modelo} (${ins.color}) - Stock: ${ins.stock_unidades}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 8, md: 1 }}>
                            <TextField 
                                label="Cant." 
                                type="number" 
                                value={stagedEntrega.cantidad} 
                                onChange={(e) => handleStagedChange('cantidad', e.target.value)} 
                                fullWidth 
                                size="small"
                                slotProps={{ input: { min: 1 } }} 
                                disabled={loading}
                            />
                        </Grid>
                        <Grid size={{ xs: 4, md: 1 }} display="flex" justifyContent="center">
                            <IconButton 
                                onClick={handleAddToLista} 
                                color="primary" 
                                disabled={!selectedAreaId || loading}
                                sx={{ bgcolor: 'var(--mui-palette-background-paper)', boxShadow: 'var(--mui-shadows-1)' }}
                            >
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>

                {error && <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>⚠️ {error}</Typography>}

                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400, border: '1px solid var(--mui-palette-divider)', borderRadius: 2 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Insumo</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Equipo Destino</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Cant.</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'var(--mui-palette-background-paper)' }}>Quitar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listaEntregas.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>No hay entregas en la lista</TableCell></TableRow>
                            ) : (
                                listaEntregas.map((item) => (
                                    <TableRow key={item.rowId} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{item.display.insumo}</TableCell>
                                        <TableCell>{item.display.impresora}</TableCell>
                                        <TableCell align="right"><Typography variant="body2" fontWeight="800">{item.cantidad}</Typography></TableCell>
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
            <DialogActions sx={{ p: 2.5, bgcolor: 'var(--mui-palette-background-default)' }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }} disabled={loading}>Cancelar</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="info" 
                    disabled={listaEntregas.length === 0 || loading}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                    {loading ? 'Registrando...' : 'Generar Acta y Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
