import { Module } from "@nestjs/common";
import { InventarioController } from "./inventario.controller";
import { AreasController } from "./areas.controller";
import { TiposController, EstadoController } from "./tipos.controller";
import { InsumosGranelController } from "./insumos-granel.controller";
import { ReportesController } from "./reportes.controller";
import { TintasController } from "./tintas.controller";
import { OrdenesController } from "./ordenes.controller";
import { DashboardController } from "./dashboard.controller";
import { WhatsAppService } from "./whatsapp.service";
import { RepuestosController } from "./repuestos.controller";
import { UsuariosController } from "./usuarios.controller";

@Module({
    controllers: [
        InventarioController,
        AreasController,
        TiposController,
        EstadoController,
        InsumosGranelController,
        ReportesController,
        TintasController,
        OrdenesController,
        DashboardController,
        RepuestosController,
        UsuariosController
    ],
    providers: [WhatsAppService]
})
export class InventarioModule { }