import api, { URI } from '../../config.js';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
    Button, TextField, Box, Container, Typography, MenuItem,
    Paper, Stack, Divider, CircularProgress} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import BuildIcon from '@mui/icons-material/Build';

const CreateOrden = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        id_equipo: '',
        problema_reportado: '',
        tecnico_asignado: '',
        estado: 'Recibido'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const res = await api.get(`${URI}/usuarios`);
                setUsuarios(res.data);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuarios();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.id_equipo) newErrors.id_equipo = "Requerido";
        if (!form.problema_reportado) newErrors.problema_reportado = "Requerido";
        if (!form.tecnico_asignado) newErrors.tecnico_asignado = "Requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validate()) {
            await api.post(`${URI}/ordenes`, {
                ...form,
                fecha_recepcion: new Date(),
            });
            navigate('/ordenes');
        }
    };

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
                    <BuildIcon color="primary" fontSize="large" />
                    <Typography variant="h4" fontWeight="700" color="primary">
                        Nueva Orden de Servicio
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 4 }} />

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                name="id_equipo"
                                label="ID del Equipo / Nº Inventario"
                                required
                                value={form.id_equipo}
                                onChange={handleChange}
                                error={!!errors.id_equipo}
                                helperText={errors.id_equipo}
                                fullWidth
                                autoFocus
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Estado Inicial"
                                value="Recibido"
                                disabled
                                fullWidth
                                helperText="Toda orden nueva nace como Recibida"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                name="problema_reportado"
                                label="Descripción del Problema"
                                required
                                multiline
                                rows={4}
                                value={form.problema_reportado}
                                onChange={handleChange}
                                error={!!errors.problema_reportado}
                                helperText={errors.problema_reportado}
                                fullWidth
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                name="tecnico_asignado"
                                label="Técnico a Cargo"
                                required
                                value={form.tecnico_asignado}
                                onChange={handleChange}
                                error={!!errors.tecnico_asignado}
                                helperText={errors.tecnico_asignado}
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
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large" 
                                    startIcon={<SaveOutlinedIcon />}
                                >
                                    Crear Orden
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateOrden;

