import { Request } from "express";

/** Extract a single route param as string (Express 5 types return string | string[]) */
export function param(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

/** Extract a query param as string | undefined */
export function query(req: Request, name: string): string | undefined {
  const val = req.query[name];
  if (val === undefined) return undefined;
  return Array.isArray(val) ? String(val[0]) : String(val);
}
