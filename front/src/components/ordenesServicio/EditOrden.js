import api, { URI } from '../../config.js';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
    Button, TextField, Box, Container, Typography, MenuItem,
    Paper, Stack, Divider, CircularProgress, Autocomplete, Chip, List, ListItem, ListItemText, IconButton} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import HardwareIcon from '@mui/icons-material/Hardware';

const EditOrden = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [repuestosDisponibles, setRepuestosDisponibles] = useState([]);
    const [repuestosSeleccionados, setRepuestosSeleccionados] = useState([]);
    const [repuestosYaUsados, setRepuestosYaUsados] = useState([]);

    const [form, setForm] = useState({
        id_equipo: '',
        problema_reportado: '',
        trabajo_realizado: '',
        tecnico_asignado: '',
        estado: '',
        fecha_recepcion: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resOrd, resRep, resUsers] = await Promise.all([
                    api.get(`${URI}/ordenes/${id}`),
                    api.get(`${URI}/repuestos`),
                    api.get(`${URI}/usuarios`)
                ]);
                
                setForm(resOrd.data);
                setRepuestosDisponibles(resRep.data);
                setUsuarios(resUsers.data);
                
                // Cargar repuestos ya vinculados a esta orden
                if (resOrd.data.repuestos_usados) {
                    setRepuestosYaUsados(resOrd.data.repuestos_usados);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddRepuesto = (event, newValue) => {
        if (newValue) {
            // Verificar si ya está en la lista de seleccionados
            if (!repuestosSeleccionados.find(r => r.id === newValue.id)) {
                setRepuestosSeleccionados([...repuestosSeleccionados, { ...newValue, cantidad: 1 }]);
            }
        }
    };

    const removeRepuesto = (id) => {
        setRepuestosSeleccionados(repuestosSeleccionados.filter(r => r.id !== id));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.id_equipo) newErrors.id_equipo = "Requerido";
        if (!form.problema_reportado) newErrors.problema_reportado = "Requerido";
        if (!form.tecnico_asignado) newErrors.tecnico_asignado = "Requerido";
        if (!form.estado) newErrors.estado = "Requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validate()) {
            await api.put(`${URI}/ordenes/${id}`, {
                ...form,
                fecha_entrega: form.estado === 'Entregado' ? new Date() : null,
                repuestos: repuestosSeleccionados // Enviamos los nuevos repuestos a descontar
            });
            navigate('/ordenes');
        }
    };

    const estados = [
        'Recibido',
        'En Reparación',
        'Esperando Repuestos',
        'Reparado',
        'Entregado',
        'Sin Solucion (Baja)'
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 9, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <Box display="flex" alignItems="center" mb={3} gap={2}>
                    <EditNoteIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" fontWeight="700" color="primary">
                        Actualizar Orden
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 4 }} />

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                name="id_equipo"
                                label="Equipo / Inventario"
                                required
                                value={form.id_equipo || ''}
                                onChange={handleChange}
                                error={!!errors.id_equipo}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                name="estado"
                                label="Estado de la Orden"
                                value={form.estado || ''}
                                onChange={handleChange}
                                error={!!errors.estado}
                                fullWidth
                            >
                                {estados.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                name="problema_reportado"
                                label="Problema Inicial"
                                required
                                multiline
                                rows={3}
                                value={form.problema_reportado || ''}
                                onChange={handleChange}
                                error={!!errors.problema_reportado}
                                fullWidth
                            />
                        </Grid>

                        {/* SECCIÓN DE REPUESTOS */}
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Box display="flex" alignItems="center" mb={2} gap={1}>
                                    <HardwareIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight="700">Gestión de Repuestos</Typography>
                                </Box>
                                
                                <Autocomplete
                                    options={repuestosDisponibles}
                                    getOptionLabel={(option) => `${option.tipo_rel?.tipo || ''} - ${option.marca} ${option.modelo} (Stock: ${option.stock_actual})`}
                                    onChange={handleAddRepuesto}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Buscar Repuesto para Agregar" size="small" fullWidth sx={{ bgcolor: 'background.paper' }} />
                                    )}
                                    noOptionsText="No hay repuestos que coincidan"
                                    clearOnBlur
                                    clearOnEscape
                                />

                                {repuestosSeleccionados.length > 0 && (
                                    <Box mt={2}>
                                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Nuevos repuestos a descontar:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1} gap={1}>
                                            {repuestosSeleccionados.map((r) => (
                                                <Chip 
                                                    key={r.id} 
                                                    label={`${r.modelo} (x1)`} 
                                                    onDelete={() => removeRepuesto(r.id)} 
                                                    color="primary"
                                                    variant="filled"
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {repuestosYaUsados.length > 0 && (
                                    <Box mt={2}>
                                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Repuestos ya utilizados en esta orden:</Typography>
                                        <List dense sx={{ mt: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                                            {repuestosYaUsados.map((ru) => (
                                                <ListItem key={ru.id} divider>
                                                    <ListItemText 
                                                        primary={`${ru.repuesto.marca} ${ru.repuesto.modelo}`} 
                                                        secondary={`Cantidad: ${ru.cantidad} - Fecha: ${new Date(ru.fecha).toLocaleDateString()}`} 
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                name="trabajo_realizado"
                                label="Detalle Técnico del Trabajo Realizado"
                                multiline
                                rows={4}
                                value={form.trabajo_realizado || ''}
                                onChange={handleChange}
                                fullWidth
                                helperText="Explique qué se hizo para solucionar el problema"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                name="tecnico_asignado"
                                label="Técnico Responsable"
                                required
                                value={form.tecnico_asignado || ''}
                                onChange={handleChange}
                                error={!!errors.tecnico_asignado}
                                fullWidth
                            >
                                <MenuItem value=""><em>Seleccione un técnico</em></MenuItem>
                                {usuarios.map((u) => (
                                    <MenuItem key={u.id} value={`${u.nombre} ${u.apellido}`}>
                                        {u.nombre} {u.apellido}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    size="large" 
                                    onClick={() => navigate('/ordenes')}
                                    startIcon={<CancelIcon />}
                                >
                                    Descartar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large" 
                                    startIcon={<SaveOutlinedIcon />}
                                >
                                    Actualizar Orden
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditOrden;

