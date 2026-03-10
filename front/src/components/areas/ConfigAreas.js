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

export const ConfigAreas = () => {
    // Data State
    const [areas, setAreas] = useState([]);
    // Form State
    const [id, setId] = useState('');
    const [descrip, setDescrip] = useState('');
    const [resp, setResp] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    // Error State
    const [errDescrip, setErrDescrip] = useState(false);
    const [errResp, setErrResp] = useState(false);
    // Dialog State
    const [open, setOpen] = useState(false);
    // Filter State
    const [filterArea, setFilterArea] = useState('');
    const [filterResponsable, setFilterResponsable] = useState('');
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getAreas = useCallback(async () => {
        try {
            const res = await api.get(`${URI}/areas`);
            setAreas(res.data);
        } catch (error) {
            console.error("Error al obtener las áreas:", error);
        }
    }, []);

    useEffect(() => {
        getAreas();
    }, [getAreas]);

    const filteredAreas = useMemo(() => {
        return areas.filter(a => 
            (filterArea === '' || (a.area && a.area.toLowerCase().includes(filterArea.toLowerCase()))) &&
            (filterResponsable === '' || (a.responsable && a.responsable.toLowerCase().includes(filterResponsable.toLowerCase())))
        );
    }, [areas, filterArea, filterResponsable]);

    useEffect(() => {
        setPage(0);
    }, [filteredAreas.length]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClose = (value) => {
        setOpen(false);
        value && deleteAreas();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const validate = () => {
        const isDescValid = descrip.trim().length > 0;
        const isRespValid = resp.trim().length > 0;
        setErrDescrip(!isDescValid);
        setErrResp(!isRespValid);
        return isDescValid && isRespValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        try {
            const payload = { area: descrip.trim(), responsable: resp.trim() };
            if (isUpdate) {
                await api.put(`${URI}/areas/${id}`, payload);
            } else {
                await api.post(`${URI}/areas/create`, payload);
            }
            setIsUpdate(false);
            setId(''); setDescrip(''); setResp('');
            getAreas();
        } catch (error) {
            console.error("Error al guardar el área:", error);
        }
    };

    const deleteAreas = async () => {
        try {
            await api.delete(`${URI}/areas/${id}`);
            getAreas();
        } catch (error) {
            console.error("Error al eliminar el área:", error);
        }
    };

    const handleEditClick = (row) => {
        setId(row.id);
        setDescrip(row.area || '');
        setResp(row.responsable || '');
        setIsUpdate(true);
        setErrDescrip(false);
        setErrResp(false);
    };

    const clearFilters = () => {
        setFilterArea('');
        setFilterResponsable('');
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Configuración de Áreas
                </Typography>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            <Grid container spacing={3}>
                {/* Formulario */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" mb={2}>
                                {isUpdate ? 'Editar Área' : 'Nueva Área'}
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Nombre del Área"
                                        required
                                        value={descrip}
                                        onChange={(e) => setDescrip(e.target.value)}
                                        error={errDescrip}
                                        helperText={errDescrip && 'El nombre es requerido'}
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label="Responsable"
                                        required
                                        value={resp}
                                        onChange={(e) => setResp(e.target.value)}
                                        error={errResp}
                                        helperText={errResp && 'El responsable es requerido'}
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
                                                setIsUpdate(false); setId(''); setDescrip(''); setResp('');
                                                setErrDescrip(false); setErrResp(false);
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
                                <Grid item xs={12} sm={5}>
                                    <TextField label="Buscar por Área" value={filterArea} onChange={(e) => setFilterArea(e.target.value)} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField label="Buscar por Responsable" value={filterResponsable} onChange={(e) => setFilterResponsable(e.target.value)} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12} sm={2} display="flex" justifyContent="flex-end">
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
                                        <StyledTableCell>Descripción del Área</StyledTableCell>
                                        <StyledTableCell>Responsable</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAreas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <StyledTableRow key={row.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 600 }}>{row.area}</StyledTableCell>
                                            <StyledTableCell>{row.responsable}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleEditClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleClickOpen(row.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                                </Stack>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                    {filteredAreas.length === 0 && (
                                        <StyledTableRow>
                                            <StyledTableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No se encontraron áreas con esos criterios.
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredAreas.length}
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
