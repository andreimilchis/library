import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  clientId: z.string().uuid(),
  invoiceNumber: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().optional(),
  description: z.string().optional(),
  issuedAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  externalId: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  issuedAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
  externalId: z.string().optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.clientId as string) where.clientId = req.query.clientId as string;
  if (req.query.status as string) where.status = req.query.status as string;

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where, skip: p.skip, take: p.take, orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, companyName: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.invoice.findUnique({
    where: { id: req.params.id as string },
    include: { client: { select: { id: true, companyName: true, contactName: true } } },
  });
  if (!item) return notFound(res, "Invoice");
  ok(res, item);
});

router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.invoice.create({ data: req.body });
    created(res, item);
  } catch (e: any) {
    if (e.code === "P2002") return notFound(res, "Invoice number already exists");
    throw e;
  }
});

router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.invoice.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Invoice");
    throw e;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Invoice");
    throw e;
  }
});

export default router;
