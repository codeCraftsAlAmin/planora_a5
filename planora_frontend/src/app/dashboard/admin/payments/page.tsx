"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard,
  Receipt,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { adminService, type BackendPayment } from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getAllPayments();
        if (response.ok && response.data) {
          setPayments(response.data);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch payments");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching payments");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthPending) {
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchPayments();
    }
  }, [currentUser, isAuthPending, router]);

  // Handle local searching (since backend returns all items)
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    return payments.filter(p => 
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  // Handle local pagination
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isAuthPending) return null;

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        {/* Header Section */}
        <section className="rounded-[36px] border border-[var(--color-border)] bg-white/60 backdrop-blur-md p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-700)]">
                🛡️ Admin Portal
              </p>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-surface-950)] sm:text-5xl">
                Payments
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                View all platform transactions, invoices, and revenue details.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-copy-muted)]" />
                <Input
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-white/80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                     <div className="h-4 bg-slate-100 rounded w-1/3" />
                     <div className="h-3 bg-slate-50 rounded w-1/4" />
                  </div>
                  <div className="h-8 w-24 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-20 text-center space-y-4">
               <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertCircle className="h-8 w-8" />
               </div>
               <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">Failed to load payments</h3>
               <p className="text-[var(--color-copy-muted)] mx-auto max-w-md">{error}</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">No payments found</h3>
              <p className="text-[var(--color-copy-muted)]">Adjust filters or search by user name or email.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">User</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Amount</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Status</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Date</th>
                    <th className="px-8 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentData.map((payment) => (
                    <tr key={payment.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm flex-shrink-0">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col max-w-[250px]">
                            <span className="font-semibold text-[var(--color-surface-950)] truncate">
                              {payment.user?.name || "Unknown User"}
                            </span>
                            <span className="text-xs text-[var(--color-copy-muted)] tracking-wider">
                              {payment.user?.email || "No Email"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                          <div className="text-base font-semibold text-[var(--color-brand-700)]">
                              ৳{payment.amount}
                          </div>
                      </td>
                      <td className="px-6 py-5">
                           <Badge variant={payment.status.toLowerCase() === "succeeded" || payment.status.toLowerCase() === "paid" ? "success" : "secondary"} className="capitalize">
                               {payment.status.toLowerCase()}
                           </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-[var(--color-surface-950)]">
                          {new Date(payment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {payment.invoiceUrl ? (
                            <a 
                                href={payment.invoiceUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex h-8 items-center px-3 gap-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                            >
                                <Receipt className="h-3.5 w-3.5" />
                                Invoice
                                <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                        ) : (
                            <span className="text-xs text-[var(--color-copy-muted)]">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && !error && filteredPayments.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-8 py-5">
              <div className="text-sm text-[var(--color-copy-muted)]">
                Showing <span className="font-semibold text-[var(--color-surface-950)]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-[var(--color-surface-950)]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)}</span> of <span className="font-semibold text-[var(--color-surface-950)]">{filteredPayments.length}</span> payments
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-xl h-9 px-4 gap-1 border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <div className="flex items-center px-4">
                    <span className="text-xs font-semibold text-[var(--color-copy-muted)] uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-xl h-9 px-4 gap-1 border-slate-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </MainWrapper>
    </div>
  );
}
