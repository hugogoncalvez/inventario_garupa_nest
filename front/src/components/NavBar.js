import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
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


export default function NavBar() {


    const navigate = useNavigate()
    const { setAuth } = useAuth();

    const [openDrawer, setOpenDrawer] = useState(false)

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }


        setOpenDrawer(!openDrawer)

    };

    const list = () => {
        const mainNavItems = [
            { text: 'Inventario', path: '/inventario', icon: <Inventory2OutlinedIcon /> },
            { text: 'Órdenes de Servicio', path: '/ordenes', icon: <BuildIcon /> },
            { text: 'Control de Insumos', path: '/tintas/cartuchos', icon: <FactCheckIcon /> },
            { text: 'Control de Insumos a Granel', path: '/insumos-granel', icon: <LocalShippingIcon /> }, // Added and moved here
            { text: 'Reporte de Insumos', path: '/tintas/reportes', icon: <SummarizeIcon /> },
            { text: 'Reporte de Recargas', path: '/tintas/reportes/recargas', icon: <SummarizeIcon /> },
            { text: 'Reporte de Compras', path: '/reportes/compras', icon: <SummarizeIcon /> }
        ];

        return (
            <Box
                sx={{ width: 200 }}
                role="presentation"
                onClick={toggleDrawer(false)}
                onKeyDown={toggleDrawer(false)}
            >
                <List>
                    {mainNavItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton onClick={() => navigate(item.path)}>
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <Typography component="h2" variant="h5" align='center' sx={{ mt: 3 }}>
                    Configuración
                </Typography>
                <Divider />

                <ListItemButton onClick={() => navigate(`/areas`)}>
                    <ListItemIcon>
                        <TableChartIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Areas'} />
                </ListItemButton>
                <ListItemButton onClick={() => navigate(`/tipos`)}>
                    <ListItemIcon>
                        <DesktopWindowsIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Componentes'} />
                </ListItemButton>
                <ListItemButton onClick={() => navigate(`/tintas/impresoras`)}>
                    <ListItemIcon>
                        <PrintIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Gestión de Impresoras'} />
                </ListItemButton>
            </Box>
        )
    };

    const handleOpenDrawer = () => {
        setOpenDrawer(!openDrawer)
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed">
                <Toolbar sx={{ justifyContent: "space-between", backgroundColor: '#22314f' }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => handleOpenDrawer()}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="home"
                        sx={{ mr: 2 }}
                        onClick={() => navigate('/inventario')}
                    >
                        <HomeIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                        size="large"
                        color="inherit"
                        aria-label="logout"
                        onClick={() => {
                            setAuth(false);
                            navigate('/');
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                    {/* <Button color="inherit" onClick={()=> navigate('/')}>LogOut</Button> */}
                </Toolbar>
            </AppBar>
            <Drawer
                anchor={"left"}
                open={openDrawer}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
        </Box>
    );
}