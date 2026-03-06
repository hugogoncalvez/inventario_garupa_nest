import api, { URI as BASE_URI } from '../config.js';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const URI = `${BASE_URI}/auth/login`;

const theme = createTheme();
//const varPdf = 'esto es pasado por variable'





const LogIn = () => {

    const { setAuth } = useAuth();

    // desabilita el boton back del navegador

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.go(0);
    }


    const [passNoOk, setPassNoOk] = useState(false)
    const [isEmail, setIsEmail] = useState(false)
    const [textErrPass, setTextErrPass] = useState('La contraña debe tener 6 caracteres como mínimo')
    const [textErrEmail, setTextErrEmail] = useState('')

    const navigate = useNavigate();

    const validate = (data) => {
        let respuesta = {}

        respuesta.email = new RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i).test(data.get('email'))
        respuesta.password = data.get('password').length >= 6 ? true : false


        setIsEmail(!respuesta.email);
        setPassNoOk(!respuesta.password);

        !respuesta.email && setTextErrEmail('Ingrese un email válido')


        return Object.values(respuesta).every(x => x === true)
    }



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
                console.log(res.data)

                if (res.status === 201 || res.status === 200) {
                    setIsEmail(false);
                    setPassNoOk(false);
                    setAuth(res.data);
                    navigate('/inventario');
                } else {
                    setIsEmail(true);
                    setTextErrEmail(res.data.msgError || 'Error desconocido');
                }
            })
            .catch((error) => {
                // Capturamos el error 401 que devuelve NestJS si existe respuesta
                if (error.response && error.response.data) {
                    if (error.response.data.message === 'Usuario no existe') {
                        setIsEmail(true)
                        setTextErrEmail(error.response.data.message)
                    } else if (error.response.data.message === 'Password incorrecto') {
                        setPassNoOk(true)
                        setTextErrPass(error.response.data.message)
                    }
                } else {
                    console.error("Error de red o CORS:", error.message);
                    setIsEmail(true);
                    setTextErrEmail("Error de conexión con el servidor. Verifique CORS.");
                }
            });
    };



    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                        <AccountCircleIcon fontSize='large' />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Ingresar
                    </Typography>


                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            error={isEmail}
                            helperText={isEmail && textErrEmail}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            error={passNoOk}
                            helperText={passNoOk && textErrPass}
                        />
                        {/* <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        /> */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Ingresar
                        </Button>
                        {/* <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            onClick={(e)=> Pdf(varPdf)}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            pdf
                        </Button> */}
                        <Grid container>
                            {/* <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid> */}
                            {/* <Grid item xs>
                                <Link href="/register" variant="body2">
                                    {"No tienes una cuenta? Registrate"}
                                </Link>
                            </Grid> */}
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default LogIn