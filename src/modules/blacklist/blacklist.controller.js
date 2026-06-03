import {
  createBlacklistEntry,
  getUserBlacklist,
  deleteBlacklistEntry,
} from "./blacklist.service.js";

export async function createBlacklistController(req, res, next) {
  try {
    const userId = req.user.userId;

    const entry = await createBlacklistEntry(userId, req.validated);

    return res.status(201).json({
      blacklist: entry,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBlacklistController(req, res, next) {
  try {
    const userId = req.user.userId;

    const blacklist = await getUserBlacklist(userId);

    return res.status(200).json({
      blacklist,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteBlacklistController(req, res, next) {
  try {
    const userId = req.user.userId;
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        message: "Invalid blacklist entry id",
      });
    }

    const deletedEntry = await deleteBlacklistEntry(userId, entryId);

    if (!deletedEntry) {
      return res.status(404).json({
        message: "Blacklist entry not found",
      });
    }

    return res.status(200).json({
      blacklist: deletedEntry,
    });
  } catch (err) {
    next(err);
  }
}
