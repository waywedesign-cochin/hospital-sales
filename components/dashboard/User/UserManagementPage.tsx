"use client";

import Breadcrumb from "@/components/shared/Breadcrumb";
import { User } from "@/lib/types";
import {
  ArrowLeft,
  Check,
  Copy,
  DeleteIcon,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  Search as SearchIcon,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// SHADCN
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { useAuthStore } from "@/providers/AuthStoreProvider";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/DeleteDialog";
import {
  createUserAction,
  getDoctorsForAssignmentAction,
} from "@/app/actions/userActions";

const UserManagementPage = ({
  users,
  pagination,
}: {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  // Add User state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STAFF",
    assignedDoctors: [] as string[],
    doctorProfileId: "",
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [linkStaffToDoctor, setLinkStaffToDoctor] = useState(false);
  const [doctorOptions, setDoctorOptions] = useState<
    { _id: string; name: string; specialization: string[]; hasLogin: boolean }[]
  >([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Load doctors for the assignment picker the first time the dialog opens
  useEffect(() => {
    if (!isAddUserOpen || doctorOptions.length > 0) return;
    const loadDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const doctors = await getDoctorsForAssignmentAction();
        setDoctorOptions(doctors);
      } catch {
        toast.error("Couldn't load doctors");
      } finally {
        setDoctorsLoading(false);
      }
    };
    loadDoctors();
  }, [isAddUserOpen, doctorOptions.length]);

  // Redirect non-admin users
  useEffect(() => {
    if (currentUser && currentUser.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (search) params.set("search", search);
      else params.delete("search");

      router.push(`/users?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // Current page
  const currentPage = Number(searchParams.get("page") ?? pagination.page ?? 1);

  // Update query params
  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "ALL") params.delete(key);
    else params.set(key, value);

    router.push(`/users?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const page = Math.max(1, Math.min(pagination.totalPages, newPage));
    if (page === currentPage) return;
    updateQueryParam("page", String(page));
  };

  // DELETE USER HANDLER
  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete(`/api/user?id=${id}`);

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to delete user");
        return;
      }
      toast.success("User deleted successfully");
      router.refresh();
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };

  // GENERATE RANDOM PASSWORD
  const generateRandomPassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%&*";
    const all = upper + lower + digits + symbols;

    let password =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      digits[Math.floor(Math.random() * digits.length)] +
      symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setAddUserForm({ ...addUserForm, password });
    setShowPassword(true);
    setPasswordCopied(false);
  };

  // COPY PASSWORD
  const handleCopyPassword = async () => {
    if (!addUserForm.password) return;
    try {
      await navigator.clipboard.writeText(addUserForm.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy password");
    }
  };

  // TOGGLE DOCTOR ASSIGNMENT
  const toggleAssignedDoctor = (doctorId: string) => {
    setAddUserForm((prev) => ({
      ...prev,
      assignedDoctors: prev.assignedDoctors.includes(doctorId)
        ? prev.assignedDoctors.filter((id) => id !== doctorId)
        : [...prev.assignedDoctors, doctorId],
    }));
  };

  // ADD USER HANDLER
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      const res = await createUserAction(addUserForm);
      if (res.success) {
        toast.success("User added successfully!");
        setIsAddUserOpen(false);
        setAddUserForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "STAFF",
          assignedDoctors: [],
          doctorProfileId: "",
        });
        setShowPassword(false);
        setPasswordCopied(false);
        setLinkStaffToDoctor(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add user");
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2.5 rounded-lg hover:bg-[#0D1117] hover:text-white transition-all duration-150 font-medium text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="h-4 w-px bg-slate-300" />
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Users", current: true },
          ]}
        />
      </div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-[#0D1117] p-4 rounded-xl">
              <Users className="w-8 h-8 max-md:size-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Users Management
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                View and manage all users in your system
              </p>
            </div>
          </div>
          {/* Add User Dialog */}
          <Dialog
            open={isAddUserOpen}
            onOpenChange={(open) => {
              setIsAddUserOpen(open);
              // Reset on every open, not just after a successful submit —
              // otherwise a cancelled or failed attempt leaves the previous
              // values sitting in the form the next time it's opened.
              if (open) {
                setAddUserForm({
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                  role: "STAFF",
                  assignedDoctors: [],
                  doctorProfileId: "",
                });
              }
              setShowPassword(false);
              setPasswordCopied(false);
              setLinkStaffToDoctor(false);
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-11 px-6 gap-2 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all flex items-center">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden gap-0">
              <div className="bg-[#0D1117] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-white text-lg font-semibold">
                      Add a new user
                    </DialogTitle>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Create an account and set a password for them
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleAddUser}
                className="space-y-4 p-6"
                autoComplete="off"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="add-user-first-name"
                      className="text-xs font-semibold text-gray-600"
                    >
                      First Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="add-user-first-name"
                        name="new-user-first-name"
                        autoComplete="off"
                        placeholder="Jane"
                        value={addUserForm.firstName}
                        onChange={(e) =>
                          setAddUserForm({
                            ...addUserForm,
                            firstName: e.target.value,
                          })
                        }
                        className="pl-9 h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="add-user-last-name"
                      className="text-xs font-semibold text-gray-600"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="add-user-last-name"
                      name="new-user-last-name"
                      autoComplete="off"
                      placeholder="Doe"
                      value={addUserForm.lastName}
                      onChange={(e) =>
                        setAddUserForm({
                          ...addUserForm,
                          lastName: e.target.value,
                        })
                      }
                      className="h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="add-user-email"
                    className="text-xs font-semibold text-gray-600"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="add-user-email"
                      name="new-user-email"
                      type="email"
                      autoComplete="off"
                      placeholder="jane.doe@example.com"
                      value={addUserForm.email}
                      onChange={(e) =>
                        setAddUserForm({
                          ...addUserForm,
                          email: e.target.value,
                        })
                      }
                      className="pl-9 h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="add-user-password"
                      className="text-xs font-semibold text-gray-600"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="add-user-password"
                      name="new-user-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Set a password"
                      value={addUserForm.password}
                      onChange={(e) =>
                        setAddUserForm({
                          ...addUserForm,
                          password: e.target.value,
                        })
                      }
                      className="pl-9 pr-20 h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {addUserForm.password && (
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                          title="Copy password"
                        >
                          {passwordCopied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Share this password with the user securely, or have them
                    reset it after first login.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">
                    Role
                  </Label>
                  <Select
                    value={addUserForm.role}
                    onValueChange={(val) => {
                      setAddUserForm({
                        ...addUserForm,
                        role: val,
                        assignedDoctors: [],
                        doctorProfileId: "",
                      });
                      setLinkStaffToDoctor(false);
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Optionally link this staff member to specific doctors */}
                {addUserForm.role === "STAFF" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs font-semibold text-gray-600">
                          Link to a Specific Doctor
                        </Label>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Off by default — this staff member manages the whole
                          clinic.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={linkStaffToDoctor}
                        onClick={() => {
                          const next = !linkStaffToDoctor;
                          setLinkStaffToDoctor(next);
                          if (!next) {
                            setAddUserForm((prev) => ({
                              ...prev,
                              assignedDoctors: [],
                            }));
                          }
                        }}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          linkStaffToDoctor ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            linkStaffToDoctor
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {linkStaffToDoctor && (
                      <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-100">
                        {doctorsLoading ? (
                          <p className="text-xs text-gray-400 px-3 py-3">
                            Loading doctors...
                          </p>
                        ) : doctorOptions.length === 0 ? (
                          <p className="text-xs text-gray-400 px-3 py-3">
                            No doctors found yet.
                          </p>
                        ) : (
                          doctorOptions.map((doc) => (
                            <label
                              key={doc._id}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50/50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={addUserForm.assignedDoctors.includes(
                                  doc._id,
                                )}
                                onChange={() => toggleAssignedDoctor(doc._id)}
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400/30"
                              />
                              <span className="flex-1">{doc.name}</span>
                              {doc.specialization.length > 0 && (
                                <span className="text-[11px] text-gray-400">
                                  {doc.specialization[0]}
                                </span>
                              )}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Link a DOCTOR-role account to their existing Doctor profile */}
                {addUserForm.role === "DOCTOR" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">
                      Link to Doctor Profile{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Select
                      value={addUserForm.doctorProfileId}
                      onValueChange={(val) =>
                        setAddUserForm({ ...addUserForm, doctorProfileId: val })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20">
                        <SelectValue
                          placeholder={
                            doctorsLoading
                              ? "Loading doctors..."
                              : "Select doctor profile"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorOptions
                          .filter((doc) => !doc.hasLogin)
                          .map((doc) => (
                            <SelectItem key={doc._id} value={doc._id}>
                              {doc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-gray-400">
                      Connects this login to their existing profile so they only
                      see their own appointments and patients.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isAddingUser}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition-colors"
                >
                  {isAddingUser ? "Adding User..." : "Add User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
        {/* Search Input */}
        <div className="relative w-full ">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="pl-12 h-11 w-full bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
          />
        </div>

        {/* Role Filter */}
        <Select
          value={searchParams.get("role") ?? ""}
          onValueChange={(val) => updateQueryParam("role", val)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl font-medium">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="DOCTOR">Doctor</SelectItem>
            <SelectItem value="GUEST">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white z-10 rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <Table>
          <TableHeader className="bg-[#0D1117] text-white">
            <TableRow>
              <TableHead className="text-white!">Name & Email</TableHead>
              <TableHead className="text-white!">Role</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  className="hover:bg-slate-50 transition-colors border-b duration-150"
                >
                  {/* Name & Email */}
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.firstName[0].toUpperCase()}
                      </div>

                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}{" "}
                          {currentUser?._id === user._id && (
                            <span className="text-xs text-gray-400">(You)</span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell className="text-sm font-semibold text-gray-700">
                    {user.role}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/users/edit-user?id=${user._id}`}
                        className="text-amber-600 hover:bg-amber-50 p-1 rounded-full"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {/* DELETE DIALOG */}
                      {user._id !== currentUser?._id && (
                        <DeleteDialog
                          trigger={
                            <button className="text-red-600 hover:bg-red-50 p-1 rounded-full">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          }
                          title="Delete this user?"
                          description="This action cannot be undone. This will permanently remove the user."
                          onConfirm={() => handleDelete(user._id)}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          {/* Info Text */}
          <div className="text-xs text-gray-600 font-medium mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-bold text-emerald-700">
              {(currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-emerald-700">
              {Math.min(currentPage * pagination.limit, pagination.totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-emerald-700">
              {pagination.totalCount}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-xs font-bold text-emerald-700 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>

            {/* Page Numbers (hidden on very small screens) */}
            <div className="hidden sm:flex items-center gap-1 mx-1">
              {(() => {
                const total = pagination.totalPages;
                const cp = currentPage;
                const nodes: React.ReactNode[] = [];

                // first
                nodes.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all ${
                      cp === 1
                        ? "bg-[#0D1117] text-white shadow-md"
                        : "text-emerald-700 hover:bg-emerald-50 border border-emerald-100"
                    }`}
                  >
                    1
                  </button>,
                );

                if (cp > 4) {
                  nodes.push(
                    <span
                      key="e1"
                      className="px-1.5 text-emerald-400 text-xs font-bold"
                    >
                      · · ·
                    </span>,
                  );
                }

                const start = Math.max(2, cp - 1);
                const end = Math.min(total - 1, cp + 1);

                for (let i = start; i <= end; i++) {
                  if (i <= 1 || i >= total) continue;
                  nodes.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all ${
                        cp === i
                          ? "bg-[#0D1117] text-white shadow-md"
                          : "text-emerald-700 hover:bg-emerald-50 border border-emerald-100"
                      }`}
                    >
                      {i}
                    </button>,
                  );
                }

                if (cp < total - 3) {
                  nodes.push(
                    <span
                      key="e2"
                      className="px-1.5 text-emerald-400 text-xs font-bold"
                    >
                      · · ·
                    </span>,
                  );
                }

                if (total > 1) {
                  nodes.push(
                    <button
                      key={total}
                      onClick={() => handlePageChange(total)}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all ${
                        cp === total
                          ? "bg-[#0D1117] text-white shadow-md"
                          : "text-emerald-700 hover:bg-emerald-50 border border-emerald-100"
                      }`}
                    >
                      {total}
                    </button>,
                  );
                }

                return nodes;
              })()}
            </div>

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="px-3 py-2 text-xs font-bold text-emerald-700 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
