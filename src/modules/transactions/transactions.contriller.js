import {
  createTransactionService,
  getUserTransactions,
} from "./transactions.service.js";

export async function createTransaction(req, res, next) {
  try {
    const transactionData = {
      ...req.validated,
      userId: req.user.userId,
    };
    const transaction = await createTransactionService(transactionData);
    return res.status(201).json({
      transaction,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getTransactions(req, res, next) {
  try {
    const userId = req.user.userId;

    const transactions = await getUserTransactions(userId);

    return res.status(200).json({
      transactions,
    });
  } catch (err) {
    next(err);
  }
}
