import api, { URI } from '../../config.js';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TablePagination from '@mui/material/TablePagination';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Stack } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ConfirmDialog from '../dialogs/ShowConfirm';

// estilos de la tabla
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 14,
        fontWeight: 600,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export const ConfigComponentes = () => {
    // Data State
    const [tipos, setTipos] = useState([]);
    // Form State
    const [id, setId] = useState('');
    const [tipo, setTipo] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    // Error State
    const [errTipo, setErrTipo] = useState(false);
    // Dialog State
    const [open, setOpen] = useState(false);
    // Filter State
    const [filterTipo, setFilterTipo] = useState('');
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getTipos = useCallback(async () => {
        try {
            const res = await api.get(`${URI}/tipos`);
            setTipos(res.data);
        } catch (error) {
            console.error("Error al obtener los tipos:", error);
        }
    }, []);

    useEffect(() => {
        getTipos();
    }, [getTipos]);

    const filteredTipos = useMemo(() => {
        return tipos.filter(t => 
            (filterTipo === '' || (t.tipo && t.tipo.toLowerCase().includes(filterTipo.toLowerCase())))
        );
    }, [tipos, filterTipo]);

    useEffect(() => {
        setPage(0);
    }, [filteredTipos.length]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClose = (value) => {
        setOpen(false);
        value && deleteTipos();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const validate = () => {
        const isValid = tipo.trim().length > 0;
        setErrTipo(!isValid);
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        try {
            const payload = { tipo: tipo.trim() };
            if (isUpdate) {
                await api.put(`${URI}/tipos/${id}`, payload);
            } else {
                await api.post(`${URI}/tipos/create`, payload);
            }
            setIsUpdate(false);
            setId(''); setTipo('');
            getTipos();
        } catch (error) {
            console.error("Error al guardar el tipo:", error);
        }
    };

    const deleteTipos = async () => {
        try {
            await api.delete(`${URI}/tipos/${id}`);
            getTipos();
        } catch (error) {
            console.error("Error al eliminar el tipo:", error);
        }
    };

    const handleEditClick = (row) => {
        setId(row.id);
        setTipo(row.tipo || '');
        setIsUpdate(true);
        setErrTipo(false);
    };

    const clearFilters = () => {
        setFilterTipo('');
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Configuración de Componentes
                </Typography>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            <Grid container spacing={3}>
                {/* Formulario */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" mb={2}>
                                {isUpdate ? 'Editar Componente' : 'Nuevo Componente'}
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Nombre del Componente"
                                        required
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        error={errTipo}
                                        helperText={errTipo && 'El nombre es requerido'}
                                        fullWidth
                                        size="small"
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        startIcon={<SaveOutlinedIcon />}
                                    >
                                        {isUpdate ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                    {isUpdate && (
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => {
                                                setIsUpdate(false); setId(''); setTipo('');
                                                setErrTipo(false);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Listado y Filtros */}
                <Grid item xs={12} md={8}>
                    {/* Panel de Filtros */}
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <FilterAltIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight="600">Filtros de Búsqueda</Typography>
                            </Box>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={9}>
                                    <TextField label="Buscar por Nombre" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
                                    <Button variant="text" color="secondary" startIcon={<ClearAllIcon />} onClick={clearFilters} fullWidth size="small" sx={{ height: 40 }}>
                                        Limpiar
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: '60vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Descripción del Componente</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTipos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <StyledTableRow key={row.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 600 }}>{row.tipo}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleEditClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleClickOpen(row.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                                </Stack>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                    {filteredTipos.length === 0 && (
                                        <StyledTableRow>
                                            <StyledTableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No se encontraron componentes.
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredTipos.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
