import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound, fail } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// List
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.agencyUser.findMany({ skip: p.skip, take: p.take, orderBy: { createdAt: "desc" } }),
    prisma.agencyUser.count(),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get by ID
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.agencyUser.findUnique({ where: { id: req.params.id as string } });
  if (!item) return notFound(res, "AgencyUser");
  ok(res, item);
});

// Create
router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.agencyUser.create({ data: req.body });
    created(res, item);
  } catch (e: any) {
    if (e.code === "P2002") return fail(res, "Email already exists", 409);
    throw e;
  }
});

// Update
router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const item = await prisma.agencyUser.update({ where: { id: req.params.id as string }, data: req.body });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "AgencyUser");
    throw e;
  }
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.agencyUser.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "AgencyUser");
    throw e;
  }
});

export default router;
