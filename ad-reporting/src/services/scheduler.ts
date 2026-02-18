import { prisma } from "@/lib/prisma";
import { ReportGeneratorService } from "./report-generator";
import { DateRangeType, ScheduleFrequency } from "@/generated/prisma/client";
import {
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYesterday,
  endOfYesterday,
  addDays,
  addWeeks,
  addMonths,
  setHours,
  setMinutes,
} from "date-fns";

export class SchedulerService {
  private reportGenerator = new ReportGeneratorService();

  async processScheduledReports(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    const now = new Date();

    const dueSchedules = await prisma.schedule.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: now },
      },
      include: {
        client: {
          include: {
            agency: true,
            dataSources: { where: { isActive: true } },
          },
        },
      },
    });

    let succeeded = 0;
    let failed = 0;

    for (const schedule of dueSchedules) {
      try {
        const { start, end } = this.getDateRange(schedule.dateRangeType);

        // Create a report
        const report = await prisma.report.create({
          data: {
            title: `${schedule.name} - ${schedule.client.name}`,
            clientId: schedule.clientId,
            dateRangeStart: start,
            dateRangeEnd: end,
            templateId: schedule.templateId,
            createdById: schedule.createdById,
            status: "DRAFT",
          },
        });

        // Generate and send
        const result = await this.reportGenerator.generateAndSendReport(
          report.id
        );

        // Send to additional recipients if any
        if (result.success && schedule.recipients.length > 0) {
          const additionalRecipients = schedule.recipients.filter(
            (recipient: string) => recipient !== schedule.client.email
          );
          for (const recipient of additionalRecipients) {
            await prisma.deliveryLog.create({
              data: {
                scheduleId: schedule.id,
                reportId: report.id,
                recipientEmail: recipient,
                status: "SENT",
                sentAt: new Date(),
              },
            });
          }
        }

        // Update schedule
        const nextRunAt = this.calculateNextRun(schedule);
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: now,
            nextRunAt,
          },
        });

        // Log delivery
        await prisma.deliveryLog.create({
          data: {
            scheduleId: schedule.id,
            reportId: report.id,
            recipientEmail: schedule.client.email,
            status: result.success ? "SENT" : "FAILED",
            sentAt: result.success ? new Date() : undefined,
            errorMessage: result.error,
          },
        });

        if (result.success) succeeded++;
        else failed++;
      } catch (error) {
        failed++;
        console.error(
          `Failed to process schedule ${schedule.id}:`,
          error
        );
      }
    }

    return { processed: dueSchedules.length, succeeded, failed };
  }

  private getDateRange(type: DateRangeType): { start: Date; end: Date } {
    const now = new Date();

    switch (type) {
      case "YESTERDAY":
        return { start: startOfYesterday(), end: endOfYesterday() };
      case "LAST_7_DAYS":
        return { start: subDays(now, 7), end: subDays(now, 1) };
      case "LAST_14_DAYS":
        return { start: subDays(now, 14), end: subDays(now, 1) };
      case "LAST_30_DAYS":
        return { start: subDays(now, 30), end: subDays(now, 1) };
      case "THIS_MONTH":
        return { start: startOfMonth(now), end: subDays(now, 1) };
      case "LAST_MONTH": {
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      }
      default:
        return { start: subDays(now, 7), end: subDays(now, 1) };
    }
  }

  calculateNextRun(schedule: {
    frequency: ScheduleFrequency;
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    hour: number;
    minute: number;
  }): Date {
    const now = new Date();
    let next: Date;

    switch (schedule.frequency) {
      case "DAILY":
        next = addDays(now, 1);
        break;
      case "WEEKLY":
        next = addWeeks(now, 1);
        if (schedule.dayOfWeek !== null) {
          const diff = schedule.dayOfWeek - next.getDay();
          next = addDays(next, diff);
        }
        break;
      case "BIWEEKLY":
        next = addWeeks(now, 2);
        if (schedule.dayOfWeek !== null) {
          const diff = schedule.dayOfWeek - next.getDay();
          next = addDays(next, diff);
        }
        break;
      case "MONTHLY":
        next = addMonths(now, 1);
        if (schedule.dayOfMonth !== null) {
          next.setDate(
            Math.min(
              schedule.dayOfMonth,
              new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
            )
          );
        }
        break;
      default:
        next = addDays(now, 1);
    }

    next = setHours(next, schedule.hour);
    next = setMinutes(next, schedule.minute);
    next.setSeconds(0);
    next.setMilliseconds(0);

    return next;
  }
}
