import status from "http-status";
import {
  EventStatus,
  EventType,
  InvitationStatus,
  PaymentStatus,
  RegistrationStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import AppError from "../../middleware/appError";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUserInterface) => {
  let stateData;

  switch (user.role) {
    case Role.ADMIN:
      stateData = getAdminStatsData();
      break;
    case Role.USER:
      stateData = getUserStatsData(user);
      break;
    case Role.HOST:
      stateData = getHostStatsData(user);
      break;

    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }

  return stateData;
};

const getAdminStatsData = async () => {
  const [
    userCount,
    eventCount,
    approvedRegisterCount,
    revenue,
    invitationStats,
    reviewCount,
    pieChart,
    barchart,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),

    prisma.events.groupBy({
      by: ["type"],
      _count: true,
    }),

    prisma.eventsRegistrations.count({
      where: {
        status: RegistrationStatus.APPROVED,
      },
    }),

    prisma.payments.aggregate({
      where: {
        status: PaymentStatus.PAID,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.invitations.groupBy({
      by: ["status"],
      _count: true,
    }),

    prisma.reviews.count(),

    getPieChartData(),
    getBarChartData(),
  ]);

  return {
    pieChartData: pieChart,
    barChartData: barchart,
    totalUserCount: userCount.find((u) => u.role === Role.USER)?._count || 0,
    totalHostCount: userCount.find((u) => u.role === Role.HOST)?._count || 0,
    totalPublicEvent:
      eventCount.find((e) => e.type === EventType.PUBLIC)?._count || 0,
    totalPrivateEvent:
      eventCount.find((e) => e.type === EventType.PRIVATE)?._count || 0,
    totalApprovedRegister: approvedRegisterCount,
    totalRevenue: revenue._sum.amount || 0,
    totalInvitation:
      invitationStats.find((i) => i.status === InvitationStatus.ACCEPTED)
        ?._count || 0,
    totalPendingInvitation:
      invitationStats.find((i) => i.status === InvitationStatus.PENDING)
        ?._count || 0,
    totalReview: reviewCount,
  };
};

const getUserStatsData = async (user: IRequestUserInterface) => {
  const [eventCount, invitationStats, reviewCount, pieChart, barchart] =
    await Promise.all([
      // count total joined event
      prisma.events.count({
        where: {
          eventsRegistrations: {
            some: {
              userId: user.userId,
              status: RegistrationStatus.APPROVED,
            },
          },
        },
      }),

      // count total pending invitation
      prisma.invitations.count({
        where: {
          inviteeId: user.userId,
          status: InvitationStatus.PENDING,
        },
      }),

      // count total review given
      prisma.reviews.count({
        where: {
          userId: user.userId,
        },
      }),

      getPieChartData(),
      getBarChartData(),
    ]);

  return {
    pieChartData: pieChart,
    barChartData: barchart,
    totalJoinedEvent: eventCount,
    totalPendingInvitation: invitationStats,
    totalReview: reviewCount,
  };
};

const getHostStatsData = async (user: IRequestUserInterface) => {
  const myEvents = await prisma.events.findMany({
    where: {
      organizerId: user.userId,
    },
    select: { id: true },
  });

  const [
    totalRevenue,
    totalRegisterCount,
    totalOwnEventCount,
    totalCompletedEventCount,
    totalInvitationCount,
    totalPendingInvitationCount,
    totalReviewCount,
    pieChart,
    barchart,
  ] = await Promise.all([
    // total revenue -- linked with event owner
    prisma.payments.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.PAID,
        eventId: {
          in: myEvents.map((event) => event.id),
        },
      },
    }),

    // total register -- own event
    prisma.eventsRegistrations.count({
      where: {
        status: RegistrationStatus.APPROVED,
        event: {
          organizerId: user.userId,
        },
      },
    }),

    // total event -- own event
    prisma.events.count({
      where: {
        organizerId: user.userId,
      },
    }),

    // total completed event -- own event
    prisma.events.count({
      where: {
        status: EventStatus.COMPLETED,
        organizerId: user.userId,
      },
    }),

    // total invitation -- own event
    prisma.invitations.count({
      where: {
        eventId: {
          in: myEvents.map((event) => event.id),
        },
      },
    }),

    // total pending invitation -- own event
    prisma.invitations.count({
      where: {
        eventId: {
          in: myEvents.map((event) => event.id),
        },
        status: InvitationStatus.PENDING,
      },
    }),

    // total review -- own event
    prisma.reviews.count({
      where: {
        eventId: {
          in: myEvents.map((event) => event.id),
        },
      },
    }),

    getPieChartData(),
    getBarChartData(),
  ]);

  return {
    pieChartData: pieChart,
    barChartData: barchart,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalRegisterCount,
    totalOwnEventCount,
    totalCompletedEventCount,
    totalInvitationCount,
    totalPendingInvitationCount,
    totalReviewCount,
  };
};

// get piechart data
const getPieChartData = async () => {
  const statusCounts = await prisma.events.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  // Format it for frontend libraries like Recharts
  // Result: [{ label: 'UPCOMING', value: 10 }, { label: 'COMPLETED', value: 5 }]
  return statusCounts.map((item) => ({
    label: item.status,
    value: item._count.id,
  }));
};

// get barchart data
const getBarChartData = async () => {
  interface EventCountByMonth {
    month: Date;
    count: bigint;
  }

  const eventCountByMonth: EventCountByMonth[] = await prisma.$queryRaw`
    SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        CAST(COUNT(*) as int) as count
    FROM "events"
    GROUP BY month
    ORDER BY month asc;
  `;

  return eventCountByMonth;
};

export const statsService = {
  getDashboardStatsData,
};
