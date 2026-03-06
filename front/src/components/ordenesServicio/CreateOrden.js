import api, { URI } from '../../config.js';


import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuItem from '@mui/material/MenuItem';


const CreateOrden = () => {

    const navigate = useNavigate();

    const [id_equipo, setIdEquipo] = useState('');
    const [problema_reportado, setProblemaReportado] = useState('');
    const [tecnico_asignado, setTecnicoAsignado] = useState('');
    const [estado, setEstado] = useState('Recibido');

    const handleSubmit = async (event) => {
        event.preventDefault();
        await api.post(`${URI}/ordenes`, {
            id_equipo: id_equipo,
            problema_reportado: problema_reportado,
            tecnico_asignado: tecnico_asignado,
            estado: estado,
            fecha_recepcion: new Date(),
        });
        navigate('/ordenes');
    }

    const estados = [
        'Recibido',
        'Esperando Repuestos',
        'Reparado',
        'Entregado',
        'Sin Solucion (Baja)'
    ];

    return (
        <Container component='main' maxWidth='md' sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5">
                Crear Orden de Servicio
            </Typography>
            <Box component='form' noValidate onSubmit={handleSubmit} sx={{ "& .MuiTextField-root": { m: 2, width: "40ch" } }}>
                <TextField
                    name="id_equipo"
                    required
                    label="ID Equipo"
                    value={id_equipo}
                    onChange={(e) => setIdEquipo(e.target.value)}
                    autoFocus
                />
                <TextField
                    name="problema_reportado"
                    required
                    label="Problema Reportado"
                    multiline
                    rows={4}
                    value={problema_reportado}
                    onChange={(e) => setProblemaReportado(e.target.value)}
                />
                <TextField
                    name="tecnico_asignado"
                    required
                    label="Técnico Asignado"
                    value={tecnico_asignado}
                    onChange={(e) => setTecnicoAsignado(e.target.value)}
                />
                <TextField
                    select
                    name="estado"
                    required
                    label="Estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                >
                    {estados.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
                <div></div>
                <Button
                    onClick={() => navigate('/ordenes')}
                    variant="contained"
                    sx={{ mr: 10 }}
                    size="large"
                    startIcon={<CancelIcon />}
                    color='error'
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveOutlinedIcon />}
                >
                    Guardar
                </Button>
            </Box>
        </Container>
    )
}

export default CreateOrden;
