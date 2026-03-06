import { Response } from "express";

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res: Response, data: unknown) {
  return ok(res, data, 201);
}

export function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

export function notFound(res: Response, entity = "Resource") {
  return fail(res, `${entity} not found`, 404);
}
