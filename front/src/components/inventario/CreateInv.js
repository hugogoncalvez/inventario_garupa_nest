import axios from "axios";
import { URI } from '../../config';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';


// import ShowMsg from './ShowMsg'
// import Alerta from './ShowAlert'



const CreateInv = () => {

    const navigate = useNavigate();

    const [componentes, setComponentes] = useState([])
    const [estados, setEstados] = useState([])
    const [areas, setAreas] = useState([])
    const [numInventario, setNumInventario] = useState('');

    useEffect(() => {
        getComponentes();
        getEstado()
        getAreas()
        getNextInvNumber();
    }, [])

    const getNextInvNumber = async () => {
        const res = await axios.get(`${URI}/inventario/next`);
        setNumInventario(res.data.nextInvNumber);
    };

    const getComponentes = async () => {
        const res = await axios.get(`${URI}/tipos`);

        setComponentes(res.data);
    }
    const getEstado = async () => {
        const res = await axios.get(`${URI}/estado`);

        setEstados(res.data);
    }

    const getAreas = async () => {
        const res = await axios.get(`${URI}/areas`);

        setAreas(res.data);
    }

    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('');
    const [area, setArea] = useState('');
    const [respArea, setRespArea] = useState('');

    const [errNumInv, setErrNumInv] = useState(false);
    const [errTipo, setErrTipo] = useState(false);
    const [errDesc, setErrDesc] = useState(false);
    const [errMarca, setErrMarca] = useState(false);
    const [errNumSerie, setErrNumSerie] = useState(false);
    const [errNumPc, setErrNumPC] = useState(false);
    const [errObs, setErrObs] = useState(false);
    const [errArea, setErrArea] = useState(false);
    const [errEstado, setErrEstado] = useState(false);
    const [errUsuario, setErrUsuario] = useState(false)





    const validate = (data) => {
        let respuesta = {}
        respuesta.numInv = new RegExp(/[a-z/0-9]/i).test(numInventario)
        respuesta.tipo = new RegExp(/[a-z]/i).test(data.tipo)
        respuesta.descrip = new RegExp(/[a-z]/i).test(data.get('descrip'))
        respuesta.marca = new RegExp(/[a-z]/i).test(data.get('marca'))
        respuesta.numSerie = new RegExp(/[a-z/0-9]/i).test(data.get('numSerie'))
        respuesta.numPc = new RegExp(/[a-z/0-9]/i).test(data.get('numPC'))
        respuesta.obs = new RegExp(/[a-z]/i).test(data.get('obs'))
        respuesta.area = (typeof data.area === 'undefined') ? false : new RegExp(/[a-z]/i).test(data.area)
        respuesta.estado = new RegExp(/[a-z]/i).test(data.estado)
        respuesta.usuario = new RegExp(/[a-z]/i).test(data.get('usuario'))

        setErrNumInv(!respuesta.numInv);
        setErrTipo(!respuesta.tipo);
        setErrDesc(!respuesta.descrip);
        setErrMarca(!respuesta.marca);
        setErrNumSerie(!respuesta.numSerie);
        setErrNumPC(!respuesta.numPc);
        setErrObs(!respuesta.obs);
        setErrArea(!respuesta.area);
        setErrEstado(!respuesta.estado);
        setErrUsuario(!respuesta.usuario);

        return Object.values(respuesta).every(x => x === true)
    }

    const handleChangeTipo = (event) => {
        setTipo(event.target.value)
    }
    const handleChangeEstado = (event) => {
        setEstado(event.target.value)
    }
    const handleChangeArea = (event) => {
        setArea(event.target.value)
        setRespArea(event.target.value.responsable)
    }

    // procedimiento para guardar

    const handleSubmit = async (event) => {


        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.tipo = tipo;
        data.estado = estado;
        data.area = area.area
        data.responsable = respArea



        let validado = validate(data)

        validado && await axios.post(`${URI}/inventario/create`, {
            num_inventario: numInventario.trim(),
            num_pc: data.get('numPC').trim(),
            tipo: data.tipo,
            descripcion: data.get('descrip').trim(),
            marca: data.get('marca').trim(),
            num_serie: data.get('numSerie').trim(),
            observaciones: data.get('obs').trim(),
            area: data.area,
            resp_area: data.responsable,
            estado: data.estado,
            usuario: data.get('usuario').trim()
        });
        validado && navigate('/inventario/');
    }


    return (

        <Container component='main' maxWidth='md' sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5">
                Carga de Inventario
            </Typography>
            <Box component='form' noValidate onSubmit={handleSubmit} sx={{ "& .MuiTextField-root": { m: 2, width: "40ch" } }}>

                <TextField
                    name="Num_Inv"
                    required
                    id="outlined-required"
                    label="Nº Inventario"
                    autoFocus
                    error={errNumInv}
                    helperText='Ingrese Nº inventario'
                    value={numInventario}
                    onChange={(e) => setNumInventario(e.target.value)}
                />
                <TextField
                    id="outlined-select-currenc"
                    required
                    select
                    label="Componentes"
                    value={tipo}
                    onChange={handleChangeTipo}
                    helperText="Seleccione un componente"
                    error={errTipo}
                >
                    {(componentes || []).map((e) => {
                        return <MenuItem key={e.id} value={e.tipo}>{e.tipo}</MenuItem>
                    })}
                </TextField>
                <TextField
                    name="descrip"
                    id="outlined-multiline-static"
                    required
                    label="Descripcion"
                    multiline
                    rows={4}
                    error={errDesc}
                    helperText='Ingrese la descripcion'
                />
                <TextField
                    name="marca"
                    required
                    id="outlined-required"
                    label="Marca"
                    error={errMarca}
                    helperText='Ingrese la marca'
                />
                <TextField
                    name="numSerie"
                    required
                    id="outlined-required"
                    label="Nº Serie"
                    error={errNumSerie}
                    helperText='Ingrese Nº serie'
                    defaultValue="No posee"
                />
                <TextField
                    name="numPC"
                    required
                    id="outlined-required"
                    label="Nº PC"
                    error={errNumPc}
                    helperText='Ingrese Nº PC'
                    defaultValue="Ninguno"
                />
                <TextField
                    name="obs"
                    required
                    id="outlined-required"
                    label="Observaciones"
                    error={errObs}
                    helperText='Ingrese una observacion'
                    defaultValue="Ninguna"
                />
                <TextField
                    name="usuario"
                    required
                    id="outlined-required"
                    label="Usuario"
                    error={errUsuario}
                    helperText='Ingrese el usuario'
                    defaultValue="Ninguno"
                />
                <TextField
                    id="outlined-select-currenc"
                    required
                    select
                    label="Estado"
                    value={estado}
                    onChange={handleChangeEstado}
                    helperText="Seleccione un estado"
                    error={errEstado}
                >
                    {(estados || []).map((e) => {
                        return <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>
                    })}
                </TextField>
                <TextField
                    id="outlined-select-currenc"
                    required
                    select
                    label="Area"
                    value={area}
                    onChange={handleChangeArea}
                    helperText="Seleccione un area"
                    error={errArea}
                    defaultValue='ninguna'
                >
                    {(areas || []).map((e) => {
                        return <MenuItem key={e.id} value={e}>{e.area + ' - ' + e.responsable}</MenuItem>
                    })}
                </TextField>
                <div></div>
                <Button
                    onClick={() => navigate('/inventario/')}
                    variant="contained"
                    sx={{ mr: 10 }}
                    disabled={false}
                    size="large"
                    startIcon={<CancelIcon />}
                    color='error'
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    //sx={{ mt: 5 }}
                    disabled={false}
                    size="large"
                    startIcon={<SaveOutlinedIcon />}
                >
                    Guardar
                </Button>
            </Box>
        </Container>)
}


export default CreateInv;