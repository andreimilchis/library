import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound, fail } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  clientId: z.string().uuid(),
  platform: z.enum(["META", "GOOGLE", "TIKTOK", "LINKEDIN", "PINTEREST", "SNAPCHAT", "OTHER"]),
  accountName: z.string().min(1),
  externalAccountId: z.string().min(1),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

const updateSchema = z.object({
  accountName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.clientId as string) where.clientId = req.query.clientId as string;
  if (req.query.platform as string) where.platform = req.query.platform as string;

  const [items, total] = await Promise.all([
    prisma.adAccount.findMany({
      where, skip: p.skip, take: p.take, orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        _count: { select: { campaignPerformance: true } },
      },
    }),
    prisma.adAccount.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.adAccount.findUnique({
    where: { id: req.params.id as string },
    include: {
      client: { select: { id: true, companyName: true } },
      _count: { select: { campaignPerformance: true } },
    },
  });
  if (!item) return notFound(res, "AdAccount");
  ok(res, item);
});

router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.adAccount.create({ data: req.body });
    created(res, item);
  } catch (e: any) {
    if (e.code === "P2002") return fail(res, "Ad account already exists for this platform", 409);
    throw e;
  }
});

router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.adAccount.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "AdAccount");
    throw e;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.adAccount.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "AdAccount");
    throw e;
  }
});

export default router;
