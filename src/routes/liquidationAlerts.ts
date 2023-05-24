import express from 'express';
import LiquidationAlertsController from '../controllers/liquidationAlerts';
const router = express.Router();

router.post('/liquidationAlerts', LiquidationAlertsController.processLiquidationAlert);

export = router;