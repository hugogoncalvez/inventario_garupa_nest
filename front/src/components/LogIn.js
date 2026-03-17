import api, { URI as BASE_URI } from '../config.js';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
    Button, TextField, Box, Typography, Container, Paper,
    InputAdornment, IconButton, keyframes
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ComputerIcon from '@mui/icons-material/Computer';

const URI = `${BASE_URI}/auth/login`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LogIn = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    // Redirigir si ya está autenticado
    React.useEffect(() => {
        if (auth) {
            navigate('/dashboard');
        }
        // Wake-up Ping silencioso al bot de WhatsApp
        fetch('https://inventario-whatsapp-bot.onrender.com/health').catch(() => null);
    }, [auth, navigate]);

    const [passNoOk, setPassNoOk] = useState(false);
    const [isEmail, setIsEmail] = useState(false);
    const [textErrPass, setTextErrPass] = useState('La contraseña debe tener 6 caracteres como mínimo');
    const [textErrEmail, setTextErrEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validate = (data) => {
        const email = data.get('email');
        const password = data.get('password');
        const emailValid = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i).test(email);
        const passValid = password.length >= 6;

        setIsEmail(!emailValid);
        setPassNoOk(!passValid);
        if (!emailValid) setTextErrEmail('Ingrese un email válido');

        return emailValid && passValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (!validate(data)) return;

        api.post(URI, {
            usuario: data.get('email').trim(),
            password: data.get('password').trim()
        })
            .then((res) => {
                setAuth(res.data);
                navigate('/dashboard');
            })
            .catch((error) => {
                const msg = error.response?.data?.message;
                if (msg === 'Usuario no existe') {
                    setIsEmail(true);
                    setTextErrEmail(msg);
                } else if (msg === 'Password incorrecto') {
                    setPassNoOk(true);
                    setTextErrPass(msg);
                } else {
                    setIsEmail(true);
                    setTextErrEmail("Error de conexión");
                }
            });
    };

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
                <Paper elevation={0} sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    animation: `${fadeIn} 0.6s ease-out`,
                    bgcolor: 'var(--mui-palette-background-paper)',
                    boxShadow: 'var(--mui-shadows-10)'
                }}>
                    <Typography variant="h4" fontWeight="800" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <ComputerIcon fontSize="large" /> Inventario
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                        Sistema de Gestión Municipal
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            error={isEmail}
                            helperText={isEmail && textErrEmail}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            error={passNoOk}
                            helperText={passNoOk && textErrPass}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                            Entrar al Sistema
                        </Button>
                        <Button fullWidth variant="text" onClick={() => navigate('/register')} sx={{ fontWeight: 600 }}>
                            ¿No tienes cuenta? Regístrate
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default LogIn;
