import api, { URI as BASE_URI } from '../config.js';
import React, { useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
    Avatar, Button, TextField, Link, Box, Typography,
    Container, Paper} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ShowMsg from './dialogs/ShowMsg';
import Alerta from './dialogs/ShowAlert';

const URI = `${BASE_URI}/register`;

export const SignUp = () => {
    const navigate = useNavigate();
    const [usuCreado, setUsuCreado] = useState(null);
    const [errors, setErrors] = useState({});
    const [msgError, setMsgError] = useState('');

    const validate = (data) => {
        const newErrors = {};
        const nombre = data.get('nombre');
        const apellido = data.get('apellido');
        const email = data.get('email');
        const password = data.get('password');

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) newErrors.nombre = "Nombre inválido";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) newErrors.apellido = "Apellido inválido";
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(email)) newErrors.email = "Email inválido";
        if (password.length < 6) newErrors.password = "Mínimo 6 caracteres";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        setUsuCreado(null);
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if (!validate(data)) return;

        api.post(URI, {
            nombre: data.get('nombre').trim(),
            apellido: data.get('apellido').trim(),
            usuario: data.get('email').trim(),
            password: data.get('password').trim(),
        })
        .then((res) => {
            if (res.data.msgError === '') {
                setUsuCreado(true);
            } else {
                setUsuCreado(false);
                setMsgError(res.data.msgError);
                setErrors({ email: "El email ya está en uso" });
            }
        })
        .catch(() => {
            setUsuCreado(false);
            setMsgError("Error de conexión con el servidor");
        });
    };

    const renderContent = useCallback(() => {
        if (usuCreado === true) return <ShowMsg msg='Usuario creado correctamente.' ruta='/' error={false} titulo='Nuevo Usuario' color='green' />;
        if (usuCreado === false) return <ShowMsg msg='El usuario no ha podido crearse.' ruta='#' error={true} titulo='Nuevo Usuario' color='red' msgErr={msgError} />;
        return null;
    }, [msgError, usuCreado]);

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--mui-palette-primary-main), var(--mui-palette-primary-dark))',
            p: 2
        }}>
            <Container maxWidth="xs">
                {renderContent()}
                <Alerta />
                <Paper elevation={0} sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    bgcolor: 'var(--mui-palette-background-paper)',
                    boxShadow: 'var(--mui-shadows-10)'
                }}>
                    <Avatar sx={{ m: '0 auto 20px', bgcolor: 'var(--mui-palette-primary-main)', width: 56, height: 56 }}>
                        <PersonAddAltIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight="800" color="primary">
                        Crear Cuenta
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Regístrate para acceder al sistema
                    </Typography>

                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    name="nombre"
                                    required
                                    label="Nombre"
                                    autoFocus
                                    error={!!errors.nombre}
                                    helperText={errors.nombre}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    name="apellido"
                                    required
                                    label="Apellido"
                                    error={!!errors.apellido}
                                    helperText={errors.apellido}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    name="email"
                                    required
                                    label="Correo Electrónico"
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    name="password"
                                    required
                                    label="Contraseña"
                                    type="password"
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                            Registrarse
                        </Button>
                        <Link 
                            component="button" 
                            variant="body2" 
                            onClick={() => navigate('/')} 
                            sx={{ fontWeight: 600, textDecoration: 'none' }}
                        >
                            ¿Ya tienes cuenta? Ingresa aquí
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUp;
