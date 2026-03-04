import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios';
import { URI } from '../../config';
import Typography from '@mui/material/Typography';
import ConfirDialog from '../dialogs/ShowConfirm'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TablePagination from '@mui/material/TablePagination';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Tooltip from '@mui/material/Tooltip';


export const ConfigAreas = () => {


    // Data State
    const [areas, setAreas] = useState([])
    // Form State
    const [id, setId] = useState('')
    const [descrip, setDescrip] = useState('')
    const [resp, setResp] = useState('')
    const [isUpdate, setIsUpdate] = useState(false)
    // Error State
    const [errDescrip, setErrDescrip] = useState(false)
    const [errResp, setErrResp] = useState(false)
    // Dialog State
    const [open, setOpen] = useState(false)
    // Filter State
    const [filterArea, setFilterArea] = useState('');
    const [filterResponsable, setFilterResponsable] = useState('');
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // estilos de la tabla
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: '#4F4F4F',
            color: theme.palette.common.white,
            fontSize: 18,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
            borderRight: '1px solid #E0E0E0',
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    }));

    const getAreas = useCallback(async () => {
        const res = await axios.get(`${URI}/areas`);
        setAreas(res.data);
    }, [setAreas]); // setAreas es estable, URI es constante

    useEffect(() => {
        getAreas();
    }, [getAreas]) // Agrega getAreas a las dependencias de useEffect

    // Filtering Logic
    const filteredAreas = useMemo(() => {
        let filtered = areas;
        if (filterArea) {
            filtered = filtered.filter(a => a.area.toLowerCase().includes(filterArea.toLowerCase()));
        }
        if (filterResponsable) {
            filtered = filtered.filter(a => a.responsable && a.responsable.toLowerCase().includes(filterResponsable.toLowerCase()));
        }
        return filtered;
    }, [areas, filterArea, filterResponsable]);

    useEffect(() => {
        setPage(0);
    }, [filteredAreas.length]);

    // Pagination Handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Form Handlers
    const handleChangeDescrip = (event) => {
        setDescrip(event.target.value);
    };

    const handleChangeResp = (event) => {
        setResp(event.target.value);
    };

    // Dialog Handlers
    const handleClose = (value) => {
        setOpen(false);
        value && deleteAreas();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id)
    };

    const validate = (data) => {
        let respuesta = {}
        respuesta.descrip = new RegExp(/[a-z]/i).test(data.descrip)
        respuesta.resp = new RegExp(/[a-z]/i).test(data.resp)

        setErrDescrip(!respuesta.descrip);
        setErrResp(!respuesta.resp);

        return Object.values(respuesta).every(x => x === true)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = [];
        data.descrip = (descrip).trim()
        data.resp = (resp).trim()

        let validado = validate(data)

        if (validado) {
            if (isUpdate) {
                await axios.put(`${URI}/areas/${id}`, {
                    area: data.descrip,
                    responsable: data.resp,
                });
            } else {
                await axios.post(`${URI}/areas/create`, {
                    area: data.descrip,
                    responsable: data.resp,
                });
            }
            setIsUpdate(false);
            getAreas();
            setDescrip('');
            setResp('');
        }
    }

    const deleteAreas = async () => {
        await axios.delete(`${URI}/areas/${id}`)
        getAreas();
    }

    const clearFilters = () => {
        setFilterArea('');
        setFilterResponsable('');
    };

    return (
        <>
            <Container component='main' maxWidth='md' sx={{ mt: 10 }}>
                <Typography component="h1" variant="h5">
                    Agregar Areas Municipales
                </Typography>
                <Box component='form' noValidate onSubmit={handleSubmit} sx={{ "& .MuiTextField-root": { m: 2, width: "40ch" } }}>

                    <TextField
                        name="Descripcion"
                        required
                        id="outlined-required"
                        label="Descripción"
                        autoFocus
                        value={descrip || ''}
                        onChange={handleChangeDescrip}
                        error={errDescrip}
                        helperText='Ingrese el area'
                    />
                    <TextField
                        id="outlined-select-currenc"
                        required
                        label="Responsable"
                        value={resp || ''}
                        onChange={handleChangeResp}
                        helperText="Ingrese responsable"
                        error={errResp}
                    ></TextField>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ mb: 2 }}
                        disabled={false}
                        size="large"
                        startIcon={<SaveOutlinedIcon />}
                    >
                        {isUpdate ? 'Actualizar' : 'Guardar'}
                    </Button>
                </Box>
            </Container>
            <Divider />
            <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 2 }}>
                Areas Municipales
            </Typography>
            <Container>
                <TextField
                    name="Filtro_Area"
                    label="Filtrar por Area"
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    helperText='Ingrese Area'
                    sx={{ m: 1 }}
                />
                <TextField
                    name="Filtro_Responsable"
                    label="Filtrar por Responsable"
                    value={filterResponsable}
                    onChange={(e) => setFilterResponsable(e.target.value)}
                    helperText='Ingrese Responsable'
                    sx={{ m: 1 }}
                />
                <Button
                    variant="contained"
                    sx={{
                        m: 2, backgroundColor: '#446A46',
                        '&:hover': {
                            backgroundColor: '#2f5731',
                        },
                    }}
                    onClick={clearFilters}
                    startIcon={<ClearAllIcon />}
                >
                    Limpiar
                </Button>
            </Container>
            <ConfirDialog
                open={open}
                onClose={handleClose}
            />
            <Paper>
                <TableContainer>
                    <Table stickyHeader sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Descripción</StyledTableCell>
                                <StyledTableCell align='center'>Responsable</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAreas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell align='center'>{row.area}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.responsable}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar">
                                            <IconButton aria-label="edit" onClick={() => { setId(row.id); setDescrip(row.area); setResp(row.responsable); setIsUpdate(true) }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar">
                                            <IconButton aria-label="delete" onClick={() => handleClickOpen(row.id)}>
                                                <DeleteForeverIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredAreas.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    )
}
