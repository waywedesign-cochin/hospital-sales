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
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [loading, setLoading] = useState(false);

  const openAddModal = () => {
    setEditMode(false);
    setForm({ name: "", description: "" });
    setSelectedId(null);
    setOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({ name: item.name, description: item.description });
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
        response = await axios.put(`/api/treatment-category?id=${selectedId}`, form);
      } else {
        response = await axios.post("/api/treatment-category", form);
      }

      if (!response.data.success) {
        toast.error(
          response.data.message || `Failed to ${editMode ? "update" : "add"} treatment category`
        );
        return;
      }

      toast.success(`Treatment category ${editMode ? "updated" : "added"} successfully`);
      setForm({
        name: "",
        description: "",
      });
      router.refresh();
      setOpen(false);
      router.push("/settings/treatment-category");
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
      toast.error(error?.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen p-2 space-y-6 relative">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Treatment Categories", current: true },
        ]}
      />

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="absolute inset-0" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border border-blue-100/50 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-primary p-4 rounded-xl shadow-lg shadow-blue-500/30">
              <Tag className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
                Treatment Categories
              </h1>
              <p className="text-slate-600 font-medium text-sm mt-1">
                Manage clinic treatment category list.
              </p>
            </div>
          </div>

          {/* ADD Category Button */}
          <button
            onClick={openAddModal}
            className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {treatmentCategories.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  No treatment categories found
                </td>
              </tr>
            ) : (
              treatmentCategories.map((item) => (
                <tr key={item._id} className="hover:bg-blue-50/30 transition">
                  <td className="px-6 py-5 text-sm font-semibold text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {item.description}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={() => openEditModal(item)}
                        variant="ghost"
                        className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 hover:shadow-md transform hover:scale-110"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <DeleteDialog
                        trigger={
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 hover:shadow-md transform hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Dialog form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Category Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}

            <Textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
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
