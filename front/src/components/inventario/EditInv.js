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

const EditInv = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [loading, setLoading] = useState(true);
    const [componentes, setComponentes] = useState([]);
    const [estados, setEstados] = useState([]);
    const [areas, setAreas] = useState([]);

    const [form, setForm] = useState({
        num_inventario: '',
        descripcion: '',
        marca: '',
        num_serie: '',
        num_pc: '',
        observaciones: '',
        tipo: '',
        estado: '',
        area: '',
        resp_area: '',
        usuario: '',
        area_display: '' // Para el select
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resComp, resEst, resAreas, resInv] = await Promise.all([
                    api.get(`${URI}/tipos`),
                    api.get(`${URI}/estado`),
                    api.get(`${URI}/areas`),
                    api.get(`${URI}/inventario/${id}`)
                ]);
                setComponentes(resComp.data);
                setEstados(resEst.data);
                setAreas(resAreas.data);
                
                const inv = resInv.data;
                setForm({
                    ...inv,
                    area_display: `${inv.area} - ${inv.resp_area}`
                });
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const validate = () => {
        const newErrors = {};
        const regexAlphanumeric = new RegExp(/[a-z/0-9]/i);
        const regexAlpha = new RegExp(/[a-z]/i);

        if (!regexAlphanumeric.test(form.num_inventario)) newErrors.num_inventario = "Nº Inv inválido";
        if (!regexAlpha.test(form.tipo)) newErrors.tipo = "Seleccione tipo";
        if (!regexAlpha.test(form.descripcion)) newErrors.descripcion = "Descripción inválida";
        if (!regexAlpha.test(form.marca)) newErrors.marca = "Marca inválida";
        if (!regexAlphanumeric.test(form.num_serie)) newErrors.num_serie = "Serie inválida";
        if (!regexAlphanumeric.test(form.num_pc)) newErrors.num_pc = "PC inválido";
        if (!regexAlpha.test(form.area)) newErrors.area = "Seleccione área";
        if (!regexAlpha.test(form.estado)) newErrors.estado = "Seleccione estado";
        if (!regexAlpha.test(form.usuario)) newErrors.usuario = "Usuario inválido";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeArea = (event) => {
        const selectedValue = event.target.value; // Es el string "Area - Responsable"
        const dashIndex = selectedValue.indexOf(' - ');
        const areaName = selectedValue.substring(0, dashIndex).trim();
        const respName = selectedValue.substring(dashIndex + 3).trim();

        setForm(prev => ({
            ...prev,
            area: areaName,
            resp_area: respName,
            area_display: selectedValue
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validate()) {
            await api.put(`${URI}/inventario/${id}`, {
                num_inventario: form.num_inventario.trim(),
                num_pc: form.num_pc.trim(),
                tipo: form.tipo,
                descripcion: form.descripcion.trim(),
                marca: form.marca.trim(),
                num_serie: form.num_serie.trim(),
                observaciones: form.observaciones.trim(),
                area: form.area,
                resp_area: form.resp_area,
                estado: form.estado,
                usuario: form.usuario.trim()
            });
            navigate('/inventario');
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
                    <EditNoteIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" fontWeight="700" color="primary">
                        Editar Registro
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 4 }} />

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                name="num_inventario"
                                label="Nº Inventario"
                                value={form.num_inventario}
                                onChange={handleChange}
                                error={!!errors.num_inventario}
                                helperText={errors.num_inventario}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                name="tipo"
                                label="Tipo de Componente"
                                value={form.tipo}
                                onChange={handleChange}
                                error={!!errors.tipo}
                                fullWidth
                            >
                                {componentes.map((e) => (
                                    <MenuItem key={e.id} value={e.tipo}>{e.tipo}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                name="descripcion"
                                label="Descripción"
                                multiline
                                rows={3}
                                value={form.descripcion}
                                onChange={handleChange}
                                error={!!errors.descripcion}
                                fullWidth
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="marca" label="Marca" value={form.marca} onChange={handleChange} error={!!errors.marca} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="num_serie" label="Nº de Serie" value={form.num_serie} onChange={handleChange} fullWidth />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="num_pc" label="Nº PC" value={form.num_pc} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="usuario" label="Usuario" value={form.usuario} onChange={handleChange} fullWidth />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                name="estado"
                                label="Estado"
                                value={form.estado}
                                onChange={handleChange}
                                error={!!errors.estado}
                                fullWidth
                            >
                                {estados.map((e) => (
                                    <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                label="Área Municipal"
                                value={form.area_display || ''}
                                onChange={handleChangeArea}
                                error={!!errors.area}
                                helperText={errors.area || (form.resp_area ? `Responsable: ${form.resp_area}` : "")}
                                fullWidth
                            >
                                {areas.map((e) => (
                                    <MenuItem key={e.id} value={`${e.area} - ${e.responsable}`}>
                                        {e.area} - {e.responsable}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField name="observaciones" label="Observaciones" multiline rows={2} value={form.observaciones} onChange={handleChange} fullWidth />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    size="large" 
                                    onClick={() => navigate('/inventario')}
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
                                    Actualizar Cambios
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditInv;
