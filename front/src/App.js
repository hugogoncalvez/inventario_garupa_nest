import './App.css';
import React, { Suspense, lazy } from 'react'; // Importar Suspense y lazy
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import SignUp from './components/Registro'
import LogIn from './components/LogIn';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import RequireAuth from './components/Auth/RequireAuth';

// Lazy-load components
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
const ReportesRecargasGranel = lazy(() => import('./components/tintas/ReportesRecargasGranel').then(module => ({ default: module.ReportesRecargasGranel }))); // Nuevo
const CreateCartucho = lazy(() => import('./components/tintas/CreateCartucho').then(module => ({ default: module.CreateCartucho })));
const EditCartucho = lazy(() => import('./components/tintas/EditCartucho').then(module => ({ default: module.EditCartucho })));
const GestionInsumosGranel = lazy(() => import('./components/tintas/GestionInsumosGranel').then(module => ({ default: module.GestionInsumosGranel })));
const ReportesCompras = lazy(() => import('./components/tintas/ReportesCompras').then(module => ({ default: module.ReportesCompras })));


function App() {
  const { pathname } = useLocation();

  return (
    <div className="App">

      {(pathname !== '/' && pathname !== '/register') && <NavBar />}


      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path='/' element={<LogIn />} />
          <Route path='/register' element={<SignUp />} />


          <Route element={<RequireAuth />}>
            {/* Each lazy-loaded component inside its own Suspense */}
            <Route path='/inventario' element={<Suspense fallback={<div>Cargando...</div>}><ShowInventario /></Suspense>} />
            <Route path='/inventario/create' element={<Suspense fallback={<div>Cargando...</div>}><CreateInv /></Suspense>} />
            <Route path='/edit/:id' element={<Suspense fallback={<div>Cargando...</div>}><EditInv /></Suspense>} />
            <Route path='/areas' element={<Suspense fallback={<div>Cargando...</div>}><ConfigAreas /></Suspense>} />
            <Route path='/tipos' element={<Suspense fallback={<div>Cargando...</div>}><ConfigComponentes /></Suspense>} />
            <Route path='/ordenes' element={<Suspense fallback={<div>Cargando...</div>}><ShowOrdenes /></Suspense>} />
            <Route path='/ordenes/create' element={<Suspense fallback={<div>Cargando...</div>}><CreateOrden /></Suspense>} />
            <Route path='/ordenes/edit/:id' element={<Suspense fallback={<div>Cargando...</div>}><EditOrden /></Suspense>} />
            <Route path='/tintas/cartuchos' element={<Suspense fallback={<div>Cargando...</div>}><GestionCartuchos /></Suspense>} />
            <Route path='/tintas/cartuchos/create' element={<Suspense fallback={<div>Cargando...</div>}><CreateCartucho /></Suspense>} />
            <Route path='/tintas/cartuchos/edit/:id' element={<Suspense fallback={<div>Cargando...</div>}><EditCartucho /></Suspense>} />
            <Route path='/tintas/impresoras' element={<Suspense fallback={<div>Cargando...</div>}><GestionImpresoras /></Suspense>} />
            <Route path='/tintas/reportes' element={<Suspense fallback={<div>Cargando...</div>}><ReportesTinta /></Suspense>} />
            <Route path='/tintas/reportes/recargas' element={<Suspense fallback={<div>Cargando...</div>}><ReportesRecargasGranel /></Suspense>} /> {/* Nuevo reporte */}
            <Route path='/reportes/compras' element={<Suspense fallback={<div>Cargando...</div>}><ReportesCompras /></Suspense>} />
            <Route path='/insumos-granel' element={<Suspense fallback={<div>Cargando...</div>}><GestionInsumosGranel /></Suspense>} />
          </Route>
        </Route>
      </Routes>


      <Footer />
    </div>
  );
}

export default App;
