"use client";

import Breadcrumb from "@/components/shared/Breadcrumb";
import { User } from "@/lib/types";
import {
  ArrowLeft,
  DeleteIcon,
  Edit,
  Eye,
  Search as SearchIcon,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// SHADCN
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

  return (
    <div className="space-y-6 p-2">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2 hover:bg-blue-500 hover:text-white transition-all"
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
      <div className="relative overflow-hidden rounded-3xl  backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-[#ABEDCC]">
        <div className="flex flex-col md:flex-row justify-between items-center   gap-4  backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-green-100/50">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-greenpick p-4 rounded-xl shadow-lg shadow-blue-500/30">
              <Users className="w-8 h-8 max-md:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-greenpick tracking-tight">
                Users Management
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                View and manage all users in your system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between p-5 bg-white backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
        {/* Search Input */}
        <div className="relative w-full ">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="pl-12 h-11 w-full bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
          />
        </div>

        {/* Role Filter */}
        <Select
          value={searchParams.get("role") ?? ""}
          onValueChange={(val) => updateQueryParam("role", val)}
        >
          <SelectTrigger className="w-full bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium">
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
      <div className="bg-white backdrop-blur-sm z-10 rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <Table>
          <TableHeader className="bg-greenpick text-white">
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
                  className="hover:bg-gray-50 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 transition-colors border-b duration-150"
                >
                  {/* Name & Email */}
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-greenpick rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      {/* <button className="text-blue-500 hover:bg-blue-50 p-1 rounded-full">
                        <Eye className="w-4 h-4" />
                      </button> */}

                      <Link
                        href={`/users/edit-user?id=${user._id}`}
                        className="text-yellow-600 hover:bg-yellow-50 p-1 rounded-full"
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
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-linear-to-r from-indigo-50/30 via-purple-50/20 to-pink-50/10 border-t border-indigo-100/50">
          {/* Info Text */}
          <div className="text-xs text-gray-600 font-medium mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-bold text-indigo-700">
              {(currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-indigo-700">
              {Math.min(currentPage * pagination.limit, pagination.totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-indigo-700">
              {pagination.totalCount}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-xs font-bold text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
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
                    className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                      cp === 1
                        ? "bg-greenpick text-white shadow-md shadow-green-500/40 scale-105"
                        : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                    }`}
                  >
                    1
                  </button>
                );

                if (cp > 4) {
                  nodes.push(
                    <span
                      key="e1"
                      className="px-1.5 text-indigo-400 text-xs font-bold"
                    >
                      · · ·
                    </span>
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
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                        cp === i
                          ? "bg-greenpick text-white shadow-lg shadow-green-500/40 scale-105"
                          : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (cp < total - 3) {
                  nodes.push(
                    <span
                      key="e2"
                      className="px-1.5 text-green-400 text-xs font-bold"
                    >
                      · · ·
                    </span>
                  );
                }

                if (total > 1) {
                  nodes.push(
                    <button
                      key={total}
                      onClick={() => handlePageChange(total)}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                        cp === total
                          ? "bg-greenpick text-white shadow-lg shadow-indigo-500/40 scale-105"
                          : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                      }`}
                    >
                      {total}
                    </button>
                  );
                }

                return nodes;
              })()}
            </div>

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="px-3 py-2 text-xs font-bold text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
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
