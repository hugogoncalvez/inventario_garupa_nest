import axios from "axios";
import { URI } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';



const EditInv = () => {

    const navigate = useNavigate();

    const [componentes, setComponentes] = useState([])
    const [estados, setEstados] = useState([])
    const [areas, setAreas] = useState([])

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

    const handleChangeTipo = (event) => {
        setTipo(event.target.value)
    }
    const handleChangeEstado = (event) => {
        setEstado(prev => event.target.value)
    }
    const handleChangeArea = (event) => {
        setArea(event.target.value)
        setRespArea(event.target.value.substring(event.target.value.indexOf('-') + 1))
    }

    const [numInventario, setNumInventario] = useState('')
    const [descripcion, setdescripcion] = useState('')
    const [marca, setMarca] = useState('')
    const [numSerie, setNumSerie] = useState('')
    const [numPc, setNumPc] = useState('')
    const [obs, setObs] = useState('')
    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('');
    const [area, setArea] = useState('');
    const [respArea, setRespArea] = useState('')
    const [usuario, setUsuario] = useState('');

    useEffect(() => {
        getComponentes();
        getEstado()
        getAreas()
        getInvById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getInvById = async () => {
        const res = await axios.get(`${URI}/inventario/${id}`);

        setNumInventario(res.data.num_inventario)
        setdescripcion(res.data.descripcion)
        setMarca(res.data.marca)
        setNumSerie(res.data.num_serie)
        setNumPc(res.data.num_pc)
        setObs(res.data.observaciones)
        setTipo(res.data.tipo)
        setEstado(res.data.estado)
        setArea(res.data.area + ' - ' + res.data.resp_area)
        setRespArea(res.data.resp_area)
        setUsuario(res.data.usuario)
    };



    const [errNumInv, setErrNumInv] = useState(false);
    const [errTipo, setErrTipo] = useState(false);
    const [errDesc, setErrDesc] = useState(false);
    const [errMarca, setErrMarca] = useState(false);
    const [errNumSerie, setErrNumSerie] = useState(false);
    const [errNumPc, setErrNumPc] = useState(false)
    const [errObs, setErrObs] = useState(false);
    const [errArea, setErrArea] = useState(false);
    const [errEstado, setErrEstado] = useState(false);
    const [ErrUsuario, setErrUsuario] = useState(false);




    const validate = () => {
        let respuesta = {}
        respuesta.numInv = new RegExp(/[a-z/0-9]/i).test(numInventario.trim())
        respuesta.tipo = new RegExp(/[a-z]/i).test(tipo)
        respuesta.descrip = new RegExp(/[a-z]/i).test(descripcion.trim())
        respuesta.marca = new RegExp(/[a-z]/i).test(marca.trim())
        respuesta.numSerie = new RegExp(/[a-z/0-9]/i).test(numSerie.trim())
        respuesta.numPc = new RegExp(/[a-z/0-9]/i).test(numPc)
        respuesta.obs = new RegExp(/[a-z]/i).test(obs.trim())
        respuesta.area = new RegExp(/[a-z]/i).test(area)
        respuesta.usuario = new RegExp(/[a-z]/i).test(usuario)
        respuesta.estado = new RegExp(/[a-z]/i).test(estado)

        setErrNumInv(!respuesta.numInv);
        setErrTipo(!respuesta.tipo);
        setErrDesc(!respuesta.descrip);
        setErrMarca(!respuesta.marca);
        setErrNumSerie(!respuesta.numSerie);
        setErrNumPc(!respuesta.numPc);
        setErrObs(!respuesta.obs);
        setErrArea(!respuesta.area);
        setErrEstado(!respuesta.estado);
        setErrUsuario(!respuesta.usuario);



        return Object.values(respuesta).every(x => x === true)
    }

    const { id } = useParams();

    // procedimeinto para editar el Blog

    const update = async (event) => {
        event.preventDefault()

        let validado = validate()



        validado && await axios.put(`${URI}/inventario/${id}`, {

            num_inventario: numInventario,
            num_pc: numPc,
            tipo: tipo,
            descripcion: descripcion.trim(),
            marca: marca.trim(),
            num_serie: numSerie.trim(),
            observaciones: obs.trim(),
            area: (area.substring(0, (area.indexOf('-') - 1))).trim(),
            resp_area: respArea.trim(),
            estado: estado,
            usuario: usuario
        }
        );
        validado && navigate('/inventario');
    };




    return (
        <Container component='main' maxWidth='md' sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5">
                Editar de Inventario
            </Typography>
            <Box component='form' noValidate onSubmit={update} sx={{ "& .MuiTextField-root": { m: 2, width: "40ch" } }}>

                <TextField
                    name="Num_Inv"
                    required
                    id="outlined-required"
                    label="Nº Inventario"
                    error={errNumInv}
                    helperText='Ingrese Nº inventario'
                    value={numInventario || ''}
                    onChange={(e) => setNumInventario(e.target.value)}
                    autoComplete="off"
                />
                <TextField
                    id="outlined-select-currenc"
                    required
                    select
                    label="Componentes"
                    value={tipo || ''}
                    onChange={handleChangeTipo}
                    helperText="Seleccione un componente"
                    error={errTipo}
                    SelectProps={{
                        renderValue: (value) => value
                    }}
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
                    value={descripcion || ''}
                    onChange={(e) => setdescripcion(e.target.value)}
                    autoComplete="off"

                />
                <TextField
                    name="marca"
                    required
                    id="outlined-required"
                    label="Marca"
                    error={errMarca}
                    helperText='Ingrese la marca'
                    value={marca || ''}
                    onChange={(e) => setMarca(e.target.value)}
                    autoComplete="off"

                />
                <TextField
                    name="numSerie"
                    required
                    id="outlined-required"
                    label="Nº Serie"
                    error={errNumSerie}
                    helperText='Ingrese Nº serie'
                    value={numSerie || ''}
                    onChange={(e) => setNumSerie(e.target.value)}
                    autoComplete="off"
                />
                <TextField
                    name="numPC"
                    required
                    id="outlined-required"
                    label="Nº PC"
                    error={errNumPc}
                    value={numPc || ''}
                    onChange={(e) => setNumPc(e.target.value)}
                    helperText='Ingrese Nº PC'
                    autoComplete="off"

                />
                <TextField
                    name="obs"
                    required
                    id="outlined-required"
                    label="Observaciones"
                    error={errObs}
                    helperText='Ingrese una observacion'
                    value={obs || ''}
                    onChange={(e) => setObs(e.target.value)}
                    autoComplete="off"

                />
                <TextField
                    id="outlined-select-currenc"
                    required
                    select
                    label="Estado"
                    value={estado || ''}
                    onChange={handleChangeEstado}
                    helperText="Seleccione un estado"
                    error={errEstado}
                >
                    {(estados || []).map((e) => {
                        return <MenuItem key={e.id} value={e.estado}>{e.estado}</MenuItem>
                    })}
                </TextField>
                <TextField
                    name="usuario"
                    required
                    id="outlined-required"
                    label="Usuario"
                    error={ErrUsuario}
                    helperText='Ingrese el usuario'
                    value={usuario || ''}
                    onChange={(e) => setUsuario(e.target.value)}
                    autoComplete="off"
                />
                <TextField
                    id="outlined-select-currenc"
                    required
                    select
                    label="Area"
                    onChange={handleChangeArea}
                    helperText="Seleccione un area"
                    error={errArea}
                    value={area || ''}
                >
                    {(areas || []).map((e) => {
                        return <MenuItem key={e.id} value={e.area + ' - ' + e.responsable}>{e.area + ' - ' + e.responsable}</MenuItem>
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
                    variant="contained"
                    // sx={{ mt: 5 }}
                    disabled={false}
                    size="large"
                    startIcon={<SaveOutlinedIcon />}
                >
                    Guardar
                </Button>
            </Box>
        </Container>)

}

export default EditInv;