import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { ok, created, notFound } from "../utils/response";
import { getPagination, paginatedResponse } from "../utils/pagination";

const router = Router();

const createThreadSchema = z.object({
  leadId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  channel: z.enum(["EMAIL", "WHATSAPP", "SLACK", "INTERNAL", "SMS", "OTHER"]).optional(),
  subject: z.string().optional(),
});

const createMessageSchema = z.object({
  senderType: z.string().min(1),
  senderId: z.string().optional(),
  body: z.string().min(1),
  metadata: z.string().optional(),
});

// List threads
router.get("/", async (req: Request, res: Response) => {
  const p = getPagination(req);
  const where: any = {};
  if (req.query.leadId as string) where.leadId = req.query.leadId as string;
  if (req.query.clientId as string) where.clientId = req.query.clientId as string;
  if (req.query.channel as string) where.channel = req.query.channel as string;
  if (req.query.isOpen as string !== undefined) where.isOpen = req.query.isOpen as string === "true";

  const [items, total] = await Promise.all([
    prisma.communicationThread.findMany({
      where, skip: p.skip, take: p.take, orderBy: { updatedAt: "desc" },
      include: {
        lead: { select: { id: true, companyName: true } },
        client: { select: { id: true, companyName: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.communicationThread.count({ where }),
  ]);
  ok(res, paginatedResponse(items, total, p));
});

// Get thread with messages
router.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.communicationThread.findUnique({
    where: { id: req.params.id as string },
    include: {
      lead: { select: { id: true, companyName: true, contactName: true } },
      client: { select: { id: true, companyName: true, contactName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!item) return notFound(res, "CommunicationThread");
  ok(res, item);
});

// Create thread
router.post("/", validate(createThreadSchema), async (req: Request, res: Response) => {
  const item = await prisma.communicationThread.create({ data: req.body });
  created(res, item);
});

// Add message to thread
router.post("/:id/messages", validate(createMessageSchema), async (req: Request, res: Response) => {
  const thread = await prisma.communicationThread.findUnique({ where: { id: req.params.id as string } });
  if (!thread) return notFound(res, "CommunicationThread");

  const message = await prisma.message.create({
    data: { threadId: req.params.id as string, ...req.body },
  });
  // Touch thread updatedAt
  await prisma.communicationThread.update({ where: { id: req.params.id as string }, data: {} });
  created(res, message);
});

// Close / reopen thread
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const data: any = {};
    if (req.body.isOpen !== undefined) data.isOpen = req.body.isOpen;
    if (req.body.subject !== undefined) data.subject = req.body.subject;
    const item = await prisma.communicationThread.update({ where: { id: req.params.id as string }, data });
    ok(res, item);
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "CommunicationThread");
    throw e;
  }
});

// Delete thread
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.communicationThread.delete({ where: { id: req.params.id as string } });
    ok(res, { deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return notFound(res, "CommunicationThread");
    throw e;
  }
});

export default router;
