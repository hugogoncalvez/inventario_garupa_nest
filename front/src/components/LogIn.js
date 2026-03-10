import api, { URI as BASE_URI } from '../config.js';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { keyframes } from '@mui/material';

const URI = `${BASE_URI}/auth/login`;

// Animación de entrada
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LogIn = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    // Bloquear el botón de atrás
    React.useEffect(() => {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
            window.history.go(0);
        };
    }, []);

    const [passNoOk, setPassNoOk] = useState(false);
    const [isEmail, setIsEmail] = useState(false);
    const [textErrPass, setTextErrPass] = useState('La contraseña debe tener 6 caracteres como mínimo');
    const [textErrEmail, setTextErrEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validate = (data) => {
        let respuesta = {};
        respuesta.email = new RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i).test(data.get('email'));
        respuesta.password = data.get('password').length >= 6 ? true : false;

        setIsEmail(!respuesta.email);
        setPassNoOk(!respuesta.password);

        if (!respuesta.email) setTextErrEmail('Ingrese un email válido');
        return Object.values(respuesta).every(x => x === true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let validado = validate(data);

        let usuario = data.get('email').trim();
        let password = data.get('password').trim();

        validado && api.post(URI, {
            usuario,
            password
        })
            .then((res) => {
                if (res.status === 201 || res.status === 200) {
                    setIsEmail(false);
                    setPassNoOk(false);
                    setAuth(res.data);
                    navigate('/inventario');
                }
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    if (error.response.data.message === 'Usuario no existe') {
                        setIsEmail(true);
                        setTextErrEmail(error.response.data.message);
                    } else if (error.response.data.message === 'Password incorrecto') {
                        setPassNoOk(true);
                        setTextErrPass(error.response.data.message);
                    }
                } else {
                    console.error("Error de conexión:", error.message);
                    setIsEmail(true);
                    setTextErrEmail("Error de conexión con el servidor.");
                }
            });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                padding: 2
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={0}
                    sx={{
                        padding: 4,
                        borderRadius: 4,
                        textAlign: 'center',
                        animation: `${fadeIn} 0.6s ease-out`,
                        backgroundColor: 'white'
                    }}
                >
                    <Typography
                        variant="h4"
                        component="div"
                        sx={{
                            mb: 1,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        📦 Inventario Informática
                    </Typography>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                        Bienvenido, por favor inicia sesión
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
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
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
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 4,
                                mb: 2,
                                height: 48,
                                fontSize: '1rem'
                            }}
                        >
                            Ingresar
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default LogIn;
