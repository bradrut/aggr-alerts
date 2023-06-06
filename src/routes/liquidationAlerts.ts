import express from 'express';
import { liquidationAlertsController } from '../server';

const router = express.Router();
router.post('/liquidationAlerts', liquidationAlertsController.processLiquidationAlert);

export default router;