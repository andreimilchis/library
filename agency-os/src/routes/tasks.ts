import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  clientId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().uuid().optional(),
  createdById: z.string().uuid().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  assignedToId: z.string().uuid().optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.clientId as string) where.clientId = req.query.clientId as string;
  if (req.query.status as string) where.status = req.query.status as string;
  if (req.query.priority as string) where.priority = req.query.priority as string;
  if (req.query.assignedToId as string) where.assignedToId = req.query.assignedToId as string;

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where, skip: p.skip, take: p.take, orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.task.findUnique({
    where: { id: req.params.id as string },
    include: {
      client: { select: { id: true, companyName: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!item) return notFound(res, "Task");
  ok(res, item);
});

router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  const item = await prisma.task.create({ data: req.body });
  created(res, item);
});

router.patch("/:id", validate(updateSchema), async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (data.status === "DONE" && !data.completedAt) {
      data.completedAt = new Date();
    }
    const item = await prisma.task.update({ where: { id: req.params.id as string }, data });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Task");
    throw e;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "Task");
    throw e;
  }
});

export default router;
