import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const updateSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(["ONBOARDING", "ACTIVE", "PAUSED", "CHURNED"]).optional(),
  monthlyBudget: z.number().optional(),
  currency: z.string().optional(),
  onboardedAt: z.string().datetime().optional(),
  accountManagerId: z.string().uuid().optional(),
});

// List with filters
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.status as string) where.status = req.query.status as string;
  if (req.query.accountManagerId as string) where.accountManagerId = req.query.accountManagerId as string;

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: p.skip,
      take: p.take,
      orderBy: { createdAt: "desc" },
      include: {
        accountManager: { select: { id: true, name: true, email: true } },
        _count: { select: { adAccounts: true, contracts: true, invoices: true, tasks: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get by ID with full relations
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.client.findUnique({
    where: { id: req.params.id as string },
    include: {
      lead: { select: { id: true, source: true, createdAt: true } },
      accountManager: { select: { id: true, name: true, email: true } },
      contracts: { orderBy: { createdAt: "desc" }, take: 5 },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      adAccounts: { include: { _count: { select: { campaignPerformance: true } } } },
      _count: { select: { tasks: true, reports: true, communicationThreads: true } },
    },
  });
  if (!item) return notFound(res, "Client");
  ok(res, item);
});

// Update (clients are created via lead conversion)
router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.client.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Client");
    throw e;
  }
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Client");
    throw e;
  }
});

export default router;
