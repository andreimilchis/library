import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound, fail } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  source: z.enum(["INBOUND", "OUTBOUND", "REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "PAID_ADS", "EVENT", "OTHER"]).optional(),
  notes: z.string().optional(),
  estimatedBudget: z.number().optional(),
  assignedToId: z.string().uuid().optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(["NEW", "CONTACTED", "DISCOVERY_SCHEDULED", "DISCOVERY_COMPLETED", "AUDIT_SENT", "OFFER_SENT", "NEGOTIATION", "WON", "LOST"]).optional(),
});

// List with filters
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.status as string) where.status = req.query.status as string;
  if (req.query.source as string) where.source = req.query.source as string;
  if (req.query.assignedToId as string) where.assignedToId = req.query.assignedToId as string;

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip: p.skip,
      take: p.take,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    }),
    prisma.lead.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get by ID with relations
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.lead.findUnique({
    where: { id: req.params.id as string },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      discoveryMeetings: true,
      audits: true,
      offers: true,
      client: { select: { id: true, status: true } },
    },
  });
  if (!item) return notFound(res, "Lead");
  ok(res, item);
});

// Create
router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  const item = await prisma.lead.create({ data: req.body });
  created(res, item);
});

// Update
router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.lead.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Lead");
    throw e;
  }
});

// Convert Lead to Client
router.post("/:id/convert", async (req: Request, res: Response) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id as string }, include: { client: true } });
  if (!lead) return notFound(res, "Lead");
  if (lead.client) return fail(res, "Lead already converted to client", 409);

  const client = await prisma.$transaction(async (tx) => {
    await tx.lead.update({ where: { id: lead.id }, data: { status: "WON" } });
    return tx.client.create({
      data: {
        leadId: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        industry: lead.industry,
        monthlyBudget: lead.estimatedBudget,
        accountManagerId: req.body?.accountManagerId || lead.assignedToId,
      },
    });
  });
  created(res, client);
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Lead");
    throw e;
  }
});

export default router;
