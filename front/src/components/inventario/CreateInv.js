import api, { URI } from '../../config.js';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
    Button, TextField, Box, Container, Typography, MenuItem,
    Paper, Stack, Divider} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';

const CreateInv = () => {
    const navigate = useNavigate();
    const [componentes, setComponentes] = useState([]);
    const [estados, setEstados] = useState([]);
    const [areas, setAreas] = useState([]);
    const [numInventario, setNumInventario] = useState('');
    
    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('');
    const [area, setArea] = useState('');
    const [respArea, setRespArea] = useState('');

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            const [resComp, resEst, resAreas, resNext] = await Promise.all([
                api.get(`${URI}/tipos`),
                api.get(`${URI}/estado`),
                api.get(`${URI}/areas`),
                api.get(`${URI}/inventario/next`)
            ]);
            setComponentes(resComp.data);
            setEstados(resEst.data);
            setAreas(resAreas.data);
            setNumInventario(resNext.data.nextInvNumber);
        };
        loadData();
    }, []);

    const validate = (formData) => {
        const newErrors = {};
        if (!numInventario) newErrors.numInv = "Requerido";
        if (!tipo) newErrors.tipo = "Requerido";
        if (!formData.get('descrip')) newErrors.descrip = "Requerido";
        if (!formData.get('marca')) newErrors.marca = "Requerido";
        if (!area) newErrors.area = "Requerido";
        if (!estado) newErrors.estado = "Requerido";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangeArea = (event) => {
        setArea(event.target.value);
        setRespArea(event.target.value.responsable);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        
        if (validate(data)) {
            await api.post(`${URI}/inventario/create`, {
                num_inventario: numInventario.trim(),
                num_pc: data.get('numPC').trim(),
                tipo: tipo,
                descripcion: data.get('descrip').trim(),
                marca: data.get('marca').trim(),
                num_serie: data.get('numSerie').trim(),
                observaciones: data.get('obs').trim(),
                area: area.area,
                resp_area: respArea,
                estado: estado,
                usuario: data.get('usuario').trim()
            });
            navigate('/inventario/');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <Box display="flex" alignItems="center" mb={3} gap={2}>
                    <InventoryIcon color="primary" fontSize="large" />
                    <Typography variant="h4" fontWeight="700" color="primary">
                        Nuevo Item de Inventario
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 4 }} />

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                name="Num_Inv"
                                required
                                label="Nº Inventario"
                                value={numInventario}
                                onChange={(e) => setNumInventario(e.target.value)}
                                error={!!errors.numInv}
                                helperText={errors.numInv}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                required
                                label="Tipo de Componente"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                error={!!errors.tipo}
                                helperText={errors.tipo || "Seleccione el tipo de equipo"}
                                fullWidth
                            >
                                {componentes.map((e) => (
                                    <MenuItem key={e.id} value={e.tipo}>{e.tipo}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                name="descrip"
                                required
                                label="Descripción Detallada"
                                multiline
                                rows={3}
                                error={!!errors.descrip}
                                helperText={errors.descrip}
                                fullWidth
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="marca" required label="Marca" error={!!errors.marca} helperText={errors.marca} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="numSerie" label="Nº de Serie" defaultValue="No posee" fullWidth />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="numPC" label="Nombre de PC / ID" defaultValue="Ninguno" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField name="usuario" label="Usuario Asignado" defaultValue="Ninguno" fullWidth />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                required
                                label="Estado del Bien"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                error={!!errors.estado}
                                helperText={errors.estado}
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
                                required
                                label="Área Municipal"
                                value={area}
                                onChange={handleChangeArea}
                                error={!!errors.area}
                                helperText={errors.area || (respArea ? `Responsable: ${respArea}` : "Seleccione oficina")}
                                fullWidth
                            >
                                {areas.map((e) => (
                                    <MenuItem key={e.id} value={e}>{e.area}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField name="obs" label="Observaciones Adicionales" multiline rows={2} defaultValue="Ninguna" fullWidth />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    size="large" 
                                    onClick={() => navigate('/inventario/')}
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
                                    Guardar Registro
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateInv;
