"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, Lock, ShieldCheck, User as UserIcon } from "lucide-react";
import { MainWrapper } from "@/components/shared/main-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardBadge,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api-service";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
      gender: user?.gender || "OTHER",
    },
  });

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-[var(--color-copy-muted)]">Please sign in to view your profile.</p>
      </div>
    );
  }

  const isHost = user.role === "HOST";

  const handleBecomeHost = async () => {
    try {
      const response = await authService.becomeHost();
      if (response.ok) {
        showToast({
          title: "Successfully upgraded!",
          description: "You are now a host. Welcome to the creator community!",
          variant: "success",
        });
        await refetch();
      }
    } catch (err: unknown) {
      showToast({
        title: "Upgrade failed",
        description: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Auto-switch to editing mode if not already
      if (!isEditing) setIsEditing(true);
    }
  };

  const onUpdateProfile = async (values: ProfileFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await authService.updateProfile(formData);
      if (response.ok) {
        showToast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
          variant: "success",
        });
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        await refetch();
      }
    } catch (err: unknown) {
      showToast({
        title: "Update failed",
        description: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <MainWrapper className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[36px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,213,126,0.18),rgba(255,255,255,0.9))] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
            <div className="flex items-center justify-between">
              <CardBadge>Personal Profile</CardBadge>
              <Button 
                variant={isEditing ? "outline" : "secondary"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel editing" : "Edit profile"}
              </Button>
            </div>

            {/* Profile Avatar Section - Top & Flexible */}
            <div className="mt-8 flex flex-col items-center">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-[var(--color-brand-50)] flex items-center justify-center transition-all group-hover:shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : user.image ? (
                    <img src={user.image} alt={user.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl font-bold text-[var(--color-brand-600)]">{user.name.charAt(0)}</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="text-white w-10 h-10" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-[var(--color-border)] group-hover:bg-[var(--color-brand-50)] transition-colors">
                  <Camera className="w-5 h-5 text-[var(--color-brand-600)]" />
                </div>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile && !isSubmitting && (
                <p className="mt-3 text-xs font-medium text-[var(--color-brand-600)] animate-pulse">
                  Click 'Save' to update photo
                </p>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onUpdateProfile)} className="mt-10 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Name</label>
                    <Input {...register("name")} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Phone</label>
                    <Input {...register("phone")} placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Bio</label>
                  <textarea 
                    {...register("bio")}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Address</label>
                    <Input {...register("address")} placeholder="City, Country" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Gender</label>
                    <select 
                      {...register("gender")}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>


                <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save profile changes"
                  )}
                </Button>
              </form>
            ) : (
              <>
                <div className="mt-6 flex flex-col items-center">
                  <h1 className="font-serif text-4xl tracking-tight text-[var(--color-surface-950)] text-center">
                    {user.name}
                  </h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.22em] text-[var(--color-copy-muted)] text-center">
                    {user.role} • {user.gender || "Not specified"}
                  </p>
                </div>

                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-copy-muted)]">Email address</p>
                    <p className="text-base text-[var(--color-surface-950)] font-medium">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-copy-muted)]">Phone number</p>
                    <p className="text-base text-[var(--color-surface-950)] font-medium">{user.phone || "Not provided"}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-copy-muted)]">Location</p>
                    <p className="text-base text-[var(--color-surface-950)] font-medium">{user.address || "No address added yet"}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-copy-muted)]">About me</p>
                    <p className="text-sm leading-7 text-[var(--color-copy)] italic">
                      {user.bio || "Write a short bio to introduce yourself to others in the community."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(10,86,74,0.98),rgba(7,61,53,0.96))] text-white">
              <div>
                <CardHeader>
                  <CardBadge className="bg-white/12 text-white border-white/20">Host program</CardBadge>
                  <CardTitle className="text-white text-3xl mt-2">Become a Host</CardTitle>
                  <CardDescription className="text-white/70 text-base mt-2">
                    Launch private or public events and manage attendees from your own workspace.
                  </CardDescription>
                </CardHeader>
                <div className="mt-8 space-y-4">
                  {[
                    "Create branded event pages with public or private visibility.",
                    "Approve or reject requests for invite-only experiences.",
                    "Track registrations and revenue from a single dashboard.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/78"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-brand-400)] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`mt-12 ${user.role !== "USER" ? "opacity-50 pointer-events-none" : ""}`}>
                <Button
                  onClick={handleBecomeHost}
                  variant={isHost ? "outline" : "secondary"}
                  size="lg"
                  className={isHost ? "border-white/25 bg-white/10 text-white hover:bg-white/16 shadow-none" : "w-full shadow-xl shadow-black/10"}
                  fullWidth={!isHost}
                  disabled={user.role !== "USER"}
                >
                  {user.role === "HOST" ? "Host access active" : user.role === "ADMIN" ? "Admin mode" : "Enable Host Mode"}
                </Button>
              </div>
            </Card>

            <div className="rounded-[36px] border border-[var(--color-border)] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[var(--color-surface-100)] text-[var(--color-surface-950)]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-surface-950)]">Privacy & Security</h2>
                    <p className="text-xs text-[var(--color-copy-muted)]">Manage your credentials</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSecurity(!showSecurity)}
                >
                  {showSecurity ? "Hide settings" : "Show settings"}
                </Button>
              </div>

              {showSecurity ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <ChangePasswordForm />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--color-surface-50)] flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-[var(--color-copy-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--color-copy-muted)] max-w-[240px]">
                    Update your password regularly to keep your account secure.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              label: "Current role",
              value: isHost ? "Host" : "User",
              detail: "Determines which dashboard modules are accessible.",
            },
            {
              label: "Next unlock",
              value: isHost ? "Management tools" : "Host dashboard",
              detail: "Approve invitees and monitor session performance.",
            },
            {
              label: "Recommended",
              value: isHost ? "Open dashboard" : "Setup profile",
              detail: "Complete your details to build trust with hosts.",
            },
          ].map((item) => (
            <Card key={item.label} className="border-white/40 bg-white/40 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-copy-muted)]">
                {item.label}
              </p>
              <p className="mt-5 font-serif text-3xl text-[var(--color-surface-950)]">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-copy-muted)]">
                {item.detail}
              </p>
            </Card>
          ))}
        </section>
      </MainWrapper>
    </div>
  );
}
