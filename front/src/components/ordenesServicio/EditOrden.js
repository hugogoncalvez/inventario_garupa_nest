import api, { URI } from '../../config.js';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
    Button, TextField, Box, Container, Typography, MenuItem,
    Paper, Stack, Divider, CircularProgress} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import EditNoteIcon from '@mui/icons-material/EditNote';

const EditOrden = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

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
        const getOrdenById = async () => {
            try {
                const res = await api.get(`${URI}/ordenes/${id}`);
                setForm(res.data);
            } catch (error) {
                console.error("Error cargando orden:", error);
            } finally {
                setLoading(false);
            }
        };
        getOrdenById();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
                fecha_entrega: form.estado === 'Entregado' ? new Date() : null
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
                                name="tecnico_asignado"
                                label="Técnico Responsable"
                                required
                                value={form.tecnico_asignado || ''}
                                onChange={handleChange}
                                error={!!errors.tecnico_asignado}
                                fullWidth
                            />
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
