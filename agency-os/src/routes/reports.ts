import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  clientId: z.string().uuid(),
  type: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "AD_HOC", "CAMPAIGN"]).optional(),
  title: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  content: z.string().optional(),
  summary: z.string().optional(),
  generatedById: z.string().uuid().optional(),
});

const updateSchema = z.object({
  status: z.enum(["DRAFT", "GENERATED", "DELIVERED"]).optional(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  summary: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.clientId as string) where.clientId = req.query.clientId as string;
  if (req.query.type as string) where.type = req.query.type as string;
  if (req.query.status as string) where.status = req.query.status as string;

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where, skip: p.skip, take: p.take, orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        generatedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.report.findUnique({
    where: { id: req.params.id as string },
    include: {
      client: { select: { id: true, companyName: true, contactName: true } },
      generatedBy: { select: { id: true, name: true } },
    },
  });
  if (!item) return notFound(res, "Report");
  ok(res, item);
});

router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  const item = await prisma.report.create({ data: req.body });
  created(res, item);
});

router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.report.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Report");
    throw e;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.report.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Report");
    throw e;
  }
});

export default router;
