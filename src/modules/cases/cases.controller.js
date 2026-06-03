import {
  createCaseService,
  getUserCases,
  updateCaseStatus,
} from "./cases.service.js";

export async function createCaseController(req, res, next) {
  try {
    const userId = req.user.userId;

    const newCase = await createCaseService(userId, req.validated);

    return res.status(201).json({
      case: newCase,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCasesController(req, res, next) {
  try {
    const userId = req.user.userId;

    const { status, limit, page, sort } = req.query;

    const cases = await getUserCases(userId, {
      status,
      limit,
      page,
      sort,
    });

    return res.status(200).json({
      cases,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCaseStatusController(req, res, next) {
  try {
    const userId = req.user.userId;
    const caseId = Number(req.params.id);

    if (!Number.isInteger(caseId)) {
      return res.status(400).json({
        message: "Invalid case id",
      });
    }

    const { status } = req.validated;

    const updatedCase = await updateCaseStatus(userId, caseId, status);

    if (!updatedCase) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    return res.status(200).json({
      case: updatedCase,
    });
  } catch (err) {
    next(err);
  }
}
