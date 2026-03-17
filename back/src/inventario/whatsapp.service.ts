import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private readonly botUrl = process.env.WHATSAPP_BOT_URL || 'https://inventario-whatsapp-bot.onrender.com';
    private readonly groupId = process.env.WHATSAPP_GROUP_ID;

    /**
     * Envía un mensaje a través del bot de WhatsApp
     */
    async sendMessage(message: string, number?: string) {
        const target = number || this.groupId;

        if (!target) {
            this.logger.warn('⚠️ No se ha configurado un destinatario (número o ID de grupo) para WhatsApp.');
            return;
        }

        try {
            // Despertar al bot si está en Render (GET a /health)
            // No esperamos el resultado para no bloquear el flujo si tarda 60s
            axios.get(`${this.botUrl}/health`).catch(() => null);

            const response = await axios.post(`${this.botUrl}/send`, {
                number: target,
                message: message
            });

            if (response.data.success) {
                this.logger.log(`🚀 Mensaje enviado con éxito a ${target}`);
            }
        } catch (error) {
            this.logger.error(`❌ Error al conectar con el Bot de WhatsApp: ${error.message}`);
        }
    }

    /**
     * Formatea y envía una alerta de stock bajo
     */
    async sendStockAlert(item: { modelo: string, color: string, stock: number, min: number }) {
        const message = 
`⚠️ *ALERTA DE STOCK BAJO* ⚠️

📦 *Insumo:* ${item.modelo} (${item.color})
📉 *Stock Actual:* ${item.stock} unidades
🛑 *Mínimo Requerido:* ${item.min} unidades

_Por favor, gestionar la reposición de este insumo._`;

        await this.sendMessage(message);
    }
}
