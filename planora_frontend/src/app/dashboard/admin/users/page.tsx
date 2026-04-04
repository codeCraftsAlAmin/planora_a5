"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  UserCheck,
  UserX,
  ShieldCheck,
  Mail,
  Trash2,
  Lock,
  Unlock,
  ShieldAlert
} from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { authService, adminService } from "@/lib/api-service";
import { useAuthContext } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isPending: isAuthPending } = useAuthContext();
  
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [activeModal, setActiveModal] = useState<"DELETE" | "STATUS" | "ROLE" | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (searchTerm) params.searchTerm = searchTerm;
      if (roleFilter !== "ALL") params.role = roleFilter;

      const response = await authService.getAllUsers(params);
      
      if (response.ok && response.data) {
        setUsers(response.data);
        if (response.meta) setMeta(response.meta);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      // 403 handling is partially handled by axios interceptor redirect,
      // but we catch other errors here
      if (err.response?.status !== 403) {
        setError(err.message || "An error occurred while fetching users");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter]);

  useEffect(() => {
    if (!isAuthPending) {
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchUsers();
    }
  }, [currentUser, isAuthPending, fetchUsers, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Action Handlers
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      const res = await adminService.deleteUser(selectedUser.id);
      if (res.ok) {
        showToast({ title: "Success", description: "User deleted successfully" });
        fetchUsers();
      }
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      const nextStatus = paramsToStatus(selectedUser) === "ACTIVE" ? "BANNED" : "ACTIVE";
      const res = await adminService.updateUserStatus(selectedUser.id, nextStatus);
      if (res.ok) {
        showToast({ title: "Success", description: `User ${nextStatus.toLowerCase()} successfully` });
        fetchUsers();
      }
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
      setActiveModal(null);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;
    try {
      setIsActionLoading(true);
      const res = await adminService.updateUserRole(selectedUser.id, newRole);
      if (res.ok) {
        showToast({ title: "Success", description: "User role updated successfully" });
        fetchUsers();
      }
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
      setActiveModal(null);
    }
  };

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
                User Management
              </h1>
              <p className="text-[var(--color-copy-muted)]">
                Control access, manage roles, and monitor platform activity.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-copy-muted)]" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-10 h-11 rounded-2xl bg-white/80"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                }}
                className="h-11 rounded-2xl border-[var(--color-border)] bg-white/80 px-4 text-sm font-medium focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="HOST">Host</option>
                <option value="ADMIN">Admin</option>
              </select>
              
              <Button 
                onClick={fetchUsers}
                className="h-11 rounded-2xl px-6 bg-[var(--color-brand-600)]"
              >
                Search
              </Button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="p-12 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/3" />
                  </div>
                  <div className="h-8 w-20 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                <UserX className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">Something went wrong</h3>
              <p className="text-[var(--color-copy-muted)] mx-auto max-w-md">{error}</p>
              <Button variant="outline" onClick={fetchUsers} className="rounded-xl">Try Again</Button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-surface-950)]">No users found</h3>
              <p className="text-[var(--color-copy-muted)]">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">User</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Role</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Status</th>
                    <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Joined</th>
                    <th className="px-8 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-copy-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-11 w-11 flex-shrink-0">
                            {user.image ? (
                              <img 
                                src={user.image} 
                                alt={user.name} 
                                className="h-full w-full rounded-full object-cover shadow-sm bg-slate-100"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] shadow-sm">
                                <UserIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[var(--color-surface-950)] group-hover:text-[var(--color-brand-700)] transition-colors">
                              {user.name}
                            </span>
                            <span className="text-xs text-[var(--color-copy-muted)] lowercase flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge 
                          variant={
                            user.role === "ADMIN" ? "purple" : 
                            user.role === "HOST" ? "blue" : 
                            "secondary"
                          }
                          className="capitalize py-1 px-3"
                        >
                          {user.role === "ADMIN" && <ShieldCheck className="mr-1 h-3 w-3" />}
                          {user.role === "HOST" && <UserCheck className="mr-1 h-3 w-3" />}
                          {user.role.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${paramsToStatus(user) === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <Badge variant={paramsToStatus(user) === 'ACTIVE' ? "success" : "danger"} className="capitalize">
                                {paramsToStatus(user).toLowerCase()}
                            </Badge>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-[var(--color-copy-muted)]">
                          {new Date((user as any).createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            disabled={user.id === currentUser?.id}
                            onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                                setActiveModal("ROLE");
                            }}
                            className="inline-flex h-8 items-center px-3 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                            Role
                          </button>

                          <button 
                            disabled={user.id === currentUser?.id}
                            onClick={() => {
                                setSelectedUser(user);
                                setActiveModal("STATUS");
                            }}
                            className={cn(
                                "inline-flex h-8 items-center px-3 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                paramsToStatus(user) === "ACTIVE" 
                                    ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200" 
                                    : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                            )}
                          >
                            {paramsToStatus(user) === "ACTIVE" ? (
                              <><Lock className="mr-1.5 h-3.5 w-3.5" /> Ban</>
                            ) : (
                              <><Unlock className="mr-1.5 h-3.5 w-3.5" /> Unban</>
                            )}
                          </button>

                          <button 
                            disabled={user.id === currentUser?.id}
                            onClick={() => {
                                setSelectedUser(user);
                                setActiveModal("DELETE");
                            }}
                            className="inline-flex h-8 items-center px-3 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && !error && users.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-8 py-5">
              <div className="text-sm text-[var(--color-copy-muted)]">
                Showing <span className="font-semibold text-[var(--color-surface-950)]">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-semibold text-[var(--color-surface-950)]">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-semibold text-[var(--color-surface-950)]">{meta.total}</span> users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="rounded-xl h-9 px-4 gap-1 border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <div className="flex items-center px-4">
                    <span className="text-xs font-semibold text-[var(--color-copy-muted)] uppercase tracking-widest">
                        Page {meta.page} of {meta.totalPages}
                    </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="rounded-xl h-9 px-4 gap-1 border-slate-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Modals */}
        <Modal
            isOpen={activeModal === "DELETE"}
            onClose={() => setActiveModal(null)}
            title="Delete User"
            description="Are you sure you want to delete this user? This action is permanent and will remove all their data, including events and registrations."
            variant="danger"
            footer={
                <>
                    <Button variant="ghost" onClick={() => setActiveModal(null)} disabled={isActionLoading}>Cancel</Button>
                    <Button variant="primary" onClick={handleDelete} disabled={isActionLoading} className="bg-red-600 hover:bg-red-700">Delete Permanently</Button>
                </>
            }
        >
            {selectedUser && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50">
                    <UserX className="text-red-600 h-5 w-5" />
                    <div>
                        <p className="font-semibold text-red-900">{selectedUser.name}</p>
                        <p className="text-xs text-red-700">{selectedUser.email}</p>
                    </div>
                </div>
            )}
        </Modal>

        <Modal
            isOpen={activeModal === "STATUS"}
            onClose={() => setActiveModal(null)}
            title={selectedUser && paramsToStatus(selectedUser) === "ACTIVE" ? "Ban User" : "Unban User"}
            description={selectedUser && paramsToStatus(selectedUser) === "ACTIVE" 
                ? "Banning this user will prevent them from logging in, creating events, or making registrations."
                : "Unbanning this user will restore their access to the platform."
            }
            variant={selectedUser && paramsToStatus(selectedUser) === "ACTIVE" ? "warning" : "default"}
            footer={
                <>
                    <Button variant="ghost" onClick={() => setActiveModal(null)} disabled={isActionLoading}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleStatusToggle} 
                        disabled={isActionLoading}
                        className={selectedUser && paramsToStatus(selectedUser) === "ACTIVE" ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}
                    >
                        {selectedUser && paramsToStatus(selectedUser) === "ACTIVE" ? "Confirm Ban" : "Confirm Unban"}
                    </Button>
                </>
            }
        >
             {selectedUser && (
                <div className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl",
                    paramsToStatus(selectedUser) === "ACTIVE" ? "bg-amber-50" : "bg-emerald-50"
                )}>
                    {paramsToStatus(selectedUser) === "ACTIVE" ? <Lock className="text-amber-600 h-5 w-5" /> : <Unlock className="text-emerald-600 h-5 w-5" />}
                    <div>
                        <p className={cn("font-semibold", paramsToStatus(selectedUser) === "ACTIVE" ? "text-amber-900" : "text-emerald-900")}>{selectedUser.name}</p>
                        <p className={cn("text-xs", paramsToStatus(selectedUser) === "ACTIVE" ? "text-amber-700" : "text-emerald-700")}>{selectedUser.email}</p>
                    </div>
                </div>
            )}
        </Modal>

        <Modal
            isOpen={activeModal === "ROLE"}
            onClose={() => setActiveModal(null)}
            title="Update User Role"
            description="Select a new role for this user. This affects their permissions and capabilities across the platform."
            footer={
                <>
                    <Button variant="ghost" onClick={() => setActiveModal(null)} disabled={isActionLoading}>Cancel</Button>
                    <Button variant="primary" onClick={handleRoleUpdate} disabled={isActionLoading || newRole === selectedUser?.role}>Update Role</Button>
                </>
            }
        >
            <div className="space-y-3">
                {["USER", "HOST", "ADMIN"].map((role) => (
                    <button
                        key={role}
                        onClick={() => setNewRole(role)}
                        className={cn(
                            "flex w-full items-center justify-between rounded-2xl border p-4 transition-all",
                            newRole === role 
                                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] ring-1 ring-[var(--color-brand-500)]" 
                                : "border-[var(--color-border)] bg-white text-[var(--color-copy)] hover:border-[var(--color-brand-200)] hover:bg-[var(--color-surface-50)]"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {role === "ADMIN" && <ShieldCheck className="h-5 w-5" />}
                            {role === "HOST" && <UserCheck className="h-5 w-5" />}
                            {role === "USER" && <UserIcon className="h-5 w-5" />}
                            <span className="font-semibold capitalize">{role.toLowerCase()}</span>
                        </div>
                        {newRole === role && <div className="h-2 w-2 rounded-full bg-[var(--color-brand-600)]" />}
                    </button>
                ))}
            </div>
        </Modal>
      </MainWrapper>
    </div>
  );
}

// Helper to determine status since backend might have different fields
function paramsToStatus(user: any) {
    if (user.status) return user.status;
    if (user.isDeleted) return "DELETED";
    return "ACTIVE";
}
