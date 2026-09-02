import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Divider, Tooltip, Chip, FormControlLabel, Switch
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import useAuth from '../../hooks/useAuth';

export default function ModalCrearPedido({ open, onClose, onPedidoExitoso }) {
    const { auth } = useAuth();
    const [insumos, setInsumos] = useState([]);
    const [topInsumosNames, setTopInsumosNames] = useState([]);
    const [soloCriticos, setSoloCriticos] = useState(false);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [listaPedido, setListaPedido] = useState([]);
    const [error, setError] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchData();
            setListaPedido([]);
            setError('');
            setInfoMsg('');
            setCantidad('');
            setSelectedInsumoId('');
            setObservaciones('');
            setSoloCriticos(false);
            setLoading(false);
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const [resInsumos, resStats] = await Promise.all([
                api.get(`${URI}/tintas/cartuchos`),
                api.get(`${URI}/dashboard/stats`).catch(() => null)
            ]);

            setInsumos(resInsumos.data || []);
            
            if (resStats && resStats.data && resStats.data.topInsumos) {
                const names = resStats.data.topInsumos.map(item => item.name);
                setTopInsumosNames(names);
            }
        } catch (err) {
            setError("Error al cargar los insumos.");
        }
    };

    const isCritico = (insumo) => {
        return insumo.stock_unidades <= insumo.stock_minimo_unidades;
    };

    const isTopUsado = (insumo) => {
        return topInsumosNames.includes(insumo.modelo);
    };

    const handleAutoCargarCriticos = () => {
        setError('');
        setInfoMsg('');

        // 1. Filtrar los insumos en estado crítico (stock_unidades <= stock_minimo_unidades)
        const criticos = insumos.filter(isCritico);

        if (criticos.length === 0) {
            setInfoMsg("🟢 ¡Todos los insumos tienen stock suficiente! No se detectaron insumos críticos.");
            return;
        }

        // 2. Priorizar los Top Usados que estén en estado crítico
        const criticosTop = criticos.filter(isTopUsado);
        
        // Si hay insumos críticos en el Top Usados, usamos esos; de lo contrario, tomamos todos los críticos
        const aCargar = criticosTop.length > 0 ? criticosTop : criticos;

        // Evitar agregar los que ya están en la lista actual
        const existentesIds = new Set(listaPedido.map(item => item.cartucho_id));
        const nuevosItems = [];

        aCargar.forEach(insumo => {
            if (!existentesIds.has(insumo.id)) {
                // Calcular cantidad sugerida: al menos la diferencia para cubrir el mínimo, o un valor base (ej: min * 2)
                const faltante = insumo.stock_minimo_unidades - insumo.stock_unidades;
                const sugerido = Math.max(faltante > 0 ? faltante + 2 : 2, 1);

                nuevosItems.push({
                    rowId: Date.now() + Math.random(),
                    cartucho_id: insumo.id,
                    cantidad_pedida: sugerido,
                    display: {
                        insumo: `${insumo.modelo} (${insumo.color})`,
                        esTop: isTopUsado(insumo)
                    }
                });
            }
        });

        if (nuevosItems.length === 0) {
            setInfoMsg("ℹ️ Los insumos críticos ya se encuentran agregados a la lista de pedido.");
            return;
        }

        setListaPedido(prev => [...prev, ...nuevosItems]);
        setInfoMsg(`⚡ Se agregaron ${nuevosItems.length} insumos críticos automáticamente (priorizando los más usados).`);
    };

    const handleAddToLista = () => {
        setError('');
        setInfoMsg('');
        if (!selectedInsumoId || !cantidad || parseInt(cantidad) <= 0) {
            setError("Seleccione un insumo y una cantidad válida.");
            return;
        }

        const insumo = insumos.find(i => i.id === selectedInsumoId);
        if (!insumo) return;
        
        const newItem = {
            rowId: Date.now(),
            cartucho_id: insumo.id,
            cantidad_pedida: parseInt(cantidad),
            display: {
                insumo: `${insumo.modelo} (${insumo.color})`,
                esTop: isTopUsado(insumo)
            }
        };

        setListaPedido(prev => [...prev, newItem]);
        setSelectedInsumoId('');
        setCantidad('');
    };

    const handleCantidadChange = (rowId, nuevaCantidad) => {
        const val = parseInt(nuevaCantidad);
        setListaPedido(prev => prev.map(item => {
            if (item.rowId === rowId) {
                return {
                    ...item,
                    cantidad_pedida: isNaN(val) || val <= 0 ? 1 : val
                };
            }
            return item;
        }));
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

    const insumosFiltrados = soloCriticos 
        ? insumos.filter(isCritico)
        : insumos;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: 'secondary.main' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <AssignmentIcon /> Crear Nuevo Pedido
                </Box>
                <Button 
                    variant="outlined" 
                    color="warning" 
                    size="small"
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleAutoCargarCriticos}
                    disabled={loading || insumos.length === 0}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                    ⚡ Auto-Cargar Críticos
                </Button>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2.5 }}>
                {/* Control Filtro Críticos */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={soloCriticos} 
                                onChange={(e) => setSoloCriticos(e.target.checked)} 
                                color="error" 
                                size="small"
                            />
                        }
                        label={
                            <Typography variant="body2" fontWeight={600} color={soloCriticos ? "error.main" : "text.secondary"}>
                                🔴 Mostrar solo insumos con stock crítico ({insumos.filter(isCritico).length})
                            </Typography>
                        }
                    />
                </Box>

                <Box sx={{ p: 2.5, bgcolor: 'var(--mui-palette-action-hover)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)', mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                select
                                label="Seleccionar Insumo / Cartucho"
                                value={selectedInsumoId}
                                onChange={(e) => setSelectedInsumoId(e.target.value)}
                                fullWidth
                                size="small"
                                disabled={loading}
                            >
                                {insumosFiltrados.length === 0 ? (
                                    <MenuItem disabled value="">
                                        <em>No hay insumos para mostrar</em>
                                    </MenuItem>
                                ) : (
                                    insumosFiltrados.map((insumo) => {
                                        const critico = isCritico(insumo);
                                        const esTop = isTopUsado(insumo);
                                        return (
                                            <MenuItem key={insumo.id} value={insumo.id}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <span>{critico ? '🔴' : '🟢'}</span>
                                                        <Typography variant="body2" fontWeight={critico ? 700 : 400}>
                                                            {insumo.modelo} ({insumo.color})
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        {esTop && (
                                                            <Chip 
                                                                label="Top Usado" 
                                                                size="small" 
                                                                color="primary" 
                                                                variant="outlined"
                                                                icon={<LocalFireDepartmentIcon style={{ fontSize: 14 }} />}
                                                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
                                                            />
                                                        )}
                                                        <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: critico ? 700 : 400, color: critico ? 'error.main' : 'text.secondary' }}>
                                                            Stock: {insumo.stock_unidades} / Mín: {insumo.stock_minimo_unidades}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })
                                )}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 8, md: 3 }}>
                            <TextField
                                label="Cant."
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                fullWidth
                                size="small"
                                disabled={loading}
                                slotProps={{ input: { min: 1 } }} 
                            />
                        </Grid>
                        <Grid size={{ xs: 4, md: 1 }} display="flex" justifyContent="center">
                            <IconButton onClick={handleAddToLista} color="secondary" disabled={loading} sx={{ bgcolor: 'var(--mui-palette-background-paper)', boxShadow: 'var(--mui-shadows-1)' }}>
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>

                {error && <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>⚠️ {error}</Typography>}
                {infoMsg && <Typography color="primary" variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>{infoMsg}</Typography>}

                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 260, border: '1px solid var(--mui-palette-divider)', borderRadius: 2, mb: 2 }}>
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
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {item.display.insumo}
                                                {item.display.esTop && (
                                                    <Chip 
                                                        label="Top Usado" 
                                                        size="small" 
                                                        color="primary" 
                                                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{ width: 120 }}>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={item.cantidad_pedida}
                                                onChange={(e) => handleCantidadChange(item.rowId, e.target.value)}
                                                disabled={loading}
                                                slotProps={{ input: { min: 1, style: { textAlign: 'right', fontWeight: 800 } } }}
                                                sx={{ width: 85 }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleRemoveFromLista(item.rowId)} color="error" disabled={loading}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TextField
                    label="Observaciones / Notas adicionales"
                    fullWidth
                    multiline
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={loading}
                />
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

