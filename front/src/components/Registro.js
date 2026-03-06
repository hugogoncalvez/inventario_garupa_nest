import api, { URI } from '../config.js';
import React, { useState } from 'react';


import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import ShowMsg from './dialogs/ShowMsg'
import Alerta from './dialogs/ShowAlert'



import { URI as BASE_URI } from '../config';
const URI = `${BASE_URI}/register`;

const theme = createTheme();



export const SignUp = () => {

    const [usuCreado, setUsuCreado] = useState(null)
    const [errNom, setErrNom] = useState(false)
    const [errApe, setErrApe] = useState(false)
    const [isEmail, setIsEmail] = useState(false)
    const [textErrEmail, setTextErrEmail] = useState('')
    const [passOk, setPassOk] = useState(false)
    const [msgError, setMsgError] = useState('')



    const validate = (data) => {
        let respuesta = {}
        respuesta.nombre = new RegExp(/[a-z]/i).test(data.get('nombre'))
        respuesta.apellido = new RegExp(/[a-z]/i).test(data.get('apellido'))
        respuesta.email = new RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i).test(data.get('email'))
        respuesta.password = data.get('password').length >= 6 ? true : false

        setErrNom(!respuesta.nombre);
        setErrApe(!respuesta.apellido);
        setIsEmail(!respuesta.email);
        setPassOk(!respuesta.password);

        !respuesta.email && setTextErrEmail(prev => 'Ingrese un email válido')


        return Object.values(respuesta).every(x => x === true)
    }


    const handleSubmit = (event) => {
        setUsuCreado(prev => null)
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        let validado = validate(data)

        validado && api.post(URI, {
            nombre: data.get('nombre').trim(),
            apellido: data.get('apellido').trim(),
            usuario: data.get('email').trim(),
            password: data.get('password').trim(),
        })
            .then((res) => {

                if (res.statusText === 'OK' && res.data.msgError === '') {

                    setUsuCreado(prev => true)

                } else {
                    setUsuCreado(prev => false)
                    setIsEmail(prev => true)
                    setTextErrEmail(prev => 'El email ya esta en uso')

                    setMsgError(prev => res.data.msgError)

                }
            })
            .catch((err) => {
                setUsuCreado(prev => false)
            });
    };


    const renderContent = React.useCallback(() => {
        switch (usuCreado) {
            case true:
                return <ShowMsg msg='Usuario creado correctamente.' ruta='/' error={false} titulo='Nuevo Usuario' color='green' />;

            case false:
                return <ShowMsg msg='El usuario no ha podido crearse.' ruta='#' error={true} titulo='Nuevo Usuario' color='red' msgErr={msgError} />;

            default:
                return null;

        }
    }, [msgError, usuCreado]);

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                {renderContent()}
                <Alerta />
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
                        <PersonAddAltIcon fontSize='large' />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Crear Usuario
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="nombre"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="Nombre"
                                    autoFocus
                                    error={errNom}
                                    helperText={errNom && 'Ingrese su nombre'}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="apellido"
                                    label="Apellido"
                                    name="apellido"
                                    autoComplete="family-name"
                                    error={errApe}
                                    helperText={errApe && 'Ingrese su apellido'}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Usuario: Email"
                                    name="email"
                                    autoComplete="email"
                                    error={isEmail}
                                    helperText={isEmail && textErrEmail}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    error={passOk}
                                    helperText={passOk && 'La contraña debe tener 6 caracteres como mínimo'}
                                />
                            </Grid>

                            <Grid item xs={12}>

                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={false}
                        >
                            Registrar
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/" variant="body2">
                                    Ya tienes una cuenta? Ingresar
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default SignUp;