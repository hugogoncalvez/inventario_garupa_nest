import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useColorScheme, useTheme } from '@mui/material/styles';

import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TableChartIcon from '@mui/icons-material/TableChart';
import BuildIcon from '@mui/icons-material/Build';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PrintIcon from '@mui/icons-material/Print';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuth();
    const [openDrawer, setOpenDrawer] = useState(false);
    const { mode, setMode } = useColorScheme();

    const toggleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    if (!mode) {
        return null;
    }

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setOpenDrawer(open);
    };

    const mainNavItems = [
        { text: 'Panel de Control', path: '/dashboard', icon: <AnalyticsIcon /> },
        { text: 'Inventario', path: '/inventario', icon: <Inventory2OutlinedIcon /> },
        { text: 'Órdenes de Servicio', path: '/ordenes', icon: <BuildIcon /> },
        { text: 'Control de Insumos', path: '/tintas/cartuchos', icon: <FactCheckIcon /> },
        { text: 'Insumos a Granel', path: '/insumos-granel', icon: <LocalShippingIcon /> },
    ];

    const reportItems = [
        { text: 'Consumo por Área', path: '/tintas/reportes', icon: <AnalyticsIcon /> },
        { text: 'Recargas Realizadas', path: '/tintas/reportes/recargas', icon: <AssignmentIcon /> },
        { text: 'Historial de Compras', path: '/reportes/compras', icon: <SummarizeIcon /> }
    ];

    const configItems = [
        { text: 'Áreas Municipales', path: '/areas', icon: <TableChartIcon /> },
        { text: 'Tipos de Componentes', path: '/tipos', icon: <DesktopWindowsIcon /> },
        { text: 'Gestión de Impresoras', path: '/tintas/impresoras', icon: <PrintIcon /> },
    ];

    const renderListItem = (item) => {
        const isActive = location.pathname === item.path;
        return (
            <ListItem key={item.text} disablePadding>
                <ListItemButton 
                    onClick={() => { navigate(item.path); setOpenDrawer(false); }}
                    selected={isActive}
                    sx={{
                        mx: 1,
                        borderRadius: 2,
                        mb: 0.5,
                        transition: 'var(--mui-transitions-create-all)',
                        '&.Mui-selected': {
                            backgroundColor: 'var(--mui-palette-primary-mainChannel, rgba(37, 99, 235, 0.12))',
                            color: 'var(--mui-palette-primary-main)',
                            '& .MuiListItemIcon-root': { color: 'var(--mui-palette-primary-main)' },
                            '&:hover': { backgroundColor: 'var(--mui-palette-primary-mainChannel, rgba(37, 99, 235, 0.2))' }
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    const list = () => (
        <Box sx={{ width: 280, pb: 2, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
            <Box sx={{ 
                p: 3, 
                backgroundColor: 'var(--mui-palette-primary-main)', 
                color: 'var(--mui-palette-common-white)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}>
                <Typography variant="h6" fontWeight="bold">
                    Inventario Garupá
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Sistema de Gestión Integral
                </Typography>
            </Box>

            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <List subheader={<ListSubheader sx={{ bgcolor: 'var(--mui-palette-background-paper)', fontWeight: 700, pt: 1 }}>GESTIÓN</ListSubheader>}>
                    {mainNavItems.map(renderListItem)}
                </List>

                <Divider sx={{ mx: 2, my: 1 }} />

                <List subheader={<ListSubheader sx={{ bgcolor: 'var(--mui-palette-background-paper)', fontWeight: 700 }}>REPORTES</ListSubheader>}>
                    {reportItems.map(renderListItem)}
                </List>

                <Divider sx={{ mx: 2, my: 1 }} />

                <List subheader={<ListSubheader sx={{ bgcolor: 'var(--mui-palette-background-paper)', fontWeight: 700 }}>CONFIGURACIÓN</ListSubheader>}>
                    {configItems.map(renderListItem)}
                </List>
            </Box>

            <Divider />
            
            <Box sx={{ p: 2 }}>
                <ListItemButton 
                    onClick={() => { setAuth(false); navigate('/'); }}
                    sx={{ borderRadius: 2, color: 'var(--mui-palette-error-main)' }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar 
                position="fixed" 
                elevation={0} 
                sx={{ 
                    backgroundColor: 'var(--mui-palette-background-paper)',
                    color: 'var(--mui-palette-text-primary)',
                    borderBottom: '1px solid var(--mui-palette-divider)' 
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setOpenDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700 }}>
                            Gestión de Inventario
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <IconButton color="inherit" onClick={toggleMode} title={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}>
                            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                        </IconButton>
                        <IconButton color="inherit" onClick={() => navigate('/dashboard')} title="Inicio">
                            <HomeIcon />
                        </IconButton>
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                setAuth(false);
                                navigate('/');
                            }}
                            title="Cerrar Sesión"
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            
            <Drawer
                anchor="left"
                open={openDrawer}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: { 
                        border: 'none', 
                        boxShadow: 'var(--mui-shadows-12)',
                        backgroundColor: 'var(--mui-palette-background-paper)'
                    }
                }}
            >
                {list()}
            </Drawer>
            <Toolbar /> {/* Espaciador para el AppBar fixed */}
        </Box>
    );
}
