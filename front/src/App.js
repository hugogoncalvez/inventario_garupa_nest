import './App.css';
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { startHeartbeat } from './config.js';
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

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    startHeartbeat();
  }, []);

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
                  <Route path='/reportes/compras' element={<ReportesCompras />} />
                  <Route path='/insumos-granel' element={<GestionInsumosGranel />} />
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
