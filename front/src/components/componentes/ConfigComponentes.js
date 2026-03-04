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


export const ConfigComponentes = () => {


    // Data State
    const [tipos, setTipos] = useState([])
    // Form State
    const [id, setId] = useState('')
    const [tipo, setTipo] = useState('')
    const [isUpdate, setIsUpdate] = useState(false)
    // Error State
    const [errTipo, setErrTipo] = useState(false)
    // Dialog State
    const [open, setOpen] = useState(false)
    // Filter State
    const [filterTipo, setFilterTipo] = useState('');
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

    const getTipos = useCallback(async () => {
        const res = await axios.get(`${URI}/tipos`);
        setTipos(res.data);
    }, [setTipos]);

    useEffect(() => {
        getTipos()
    }, [getTipos])

    // Filtering Logic
    const filteredTipos = useMemo(() => {
        let filtered = tipos;
        if (filterTipo) {
            filtered = filtered.filter(t => t.tipo.toLowerCase().includes(filterTipo.toLowerCase()));
        }
        return filtered;
    }, [tipos, filterTipo]);

    useEffect(() => {
        setPage(0);
    }, [filteredTipos.length]);

    // Pagination Handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Form Handlers
    const handleChange = (event) => {
        setTipo(event.target.value);
    };

    // Dialog Handlers
    const handleClose = (value) => {
        setOpen(false);
        value && deletetipos();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id)
    };

    const validate = (data) => {
        const isValid = data.tipo && data.tipo.length > 0 && new RegExp(/[a-z]/i).test(data.tipo);
        setErrTipo(!isValid);
        return isValid;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = { tipo: tipo.trim() };

        if (validate(data)) {
            if (isUpdate) {
                await axios.put(`${URI}/tipos/${id}`, {
                    tipo: data.tipo,
                });
            } else {
                await axios.post(`${URI}/tipos/create`, {
                    tipo: data.tipo,
                });
            }
            setIsUpdate(false);
            setTipo('');
            getTipos();
        }
    }

    const deletetipos = async () => {
        await axios.delete(`${URI}/tipos/${id}`)
        getTipos();
    }

    const clearFilters = () => {
        setFilterTipo('');
    };

    return (
        <>
            <Container component='main' maxWidth='md' sx={{ mt: 10 }}>
                <Typography component="h1" variant="h5">
                    Agregar Componentes
                </Typography>
                <Box component='form' noValidate onSubmit={handleSubmit} sx={{ "& .MuiTextField-root": { m: 2, width: "40ch" } }}>

                    <TextField
                        name="tipos"
                        required
                        id="outlined-required"
                        label="Componente"
                        autoFocus
                        value={tipo || ''}
                        onChange={handleChange}
                        error={errTipo}
                        helperText='Ingrese el nombre del componente'
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3, ml: 2 }}
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
                Componentes de Hardware
            </Typography>
            <Container>
                <TextField
                    name="Filtro_Tipo"
                    label="Filtrar por Componente"
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    helperText='Ingrese Componente'
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
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTipos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell align='center'>{row.tipo}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar">
                                            <IconButton aria-label="edit" onClick={() => { setId(row.id); setTipo(row.tipo); setIsUpdate(true) }}>
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
                    count={filteredTipos.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    )
}
