import './App.css';
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { startHeartbeat, startBotHeartbeat, isDarkMode, getThemeColors } from './config.js';
import useAuth from './hooks/useAuth';
import Swal from 'sweetalert2';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import theme from './theme';
import Layout from './components/Layout';
import SignUp from './components/Registro'
import LogIn from './components/LogIn';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import RequireAuth from './components/Auth/RequireAuth';
import { Box, CircularProgress } from '@mui/material';

// Lazy-load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const ShowInventario = lazy(() => import('./components/inventario/ShowInventario'));
const EditInv = lazy(() => import('./components/inventario/EditInv'));
const CreateInv = lazy(() => import('./components/inventario/CreateInv'));
const ConfigAreas = lazy(() => import('./components/areas/ConfigAreas').then(module => ({ default: module.ConfigAreas })));
const ConfigComponentes = lazy(() => import('./components/componentes/ConfigComponentes').then(module => ({ default: module.ConfigComponentes })));
const ShowOrdenes = lazy(() => import('./components/ordenesServicio/ShowOrdenes'));
const CreateOrden = lazy(() => import('./components/ordenesServicio/CreateOrden'));
const EditOrden = lazy(() => import('./components/ordenesServicio/EditOrden'));
const GestionCartuchos = lazy(() => import('./components/tintas/GestionCartuchos'));
const GestionImpresoras = lazy(() => import('./components/tintas/GestionImpresoras').then(module => ({ default: module.GestionImpresoras })));
const ReportesTinta = lazy(() => import('./components/tintas/ReportesTinta').then(module => ({ default: module.ReportesTinta })));
const ReportesRecargasGranel = lazy(() => import('./components/tintas/ReportesRecargasGranel').then(module => ({ default: module.ReportesRecargasGranel })));
const CreateCartucho = lazy(() => import('./components/tintas/CreateCartucho').then(module => ({ default: module.CreateCartucho })));
const EditCartucho = lazy(() => import('./components/tintas/EditCartucho').then(module => ({ default: module.EditCartucho })));
const GestionInsumosGranel = lazy(() => import('./components/tintas/GestionInsumosGranel').then(module => ({ default: module.GestionInsumosGranel })));
const ReportesCompras = lazy(() => import('./components/tintas/ReportesCompras').then(module => ({ default: module.ReportesCompras })));
const GestionPedidos = lazy(() => import('./components/tintas/GestionPedidos'));
const GestionRepuestos = lazy(() => import('./components/inventario/GestionRepuestos'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const inactivityTimerRef = useRef(null);

  // 1. Gestión de Latidos (Heartbeats) - Solo si está logueado
  useEffect(() => {
    let stopBackHeartbeat = null;
    let stopBotHeartbeat = null;

    if (auth) {
      stopBackHeartbeat = startHeartbeat();
      stopBotHeartbeat = startBotHeartbeat();
    }

    return () => {
      if (stopBackHeartbeat) stopBackHeartbeat();
      if (stopBotHeartbeat) stopBotHeartbeat();
    };
  }, [auth]);

  // 2. Gestión de Inactividad (Auto-Logout)
  useEffect(() => {
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      
      // Solo activamos el timer si el usuario está logueado
      if (auth) {
        inactivityTimerRef.current = setTimeout(() => {
          handleAutoLogout();
        }, INACTIVITY_LIMIT);
      }
    };

    const handleAutoLogout = () => {
      setAuth(null);
      navigate('/');
      const colors = getThemeColors();
      Swal.fire({
        title: 'Sesión expirada',
        text: 'Se cerró la sesión por inactividad.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        background: colors.background,
        color: colors.color,
        confirmButtonColor: isDarkMode() ? '#60a5fa' : '#2563eb'
      });
    };

    // Eventos que resetean el contador de inactividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    if (auth) {
      events.forEach(event => document.addEventListener(event, resetTimer));
      resetTimer(); // Iniciar el primer contador
    }

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [auth, navigate, setAuth]);

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        {(pathname !== '/' && pathname !== '/register') && <NavBar />}

        <Box sx={{ flexGrow: 1 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LogIn />} />
                <Route path='/register' element={<SignUp />} />

                <Route element={<RequireAuth />}>
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path='/inventario' element={<ShowInventario />} />
                  <Route path='/inventario/create' element={<CreateInv />} />
                  <Route path='/edit/:id' element={<EditInv />} />
                  <Route path='/areas' element={<ConfigAreas />} />
                  <Route path='/tipos' element={<ConfigComponentes />} />
                  <Route path='/ordenes' element={<ShowOrdenes />} />
                  <Route path='/ordenes/create' element={<CreateOrden />} />
                  <Route path='/ordenes/edit/:id' element={<EditOrden />} />
                  <Route path='/tintas/cartuchos' element={<GestionCartuchos />} />
                  <Route path='/tintas/cartuchos/create' element={<CreateCartucho />} />
                  <Route path='/tintas/cartuchos/edit/:id' element={<EditCartucho />} />
                  <Route path='/tintas/impresoras' element={<GestionImpresoras />} />
                  <Route path='/tintas/reportes' element={<ReportesTinta />} />
                  <Route path='/tintas/reportes/recargas' element={<ReportesRecargasGranel />} />
                  <Route path='/tintas/pedidos' element={<GestionPedidos />} />
                  <Route path='/reportes/compras' element={<ReportesCompras />} />
                  <Route path='/insumos-granel' element={<GestionInsumosGranel />} />
                  <Route path='/repuestos' element={<GestionRepuestos />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
