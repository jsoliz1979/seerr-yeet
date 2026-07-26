import {
  SuggestionCategory,
  SuggestionStatus,
} from '@server/constants/suggestion';
import { getRepository } from '@server/datasource';
import Suggestion from '@server/entity/Suggestion';
import type {
  SuggestionRequestBody,
  SuggestionResultsResponse,
  SuggestionStatusRequestBody,
} from '@server/interfaces/api/suggestionInterfaces';
import { Permission } from '@server/lib/permissions';
import { getSettings } from '@server/lib/settings';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';

const suggestionRoutes = Router();

suggestionRoutes.get('/motd', isAuthenticated(), (_req, res) => {
  const { motdEnabled, motdTitle, motdMessage, motdUpdatedAt } =
    getSettings().main;
  return res.json({ motdEnabled, motdTitle, motdMessage, motdUpdatedAt });
});

suggestionRoutes.put(
  '/motd',
  isAuthenticated(Permission.ADMIN),
  async (req, res, next) => {
    const message = String(req.body.motdMessage ?? '').trim();
    const title = String(req.body.motdTitle ?? '').trim();
    if (message.length > 2000 || title.length > 100) {
      return next({ status: 400, message: 'The MOTD is too long.' });
    }

    const settings = getSettings();
    settings.main.motdEnabled = Boolean(req.body.motdEnabled);
    settings.main.motdTitle = title || 'Welcome!';
    settings.main.motdMessage = message;
    settings.main.motdUpdatedAt = Date.now();
    await settings.save();

    return res.json({
      motdEnabled: settings.main.motdEnabled,
      motdTitle: settings.main.motdTitle,
      motdMessage: settings.main.motdMessage,
      motdUpdatedAt: settings.main.motdUpdatedAt,
    });
  }
);

suggestionRoutes.post<never, Suggestion, SuggestionRequestBody>(
  '/',
  isAuthenticated(),
  async (req, res, next) => {
    if (!req.user) {
      return next({ status: 401, message: 'You must be signed in.' });
    }

    const message = req.body.message?.trim();
    const validCategories = Object.values(SuggestionCategory).filter(
      (value) => typeof value === 'number'
    );

    if (!message || message.length < 10 || message.length > 2000) {
      return next({
        status: 400,
        message: 'Suggestion must be between 10 and 2,000 characters.',
      });
    }

    if (!validCategories.includes(req.body.category)) {
      return next({ status: 400, message: 'Invalid suggestion category.' });
    }

    const suggestion = new Suggestion({
      category: req.body.category,
      message,
      pageUrl: req.body.pageUrl?.slice(0, 500) || null,
      createdBy: req.user,
    });

    return res
      .status(201)
      .json(await getRepository(Suggestion).save(suggestion));
  }
);

suggestionRoutes.get<never, SuggestionResultsResponse>(
  '/',
  isAuthenticated(Permission.ADMIN),
  async (req, res) => {
    const pageSize = Math.min(Number(req.query.take) || 50, 100);
    const skip = Number(req.query.skip) || 0;
    const status = Number(req.query.status);

    let query = getRepository(Suggestion)
      .createQueryBuilder('suggestion')
      .leftJoinAndSelect('suggestion.createdBy', 'createdBy')
      .leftJoinAndSelect('suggestion.modifiedBy', 'modifiedBy')
      .orderBy('suggestion.createdAt', 'DESC');

    if (
      [
        SuggestionStatus.NEW,
        SuggestionStatus.REVIEWED,
        SuggestionStatus.RESOLVED,
      ].includes(status)
    ) {
      query = query.where('suggestion.status = :status', { status });
    }

    const [suggestions, count] = await query
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();

    return res.json({
      pageInfo: {
        pages: Math.ceil(count / pageSize),
        pageSize,
        results: count,
        page: Math.floor(skip / pageSize) + 1,
      },
      results: suggestions,
    });
  }
);

suggestionRoutes.get(
  '/count',
  isAuthenticated(Permission.ADMIN),
  async (_req, res) => {
    const repository = getRepository(Suggestion);

    return res.json({
      total: await repository.count(),
      new: await repository.count({ where: { status: SuggestionStatus.NEW } }),
    });
  }
);

suggestionRoutes.put<
  { suggestionId: string },
  Suggestion,
  SuggestionStatusRequestBody
>(
  '/:suggestionId',
  isAuthenticated(Permission.ADMIN),
  async (req, res, next) => {
    if (!req.user) {
      return next({ status: 401, message: 'You must be signed in.' });
    }

    if (
      ![
        SuggestionStatus.NEW,
        SuggestionStatus.REVIEWED,
        SuggestionStatus.RESOLVED,
      ].includes(req.body.status)
    ) {
      return next({ status: 400, message: 'Invalid suggestion status.' });
    }

    const repository = getRepository(Suggestion);
    const suggestion = await repository.findOne({
      where: { id: Number(req.params.suggestionId) },
    });

    if (!suggestion) {
      return next({ status: 404, message: 'Suggestion not found.' });
    }

    suggestion.status = req.body.status;
    suggestion.modifiedBy = req.user;

    return res.json(await repository.save(suggestion));
  }
);

suggestionRoutes.delete<{ suggestionId: string }>(
  '/:suggestionId',
  isAuthenticated(Permission.ADMIN),
  async (req, res, next) => {
    const repository = getRepository(Suggestion);
    const suggestion = await repository.findOne({
      where: { id: Number(req.params.suggestionId) },
    });

    if (!suggestion) {
      return next({ status: 404, message: 'Suggestion not found.' });
    }

    await repository.remove(suggestion);
    return res.status(204).send();
  }
);

export default suggestionRoutes;
