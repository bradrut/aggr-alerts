import express from 'express';
import controller from '../controllers/liquidationAlerts';
const router = express.Router();

router.post('/liquidationAlerts', controller.processLiquidationAlert);

export = router;