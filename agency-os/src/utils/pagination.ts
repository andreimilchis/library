import { Request } from "express";

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function paginatedResponse(data: unknown[], total: number, params: PaginationParams) {
  return {
    items: data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}
