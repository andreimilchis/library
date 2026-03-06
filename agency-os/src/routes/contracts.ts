import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  monthlyFee: z.number().optional(),
  currency: z.string().optional(),
  documentUrl: z.string().url().optional(),
  externalId: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "SIGNED", "ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  monthlyFee: z.number().optional(),
  documentUrl: z.string().url().optional(),
  signedAt: z.string().datetime().optional(),
  externalId: z.string().optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.clientId as string) where.clientId = req.query.clientId as string;
  if (req.query.status as string) where.status = req.query.status as string;

  const [items, total] = await Promise.all([
    prisma.contract.findMany({
      where, skip: p.skip, take: p.take, orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, companyName: true } } },
    }),
    prisma.contract.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.contract.findUnique({
    where: { id: req.params.id as string },
    include: { client: { select: { id: true, companyName: true, contactName: true } } },
  });
  if (!item) return notFound(res, "Contract");
  ok(res, item);
});

router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  const item = await prisma.contract.create({ data: req.body });
  created(res, item);
});

router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.contract.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Contract");
    throw e;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.contract.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Contract");
    throw e;
  }
});

export default router;
