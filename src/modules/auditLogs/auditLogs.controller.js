import { getUserAuditLogs } from "./auditLogs.service.js";

export async function getAuditLogsController(req, res, next) {
  try {
    const userId = req.user.userId;

    const logs = await getUserAuditLogs(userId);

    return res.status(200).json({
      logs,
    });
  } catch (err) {
    next(err);
  }
}
