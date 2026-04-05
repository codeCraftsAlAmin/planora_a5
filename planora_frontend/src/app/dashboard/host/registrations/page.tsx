"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  eventRegisterService,
  type BackendEventRegistration,
} from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/providers/auth-provider";

type ActionType = "APPROVED" | "REJECTED" | "BANNED" | "REFUND" | null;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusTone(status: BackendEventRegistration["status"]) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "bg-red-50 text-red-700";
  if (status === "BANNED") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function getPaymentTone(status: BackendEventRegistration["paymentStatus"]) {
  if (status === "PAID") return "bg-emerald-50 text-emerald-700";
  if (status === "FREE") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function canApprove(registration: BackendEventRegistration) {
  return registration.status !== "APPROVED";
}

function canReject(registration: BackendEventRegistration) {
  return registration.status !== "REJECTED";
}

function canBan(registration: BackendEventRegistration) {
  return registration.status === "APPROVED";
}

function canRefund(registration: BackendEventRegistration) {
  return (
    (registration.status === "REJECTED" || registration.status === "BANNED") &&
    registration.paymentStatus === "PAID"
  );
}

export default function HostRegistrationsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState<BackendEventRegistration[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] =
    useState<BackendEventRegistration | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await eventRegisterService.getAllRegistrations();
      if (response.ok && response.data) {
        setRegistrations(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch registrations");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch registrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending) {
      if (!currentUser || currentUser.role !== "HOST") {
        router.push("/");
        return;
      }

      fetchRegistrations();
    }
  }, [currentUser, isAuthPending, router]);

  const summary = useMemo(() => {
    return {
      total: registrations.length,
      pending: registrations.filter((item) => item.status === "PROCESSING")
        .length,
      approved: registrations.filter((item) => item.status === "APPROVED")
        .length,
      refundReady: registrations.filter(canRefund).length,
    };
  }, [registrations]);

  const actionTitle =
    activeAction === "APPROVED"
      ? "Approve registration"
      : activeAction === "REJECTED"
        ? "Reject registration"
        : activeAction === "BANNED"
          ? "Ban participant"
          : "Refund payments";

  const actionDescription =
    activeAction === "REFUND"
      ? `This will refund all rejected or banned paid registrations for "${selectedRegistration?.event.title}".`
      : `This will update ${selectedRegistration?.user?.name ?? "this participant"} for "${selectedRegistration?.event.title}".`;

  const handleConfirmAction = async () => {
    if (!selectedRegistration || !activeAction) return;

    try {
      setIsActionLoading(true);

      if (activeAction === "REFUND") {
        const response = await eventRegisterService.refundRegistration(
          selectedRegistration.eventId,
        );

        if (!response.ok) {
          throw new Error(response.message || "Refund failed");
        }
      } else {
        const response = await eventRegisterService.updateRegistration(
          selectedRegistration.id,
          activeAction,
        );

        if (!response.ok) {
          throw new Error(response.message || "Status update failed");
        }
      }

      showToast({
        title: "Success",
        description:
          activeAction === "REFUND"
            ? "Refund processed successfully."
            : "Registration updated successfully.",
        variant: "success",
      });

      setActiveAction(null);
      setSelectedRegistration(null);
      fetchRegistrations();
    } catch (err: any) {
      showToast({
        title: "Action failed",
        description: err.message || "Something went wrong",
        variant: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isAuthPending) return null;

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                Host Portal
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                Registration Management
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Review attendees, approve requests, reject invalid entries, and refund paid rejections.
              </p>
            </div>

            <Button
              variant="outline"
              className="h-11 rounded-2xl px-6"
              onClick={fetchRegistrations}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Total Registrations</p>
            <p className="mt-3 font-serif text-4xl text-[var(--color-surface-950)]">{summary.total}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Pending Review</p>
            <p className="mt-3 font-serif text-4xl text-amber-700">{summary.pending}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Approved</p>
            <p className="mt-3 font-serif text-4xl text-emerald-700">{summary.approved}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <p className="text-sm text-[var(--color-copy-muted)]">Ready for Refund</p>
            <p className="mt-3 font-serif text-4xl text-red-700">{summary.refundReady}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--color-copy-muted)]">
              Loading registrations...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold text-[var(--color-surface-950)]">Could not load registrations</p>
              <p className="mt-2 text-sm text-[var(--color-copy-muted)]">{error}</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <CalendarDays className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-serif font-bold text-[var(--color-surface-950)]">
                No registrations found
              </h3>
              <p className="mt-2 text-[var(--color-copy-muted)]">
                New attendee requests will show up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Attendee</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Event</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Payment</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Requested</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--color-surface-950)]">
                            {registration.user?.name ?? "Unknown user"}
                          </p>
                          <p className="text-sm text-[var(--color-copy-muted)]">
                            {registration.user?.email ?? "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--color-surface-950)]">
                            {registration.event.title}
                          </p>
                          <p className="text-sm text-[var(--color-copy-muted)]">
                            {registration.event.venue}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={getStatusTone(registration.status)}>
                          {registration.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <Badge className={getPaymentTone(registration.paymentStatus)}>
                            {registration.paymentStatus}
                          </Badge>
                          <p className="text-xs text-[var(--color-copy-muted)]">
                            {registration.event.fee > 0
                              ? `BDT ${registration.event.fee}`
                              : "Free event"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--color-copy-muted)]">
                        <p>{formatDate(registration.createdAt)}</p>
                        <p>{registration.event.time}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            className="rounded-xl"
                            disabled={!canApprove(registration)}
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setActiveAction("APPROVED");
                            }}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={!canReject(registration)}
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setActiveAction("REJECTED");
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={!canBan(registration)}
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setActiveAction("BANNED");
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={!canRefund(registration)}
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setActiveAction("REFUND");
                            }}
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            Refund
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <Modal
          isOpen={!!selectedRegistration && !!activeAction}
          onClose={() => {
            setSelectedRegistration(null);
            setActiveAction(null);
          }}
          title={actionTitle}
          description={actionDescription}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRegistration(null);
                  setActiveAction(null);
                }}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmAction} disabled={isActionLoading}>
                {isActionLoading ? "Saving..." : "Confirm"}
              </Button>
            </>
          }
        >
          {selectedRegistration ? (
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-brand-700)]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-surface-950)]">
                    {selectedRegistration.user?.name ?? "Unknown user"}
                  </p>
                  <p className="text-sm text-[var(--color-copy-muted)]">
                    {selectedRegistration.event.title}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </MainWrapper>
    </div>
  );
}
