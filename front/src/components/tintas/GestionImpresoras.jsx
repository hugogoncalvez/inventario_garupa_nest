import api, { URI } from '../../config.js';
import React, { useState, useEffect, useMemo } from 'react';
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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Card, CardContent, Stack, Divider } from '@mui/material';
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

function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;
    const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
    const handleBackButtonClick = (event) => onPageChange(event, page - 1);
    const handleNextButtonClick = (event) => onPageChange(event, page + 1);
    const handleLastPageButtonClick = (event) => onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}><FirstPageIcon /></IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0}><KeyboardArrowLeft /></IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}><KeyboardArrowRight /></IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}><LastPageIcon /></IconButton>
        </Box>
    );
}

export const GestionImpresoras = () => {
    const [impresoras, setImpresoras] = useState([]);
    const [areas, setAreas] = useState([]);
    const [id, setId] = useState('');
    const [modelo, setModelo] = useState('');
    const [marca, setMarca] = useState('');
    const [areaId, setAreaId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [errModelo, setErrModelo] = useState(false);
    const [open, setOpen] = useState(false);
    const [filterModelo, setFilterModelo] = useState('');
    const [filterMarca, setFilterMarca] = useState('');
    const [filterAreaName, setFilterAreaName] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resImp, resAreas] = await Promise.all([
                    api.get(`${URI}/tintas/impresoras`),
                    api.get(`${URI}/areas`)
                ]);
                setImpresoras(resImp.data);
                setAreas(resAreas.data);
            } catch (error) {
                console.error("Error al cargar datos de impresoras:", error);
            }
        };
        loadData();
    }, []);

    const getImpresoras = async () => {
        try {
            const res = await api.get(`${URI}/tintas/impresoras`);
            setImpresoras(res.data);
        } catch (error) {
            console.error("Error al obtener las impresoras:", error);
        }
    };

    const filteredImpresoras = useMemo(() => {
        return impresoras.filter(imp => 
            (filterModelo === '' || imp.modelo.toLowerCase().includes(filterModelo.toLowerCase())) &&
            (filterMarca === '' || (imp.marca && imp.marca.toLowerCase().includes(filterMarca.toLowerCase()))) &&
            (filterAreaName === '' || (imp.areas && imp.areas.area.toLowerCase().includes(filterAreaName.toLowerCase())))
        );
    }, [impresoras, filterModelo, filterMarca, filterAreaName]);

    useEffect(() => {
        setPage(0);
    }, [filteredImpresoras.length]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClose = (value) => {
        setOpen(false);
        value && deleteImpresora();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!modelo.trim()) {
            setErrModelo(true);
            return;
        }
        setErrModelo(false);

        try {
            const printerData = { modelo: modelo.trim(), marca: marca.trim(), area_id: areaId };
            if (isUpdate) {
                await api.put(`${URI}/tintas/impresoras/${id}`, printerData);
            } else {
                await api.post(`${URI}/tintas/impresoras`, printerData);
            }
            setIsUpdate(false);
            getImpresoras();
            setId(''); setModelo(''); setMarca(''); setAreaId('');
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
        setAreaId(impresora.area_id || '');
        setIsUpdate(true);
    };

    const clearFilters = () => {
        setFilterModelo(''); setFilterMarca(''); setFilterAreaName('');
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Gestión de Impresoras
                </Typography>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            <Grid container spacing={3}>
                {/* Formulario de Registro/Edición */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" mb={2}>
                                {isUpdate ? 'Editar Impresora' : 'Nueva Impresora'}
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Modelo"
                                        required
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                        error={errModelo}
                                        helperText={errModelo && 'El modelo es requerido'}
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label="Marca"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        select
                                        label="Área"
                                        value={areaId}
                                        onChange={(e) => setAreaId(e.target.value)}
                                        fullWidth
                                        size="small"
                                    >
                                        <MenuItem value=""><em>Ninguna</em></MenuItem>
                                        {areas.map((a) => (
                                            <MenuItem key={a.id} value={a.id}>{a.area}</MenuItem>
                                        ))}
                                    </TextField>
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
                                                setIsUpdate(false); setId(''); setModelo(''); setMarca(''); setAreaId(''); setErrModelo(false);
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
                                <Grid item xs={12} sm={4}>
                                    <TextField label="Modelo" value={filterModelo} onChange={(e) => setFilterModelo(e.target.value)} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField label="Marca" value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField select label="Área" value={filterAreaName} onChange={(e) => setFilterAreaName(e.target.value)} fullWidth size="small">
                                        <MenuItem value=""><em>Todas</em></MenuItem>
                                        {areas.map((a) => (
                                            <MenuItem key={a.id} value={a.area}>{a.area}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} display="flex" justifyContent="flex-end">
                                    <Button variant="text" color="secondary" startIcon={<ClearAllIcon />} onClick={clearFilters} size="small">
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
                                        <StyledTableCell>Modelo</StyledTableCell>
                                        <StyledTableCell align='center'>Marca</StyledTableCell>
                                        <StyledTableCell align='center'>Área</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredImpresoras.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <StyledTableRow key={row.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 600 }}>{row.modelo}</StyledTableCell>
                                            <StyledTableCell align='center'>{row.marca || '---'}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Box sx={{ bgcolor: 'info.light', color: 'white', px: 1, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, display: 'inline-block' }}>
                                                    {row.areas ? row.areas.area : 'N/A'}
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleEditClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleClickOpen(row.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                                </Stack>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredImpresoras.length}
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
