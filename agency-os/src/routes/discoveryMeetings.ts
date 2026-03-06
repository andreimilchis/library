import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  leadId: z.string().uuid(),
  meetingType: z.enum(["DISCOVERY", "FOLLOW_UP", "STRATEGY", "REVIEW", "ONBOARDING"]).optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().optional(),
  conductedById: z.string().uuid().optional(),
});

const updateSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  durationMinutes: z.number().int().positive().optional(),
  recordingUrl: z.string().url().optional(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  keyInsights: z.string().optional(),
  conductedById: z.string().uuid().optional(),
});

// List
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.leadId as string) where.leadId = req.query.leadId as string;
  if (req.query.status as string) where.status = req.query.status as string;

  const [items, total] = await Promise.all([
    prisma.discoveryMeeting.findMany({
      where,
      skip: p.skip,
      take: p.take,
      orderBy: { scheduledAt: "desc" },
      include: {
        lead: { select: { id: true, companyName: true, contactName: true } },
        conductedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.discoveryMeeting.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get by ID
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.discoveryMeeting.findUnique({
    where: { id: req.params.id as string },
    include: {
      lead: { select: { id: true, companyName: true, contactName: true } },
      conductedBy: { select: { id: true, name: true } },
      audit: true,
      offer: true,
    },
  });
  if (!item) return notFound(res, "DiscoveryMeeting");
  ok(res, item);
});

// Create
router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  const item = await prisma.discoveryMeeting.create({ data: req.body });
  created(res, item);
});

// Update
router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.discoveryMeeting.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "DiscoveryMeeting");
    throw e;
  }
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.discoveryMeeting.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "DiscoveryMeeting");
    throw e;
  }
});

export default router;
