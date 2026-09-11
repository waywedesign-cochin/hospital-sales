"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Pencil, Trash2, Plus, Tag, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { treatmentCategorySchema } from "@/app/validations/treatmentCategoryValidations";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ITreatmentCategory } from "@/app/models/TreatmentCategory";

export default function TreatmentCategoryPage({
  treatmentCategories,
}: {
  treatmentCategories: ITreatmentCategory[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    name: string;
    description: string;
    durationMinutes: number | string;
  }>({ name: "", description: "", durationMinutes: 20 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const openAddModal = () => {
    setEditMode(false);
    setForm({ name: "", description: "", durationMinutes: 20 });
    setSelectedId(null);
    setOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      durationMinutes: item.durationMinutes || 20,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setErrors({});

    const validation = treatmentCategorySchema.safeParse(form);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      setLoading(true);

      let response;
      if (editMode && selectedId) {
        response = await axios.put(
          `/api/treatment-category?id=${selectedId}`,
          form,
        );
      } else {
        response = await axios.post("/api/treatment-category", form);
      }

      if (!response.data.success) {
        toast.error(
          response.data.message ||
            `Failed to ${editMode ? "update" : "add"} treatment category`,
        );
        return;
      }

      toast.success(
        `Treatment category ${editMode ? "updated" : "added"} successfully`,
      );
      setForm({
        name: "",
        description: "",
        durationMinutes: 20,
      });
      router.refresh();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`/api/treatment-category?id=${id}`);
      if (response.data.success) {
        toast.success("Category deleted");
        router.refresh();
      } else {
        toast.error(response.data.message || "Failed to delete category");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete category",
      );
    }
  };

  return (
    <div className="min-h-screen space-y-6 relative">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Treatment Categories", current: true },
        ]}
      />

      {/* Header */}
      <div className="relative z-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-[#0D1117] p-4 rounded-xl">
              <Tag className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Treatment Categories
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Manage clinic treatment category list
              </p>
            </div>
          </div>

          {/* ADD Category Button */}
          <Button
            type="button"
            onClick={openAddModal}
            className="h-11 px-4 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="relative z-10 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#0D1117]">
              <tr>
                {[
                  "Category Name",
                  "Description",
                  "Duration (mins)",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-bold text-slate-200 uppercase tracking-wider ${
                      i === 3 ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {treatmentCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No treatment categories found
                  </td>
                </tr>
              ) : (
                treatmentCategories.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-sm text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.durationMinutes || 20} mins
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="w-4 h-4 text-amber-600" />
                        </Button>

                        <DeleteDialog
                          trigger={
                            <Button variant="ghost">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          }
                          title="Delete Category"
                          description="Are you sure you want to delete this category?"
                          onConfirm={() => handleDelete(item._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editMode ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Category Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 bg-slate-50 border-slate-200 rounded-xl"
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}

            <Input
              type="number"
              placeholder="Duration in Minutes (e.g. 20, 30, 45, 60)"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationMinutes:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="h-11 bg-slate-50 border-slate-200 rounded-xl"
            />
            {(errors as any).durationMinutes && (
              <p className="text-red-500 text-xs">
                {(errors as any).durationMinutes}
              </p>
            )}

            <Textarea
              placeholder="Description (e.g., General consultations and routine checkups)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="bg-slate-50 border-slate-200 rounded-xl"
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              className="h-11 px-4 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all font-semibold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {editMode ? "Updating..." : "Saving..."}
                </div>
              ) : editMode ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
