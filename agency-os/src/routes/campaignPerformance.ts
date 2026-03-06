import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const upsertSchema = z.object({
  adAccountId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  spend: z.number().min(0),
  revenue: z.number().min(0),
  impressions: z.number().int().min(0),
  clicks: z.number().int().min(0),
  conversions: z.number().int().min(0),
});

function computeMetrics(data: { spend: number; revenue: number; impressions: number; clicks: number; conversions: number }) {
  return {
    roas: data.spend > 0 ? data.revenue / data.spend : null,
    cpa: data.conversions > 0 ? data.spend / data.conversions : null,
    ctr: data.impressions > 0 ? data.clicks / data.impressions : null,
    cpc: data.clicks > 0 ? data.spend / data.clicks : null,
    cpm: data.impressions > 0 ? (data.spend / data.impressions) * 1000 : null,
  };
}

// List with filters
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.adAccountId as string) where.adAccountId = req.query.adAccountId as string;
  if (req.query.campaignId as string) where.campaignId = req.query.campaignId as string;
  if (req.query.dateFrom as string || req.query.dateTo as string) {
    where.date = {};
    if (req.query.dateFrom as string) where.date.gte = new Date(req.query.dateFrom as string as string);
    if (req.query.dateTo as string) where.date.lte = new Date(req.query.dateTo as string as string);
  }

  const [items, total] = await Promise.all([
    prisma.campaignPerformance.findMany({
      where, skip: p.skip, take: p.take, orderBy: { date: "desc" },
      include: { adAccount: { select: { id: true, accountName: true, platform: true } } },
    }),
    prisma.campaignPerformance.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get by ID
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.campaignPerformance.findUnique({
    where: { id: req.params.id as string },
    include: { adAccount: { select: { id: true, accountName: true, platform: true, client: { select: { id: true, companyName: true } } } } },
  });
  if (!item) return notFound(res, "CampaignPerformance");
  ok(res, item);
});

// Upsert — primary endpoint for integrations layer to push daily metrics
router.post("/", validate(upsertSchema), async (req: Request, res: Response) => {
  const metrics = computeMetrics(req.body);
  const item = await prisma.campaignPerformance.upsert({
    where: {
      adAccountId_date_campaignId: {
        adAccountId: req.body.adAccountId,
        date: new Date(req.body.date),
        campaignId: req.body.campaignId,
      },
    },
    create: { ...req.body, date: new Date(req.body.date), ...metrics },
    update: { ...req.body, date: new Date(req.body.date), ...metrics },
  });
  created(res, item);
});

// Batch upsert — for bulk imports
router.post("/batch", async (req: Request, res: Response) => {
  const schema = z.array(upsertSchema).min(1).max(1000);
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Validation error", details: parsed.error.errors });
  }

  const results = await prisma.$transaction(
    parsed.data.map((row) => {
      const metrics = computeMetrics(row);
      return prisma.campaignPerformance.upsert({
        where: {
          adAccountId_date_campaignId: {
            adAccountId: row.adAccountId,
            date: new Date(row.date),
            campaignId: row.campaignId,
          },
        },
        create: { ...row, date: new Date(row.date), ...metrics },
        update: { ...row, date: new Date(row.date), ...metrics },
      });
    })
  );
  created(res, { upserted: results.length });
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.campaignPerformance.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "CampaignPerformance");
    throw e;
  }
});

export default router;
