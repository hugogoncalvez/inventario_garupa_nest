import React, { useState, useEffect } from 'react';
import { URI } from '../../config';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CartuchoForm from './CartuchoForm'; // Importar el componente de formulario reutilizable


export const CreateCartucho = () => {
    const [cartuchoData, setCartuchoData] = useState({
        modelo: '',
        sku: '',
        color: '',
        tipo: 'Tinta', // Valor por defecto
        stockMinimoUnidades: 0,
        esRecargable: false,
        selectedInsumoGranelId: ''
    });
    const [insumosGranel, setInsumosGranel] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInsumosGranel = async () => {
            try {
                const res = await axios.get(`${URI}/insumos-granel`);
                setInsumosGranel(res.data);
            } catch (err) {
                console.error("Error al obtener insumos a granel:", err);
                setError("Error al cargar los insumos a granel.");
            }
        };
        fetchInsumosGranel();
    }, []);

    const handleDataChange = (name, value) => {
        setCartuchoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const { modelo, color, esRecargable, selectedInsumoGranelId } = cartuchoData;

        if (!modelo.trim() || !color.trim()) {
            setError('El modelo y el color son campos obligatorios.');
            return;
        }

        if (esRecargable && !selectedInsumoGranelId) {
            setError('Debe seleccionar un insumo a granel si el cartucho es recargable.');
            return;
        }

        try {
            await axios.post(`${URI}/tintas/cartuchos`, {
                modelo: cartuchoData.modelo.trim(),
                sku: cartuchoData.sku.trim(),
                color: cartuchoData.color.trim(),
                tipo: cartuchoData.tipo,
                stock_unidades: 0, // Siempre inicia en 0 al crear
                stock_minimo_unidades: parseInt(cartuchoData.stockMinimoUnidades),
                es_recargable: cartuchoData.esRecargable,
                insumo_granel_id: cartuchoData.esRecargable ? cartuchoData.selectedInsumoGranelId : null
            });
            navigate('/tintas/cartuchos');
        } catch (err) {
            console.error("Error al crear insumo:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al crear el insumo.");
        }
    };

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5" sx={{ mb: 4, textAlign: 'center' }}>
                Crear Nuevo Insumo
            </Typography>
            <CartuchoForm
                cartuchoData={cartuchoData}
                onDataChange={handleDataChange}
                onSubmit={handleSubmit}
                error={error}
                insumosGranel={insumosGranel}
                isEditMode={false}
            />
        </Container>
    );
};