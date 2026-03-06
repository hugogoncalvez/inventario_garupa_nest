import api, { URI } from '../../config.js';
import React, { useState, useEffect, useMemo } from 'react';


import Typography from '@mui/material/Typography';
import ConfirmDialog from '../dialogs/ShowConfirm'; // Asegúrate de que el nombre sea correcto
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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip


// estilos de la tabla (copiados de ShowInventario.js para consistencia)
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

// Componente personalizado para las acciones de paginación
function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                <FirstPageIcon />
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                <LastPageIcon />
            </IconButton>
        </Box>
    );
}


export const GestionImpresoras = () => {

    // Data State
    const [impresoras, setImpresoras] = useState([]);
    const [areas, setAreas] = useState([]); // Para el selector de áreas
    // Form State
    const [id, setId] = useState('');
    const [modelo, setModelo] = useState('');
    const [marca, setMarca] = useState('');
    const [areaId, setAreaId] = useState(''); // area_id para el formulario
    const [isUpdate, setIsUpdate] = useState(false);
    // Error State (simplificado por ahora)
    const [errModelo, setErrModelo] = useState(false);
    // Dialog State
    const [open, setOpen] = useState(false);
    // Filter State
    const [filterModelo, setFilterModelo] = useState('');
    const [filterMarca, setFilterMarca] = useState('');
    const [filterAreaName, setFilterAreaName] = useState('');
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    useEffect(() => {
        getImpresoras();
        getAreas();
    }, []);

    const getImpresoras = async () => {
        try {
            const res = await api.get(`${URI}/tintas/impresoras`);
            setImpresoras(res.data);
        } catch (error) {
            console.error("Error al obtener las impresoras:", error);
        }
    };

    const getAreas = async () => {
        try {
            const res = await api.get(`${URI}/areas`);
            setAreas(res.data);
        } catch (error) {
            console.error("Error al obtener las áreas:", error);
        }
    };

    // Filtering Logic
    const filteredImpresoras = useMemo(() => {
        let filtered = impresoras;
        if (filterModelo) {
            filtered = filtered.filter(imp => imp.modelo.toLowerCase().includes(filterModelo.toLowerCase()));
        }
        if (filterMarca) {
            filtered = filtered.filter(imp => imp.marca && imp.marca.toLowerCase().includes(filterMarca.toLowerCase()));
        }
        if (filterAreaName) {
            filtered = filtered.filter(imp => imp.area && imp.area.area.toLowerCase().includes(filterAreaName.toLowerCase()));
        }
        return filtered;
    }, [impresoras, filterModelo, filterMarca, filterAreaName]);

    useEffect(() => {
        setPage(0);
    }, [filteredImpresoras.length]);

    // Pagination Handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Form Handlers
    const handleChangeModelo = (event) => setModelo(event.target.value);
    const handleChangeMarca = (event) => setMarca(event.target.value);
    const handleChangeAreaId = (event) => setAreaId(event.target.value);

    // Dialog Handlers
    const handleClose = (value) => {
        setOpen(false);
        value && deleteImpresora();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const validate = () => {
        let isValid = true;
        if (!modelo.trim()) {
            setErrModelo(true);
            isValid = false;
        } else {
            setErrModelo(false);
        }
        // Puedes añadir más validaciones aquí
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        try {
            const printerData = { modelo: modelo.trim(), marca: marca.trim(), area_id: areaId };
            if (isUpdate) {
                await api.put(`${URI}/tintas/impresoras/${id}`, printerData);
            } else {
                await api.post(`${URI}/tintas/impresoras`, printerData);
            }
            setIsUpdate(false);
            getImpresoras(); // Recargar la lista
            // Limpiar formulario
            setId('');
            setModelo('');
            setMarca('');
            setAreaId('');
        } catch (error) {
            console.error("Error al guardar la impresora:", error);
        }
    };

    const deleteImpresora = async () => {
        try {
            await api.delete(`${URI}/tintas/impresoras/${id}`);
            getImpresoras();
        } catch (error) {
            console.error("Error al eliminar la impresora:", error);
        }
    };

    const handleEditClick = (impresora) => {
        setId(impresora.id);
        setModelo(impresora.modelo);
        setMarca(impresora.marca);
        setAreaId(impresora.area_id || ''); // Asegurarse de que sea '' si es null
        setIsUpdate(true);
    };

    const clearFilters = () => {
        setFilterModelo('');
        setFilterMarca('');
        setFilterAreaName('');
    };


    return (
        <>
            <Container component='main' maxWidth='md' sx={{ mt: 10 }}>
                <Typography component="h1" variant="h5">
                    Gestión de Impresoras
                </Typography>
                <Box component='form' noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)' }}>
                            <TextField
                                name="modelo"
                                required
                                id="modelo-required"
                                label="Modelo"
                                autoFocus
                                value={modelo}
                                onChange={handleChangeModelo}
                                error={errModelo}
                                helperText={errModelo ? 'El modelo es requerido' : 'Ingrese el modelo de la impresora'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)' }}>
                            <TextField
                                name="marca"
                                id="marca-input"
                                label="Marca"
                                value={marca}
                                onChange={handleChangeMarca}
                                helperText='Ingrese la marca de la impresora'
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)' }}>
                            <TextField
                                select
                                name="area"
                                id="area-select"
                                label="Área"
                                value={areaId}
                                onChange={handleChangeAreaId}
                                helperText="Seleccione el área a la que pertenece"
                                fullWidth
                            >
                                <MenuItem value="">
                                    <em>Ninguna</em>
                                </MenuItem>
                                {(areas || []).map((a) => (
                                    <MenuItem key={a.id} value={a.id}>{a.area}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ mb: 2, mr: 2 }}
                                disabled={false}
                                size="large"
                                startIcon={<SaveOutlinedIcon />}
                            >
                                {isUpdate ? 'Actualizar' : 'Guardar'}
                            </Button>
                            {isUpdate && (
                                <Button
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                    onClick={() => {
                                        setIsUpdate(false);
                                        setId('');
                                        setModelo('');
                                        setMarca('');
                                        setAreaId('');
                                        setErrModelo(false);
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Container>
            <Divider />
            <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 2 }}>
                Listado de Impresoras
            </Typography>
            <Container>
                <TextField
                    name="Filtro_Modelo"
                    label="Filtrar por Modelo"
                    value={filterModelo}
                    onChange={(e) => setFilterModelo(e.target.value)}
                    helperText='Ingrese Modelo'
                    sx={{ m: 1 }}
                />
                <TextField
                    name="Filtro_Marca"
                    label="Filtrar por Marca"
                    value={filterMarca}
                    onChange={(e) => setFilterMarca(e.target.value)}
                    helperText='Ingrese Marca'
                    sx={{ m: 1 }}
                />
                <TextField
                    select
                    name="Filtro_AreaNombre"
                    label="Filtrar por Área"
                    value={filterAreaName}
                    onChange={(e) => setFilterAreaName(e.target.value)}
                    helperText="Seleccione el área"
                    sx={{ m: 1, minWidth: '22ch' }}
                >
                    <MenuItem value="">
                        <em>Todas</em>
                    </MenuItem>
                    {(areas || []).map((a) => (
                        <MenuItem key={a.id} value={a.area}>{a.area}</MenuItem>
                    ))}
                </TextField>
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
            <ConfirmDialog
                open={open}
                onClose={handleClose}
            />
            <Paper>
                <TableContainer>
                    <Table stickyHeader sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Modelo</StyledTableCell>
                                <StyledTableCell align='center'>Marca</StyledTableCell>
                                <StyledTableCell align='center'>Área</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredImpresoras.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell align='center'>{row.modelo}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.marca}</StyledTableCell>
                                    <StyledTableCell align='center'>{row.areas ? row.areas.area : 'N/A'}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Tooltip title="Editar">
                                            <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
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
                    count={filteredImpresoras.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>
        </>
    );
};
