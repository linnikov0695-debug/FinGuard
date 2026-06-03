import { getUserAlerts, updateAlertStatus } from "./alerts.service.js";

export async function getAlertsController(req, res, next) {
  try {
    const userId = req.user.userId;

    const { riskLevel, status, limit, page, sort } = req.query;

    const alerts = await getUserAlerts(userId, {
      riskLevel,
      status,
      limit,
      page,
      sort,
    });

    return res.status(200).json({
      alerts,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAlertStatusController(req, res, next) {
  try {
    const userId = req.user.userId;

    const alertId = Number(req.params.id);

    if (!Number.isInteger(alertId)) {
      return res.status(400).json({
        message: "Invalid alert id",
      });
    }

    const { status } = req.validated;

    const alert = await updateAlertStatus(userId, alertId, status);

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    return res.status(200).json({
      alert,
    });
  } catch (err) {
    next(err);
  }
}
