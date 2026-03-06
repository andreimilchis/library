import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  leadId: z.string().uuid(),
  meetingId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  services: z.string().optional(),
  monthlyFee: z.number().optional(),
  setupFee: z.number().optional(),
  currency: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  createdById: z.string().uuid().optional(),
});

const updateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  services: z.string().optional(),
  monthlyFee: z.number().optional(),
  setupFee: z.number().optional(),
  validUntil: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  respondedAt: z.string().datetime().optional(),
});

// List
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.leadId as string) where.leadId = req.query.leadId as string;
  if (req.query.status as string) where.status = req.query.status as string;

  const [items, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip: p.skip,
      take: p.take,
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.offer.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get by ID
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.offer.findUnique({
    where: { id: req.params.id as string },
    include: {
      lead: { select: { id: true, companyName: true, contactName: true } },
      meeting: true,
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!item) return notFound(res, "Offer");
  ok(res, item);
});

// Create
router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  const item = await prisma.offer.create({ data: req.body });
  created(res, item);
});

// Update
router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.offer.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Offer");
    throw e;
  }
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.offer.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Offer");
    throw e;
  }
});

export default router;
