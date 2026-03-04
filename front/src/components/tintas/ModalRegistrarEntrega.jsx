import React, { useState, useEffect } from 'react';
import { URI } from '../../config';
import axios from 'axios';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Typography, Grid, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import useAuth from '../../hooks/useAuth';
import ActaEntregaTintasPdf from '../../pdf/ActaEntregaTintas';


export default function ModalRegistrarEntrega({ open, onClose, onEntregaExitosa }) {
    const { auth } = useAuth();

    // Listas maestras
    const [areas, setAreas] = useState([]);
    const [impresoras, setImpresoras] = useState([]);
    const [insumos, setInsumos] = useState([]);

    // Estado del formulario de agregado
    const [stagedEntrega, setStagedEntrega] = useState({ impresoraId: '', insumoId: '', cantidad: 1 });
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [filteredImpresoras, setFilteredImpresoras] = useState([]);

    // Lista de entregas a realizar
    const [listaEntregas, setListaEntregas] = useState([]);

    const [error, setError] = useState('');

    // Carga inicial de datos
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const [areasRes, impresorasRes, insumosRes] = await Promise.all([
                        axios.get(`${URI}/areas`),
                        axios.get(`${URI}/tintas/impresoras`),
                        axios.get(`${URI}/tintas/cartuchos`)
                    ]);
                    setAreas(areasRes.data);
                    setImpresoras(impresorasRes.data);
                    setInsumos(insumosRes.data);
                } catch (err) {
                    setError("Error al cargar datos iniciales.");
                }
            };
            fetchData();
            // Resetear estados al abrir
            setListaEntregas([]);
            setSelectedAreaId('');
            setStagedEntrega({ impresoraId: '', insumoId: '', cantidad: 1 });
            setError('');
        }
    }, [open]);

    // Filtrar impresoras cuando cambia el área
    useEffect(() => {
        if (selectedAreaId) {
            setFilteredImpresoras(impresoras.filter(imp => imp.area_id === selectedAreaId));
            // Resetear la impresora seleccionada en el formulario si el área cambia
            setStagedEntrega(prev => ({ ...prev, impresoraId: '' }));
        } else {
            setFilteredImpresoras([]);
        }
    }, [selectedAreaId, impresoras]);

    const handleStagedChange = (field, value) => {
        setStagedEntrega(prev => ({ ...prev, [field]: value }));
    };

    const handleAddToLista = () => {
        setError('');
        const { insumoId, impresoraId, cantidad } = stagedEntrega;

        if (!insumoId || !impresoraId || !cantidad || cantidad <= 0) {
            setError("Debe seleccionar un insumo, una impresora y una cantidad válida para agregar.");
            return;
        }

        const insumo = insumos.find(i => i.id === insumoId);
        if (!insumo.es_recargable && cantidad > insumo.stock_unidades) {
            setError(`Stock insuficiente para ${insumo.modelo}. Stock actual: ${insumo.stock_unidades}`);
            return;
        }

        const impresora = impresoras.find(i => i.id === impresoraId);

        // Usar un ID único para la fila de la tabla para poder borrarla
        const newEntrega = {
            rowId: Date.now(),
            cartucho_id: insumo.id,
            impresora_id: impresora.id,
            cantidad: parseInt(cantidad),
            // Guardar data extra para mostrar en la tabla
            display: {
                insumo: `${insumo.modelo} (${insumo.color})`,
                impresora: `${impresora.modelo} (${impresora.marca})`
            }
        };

        setListaEntregas(prev => [...prev, newEntrega]);
        // Resetear formulario de staged
        setStagedEntrega({ impresoraId: '', insumoId: '', cantidad: 1 });
    };

    const handleRemoveFromLista = (rowId) => {
        setListaEntregas(prev => prev.filter(item => item.rowId !== rowId));
    };

    const handleSubmit = async () => {
        if (listaEntregas.length === 0) {
            setError("La lista de entregas está vacía.");
            return;
        }

        try {
            const payload = {
                usuario_id: auth.id,
                items: listaEntregas.map(({ cartucho_id, impresora_id, cantidad }) => ({
                    cartucho_id,
                    impresora_id,
                    cantidad
                }))
            };

            await axios.post(`${URI}/tintas/movimientos/entrega`, payload);

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
            setError(err.response?.data?.message || "Error al registrar las entregas.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Registrar Entrega Múltiple</DialogTitle>
            <DialogContent>
                {/* --- SECCIÓN DE FORMULARIO DE AGREGADO --- */}
                <Grid container spacing={2} sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
                    <Grid item xs={12}>
                        <TextField select label="Área de Destino" value={selectedAreaId} onChange={(e) => setSelectedAreaId(e.target.value)} fullWidth>
                            {areas.map(area => <MenuItem key={area.id} value={area.id}>{area.area}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField select label="Impresora" value={stagedEntrega.impresoraId} onChange={(e) => handleStagedChange('impresoraId', e.target.value)} fullWidth disabled={!selectedAreaId}>
                            {filteredImpresoras.map(imp => <MenuItem key={imp.id} value={imp.id}>{imp.modelo}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField select label="Insumo" value={stagedEntrega.insumoId} onChange={(e) => handleStagedChange('insumoId', e.target.value)} fullWidth>
                            {insumos.map(ins => <MenuItem key={ins.id} value={ins.id}>{`${ins.modelo} (${ins.color}) - Stock: ${ins.stock_unidades}`}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={8} sm={1}>
                        <TextField label="Cant." type="number" value={stagedEntrega.cantidad} onChange={(e) => handleStagedChange('cantidad', e.target.value)} fullWidth inputProps={{ min: 1 }} />
                    </Grid>
                    <Grid item xs={4} sm={1} display="flex" alignItems="center">
                        <IconButton onClick={handleAddToLista} color="primary" disabled={!selectedAreaId}><AddCircleOutlineIcon /></IconButton>
                    </Grid>
                </Grid>

                {error && <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>}

                {/* --- SECCIÓN DE TABLA DE ENTREGAS --- */}
                <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400 }}>
                    <Table stickyHeader aria-label="tabla de entregas">
                        <TableHead>
                            <TableRow>
                                <TableCell>Insumo</TableCell>
                                <TableCell>Impresora Destino</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="center">Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listaEntregas.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center">Agregue insumos a la lista de entrega</TableCell></TableRow>
                            ) : (
                                listaEntregas.map((item) => (
                                    <TableRow key={item.rowId}>
                                        <TableCell>{item.display.insumo}</TableCell>
                                        <TableCell>{item.display.impresora}</TableCell>
                                        <TableCell align="right">{item.cantidad}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleRemoveFromLista(item.rowId)}><DeleteIcon color="warning" /></IconButton>
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
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={listaEntregas.length === 0}>
                    Registrar Entregas
                </Button>
            </DialogActions>
        </Dialog>
    );
}
