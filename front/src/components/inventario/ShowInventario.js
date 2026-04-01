import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Container from '@mui/material/Container';
import ConfirmDialog from '../dialogs/ShowConfirm'
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

import ActaEntrega from '../../pdf/ActaEntrega';
import Auditoria from '../../pdf/Auditoria';
import ActaDevolucion from '../../pdf/ActaDevolucion';

const ShowInventario = () => {
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [inventario, setInventario] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        getInventario();
    }, []);

    const getInventario = async () => {
        try {
            const res = await api.get(`${URI}/inventario/`);
            setInventario(res.data);
        } catch (error) {
            console.error("Error cargando inventario:", error);
        }
    };

    const deleteInv = async () => {
        await api.delete(`${URI}/inventario/${id}`);
        getInventario();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const handleClose = (value) => {
        setOpen(false);
        if (value) deleteInv();
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'num_inventario',
                header: 'Inv. Nº',
                size: 100,
                Cell: ({ cell }) => (
                    <Box sx={{ 
                        fontWeight: 800, 
                        color: 'primary.main',
                        fontSize: '0.9rem' 
                    }}>
                        {cell.getValue()}
                    </Box>
                ),
            },
            {
                accessorKey: 'num_pc',
                header: 'PC',
                size: 80,
            },
            {
                accessorKey: 'tipo',
                header: 'Tipo',
                filterVariant: 'multi-select',
            },
            {
                accessorKey: 'descripcion',
                header: 'Descripción',
            },
            {
                accessorKey: 'marca',
                header: 'Marca',
            },
            {
                accessorKey: 'num_serie',
                header: 'Nº Serie',
            },
            {
                accessorKey: 'area',
                header: 'Área',
                filterVariant: 'multi-select',
            },
            {
                accessorKey: 'usuario',
                header: 'Usuario',
            },
            {
                accessorKey: 'estado',
                header: 'Estado',
                filterVariant: 'select',
                Cell: ({ cell }) => {
                    const est = cell.getValue()?.toLowerCase() || '';
                    let colorKey = 'grey';
                    if (est.includes('nuevo') || est.includes('bueno')) colorKey = 'success';
                    else if (est.includes('utilizado') || est.includes('regular')) colorKey = 'warning';
                    else if (est.includes('baja') || est.includes('malo')) colorKey = 'error';

                    return (
                        <Box sx={{
                            bgcolor: (theme) => alpha(theme.palette[colorKey].main, 0.15),
                            color: (theme) => theme.palette[colorKey].main,
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette[colorKey].main, 0.4),
                            px: 1,
                            py: 0.25,
                            borderRadius: '6px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            display: 'inline-block',
                            minWidth: 75,
                            textAlign: 'center',
                            textTransform: 'uppercase'
                        }}>
                            {cell.getValue()}
                        </Box>
                    );
                },
            },
        ],
        [],
    );

    const selectedRowsData = useMemo(() => {
        return inventario.filter((_, index) => rowSelection[index]);
    }, [rowSelection, inventario]);

    const table = useMaterialReactTable({
        columns,
        data: inventario,
        enableColumnOrdering: true,
        enableGlobalFilter: true,
        enableGrouping: true,
        enableRowSelection: true,
        enableRowActions: true,
        positionActionsColumn: 'last',
        localization: MRT_Localization_ES,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
        
        // --- CONFIGURACIÓN DE TEMA BLINDADA ---
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper', // Fondo del contenedor principal
                backgroundImage: 'none',
            },
        },
        muiTableContainerProps: {
            sx: {
                bgcolor: 'background.paper', // Fondo del contenedor de la tabla
            }
        },
        muiTableHeadProps: {
            sx: {
                bgcolor: 'background.paper',
            },
        },
        muiTableHeadRowProps: {
            sx: {
                bgcolor: 'background.paper',
                boxShadow: 'none',
            },
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? '#1e293b' // Un gris azulado oscuro sólido (palette.background.paper)
                    : alpha(theme.palette.primary.main, 0.05),
                color: 'text.primary',
                fontWeight: 800,
                fontSize: '0.85rem',
                borderBottom: '2px solid',
                borderColor: (theme) => theme.palette.primary.main,
                '& .MuiButtonBase-root': {
                    color: 'text.primary',
                },
                '& .MuiSvgIcon-root': {
                    color: (theme) => theme.palette.text.primary,
                },
                '& .Mui-TableHeadCell-Content-Labels': {
                    color: 'text.primary',
                },
                '& .Mui-TableHeadCell-Content-Wrapper': {
                    color: 'text.primary',
                },
            },
        },
        muiTableBodyCellProps: {
            sx: {
                bgcolor: 'background.paper', // FORZAMOS FONDO DE CADA CELDA
                color: 'text.primary',      // FORZAMOS COLOR DE TEXTO
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 1,
            },
        },
        muiTableBodyRowProps: {
            sx: {
                bgcolor: 'background.paper',
                '&:hover td': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), // Hover sutil
                },
            },
        },
        muiTopToolbarProps: {
            sx: {
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            },
        },
        muiBottomToolbarProps: {
            sx: {
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
            },
        },
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined',
            sx: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                },
            },
        },

        renderRowActions: ({ row }) => (
            <Stack direction="row" spacing={0.5}>
                <Tooltip title="Editar">
                    <IconButton
                        size="small"
                        color="success"
                        onClick={() => navigate(`/edit/${row.original.id}`)}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleClickOpen(row.original.id)}
                    >
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        ),
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '4px', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    onClick={() => navigate('/inventario/create')}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ borderRadius: '10px' }}
                >
                    Nuevo Item
                </Button>
            </Box>
        ),
        initialState: {
            density: 'compact',
            pagination: { pageSize: 10, pageIndex: 0 },
        },
    });

    return (
        <Container maxWidth="xl" sx={{ mt: 11, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="900" color="primary" sx={{ letterSpacing: '-1px' }}>
                    Inventario Inteligente
                </Typography>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            <Box sx={{ 
                width: '100%', 
                '& .MuiPaper-root': { bgcolor: 'background.paper' } // Doble refuerzo
            }}>
                <MaterialReactTable table={table} />
            </Box>

            <Box mt={3} display="flex" gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    color="error"
                    disabled={selectedRowsData.length === 0}
                    onClick={() => ActaEntrega(selectedRowsData)}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ borderRadius: '10px' }}
                >
                    Acta Entrega ({selectedRowsData.length})
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={selectedRowsData.length === 0}
                    onClick={() => ActaDevolucion(selectedRowsData)}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ borderRadius: '10px' }}
                >
                    Acta Devolución ({selectedRowsData.length})
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={inventario.length === 0}
                    onClick={() => Auditoria(table.getFilteredRowModel().rows.map(r => r.original))}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ borderRadius: '10px' }}
                >
                    Auditoría (Filtrados)
                </Button>
            </Box>
        </Container>
    );
}

export default ShowInventario;
