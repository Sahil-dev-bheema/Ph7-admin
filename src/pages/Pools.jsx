import React, { useEffect, useMemo, useState } from "react";
import PoolsTable from "../components/AdminPools/PoolsTable";

import axiosInstance from "../utils/axiosInstance";

const initialForm = {
  title: "",
  price: "",
  jackpot: "",
  startedAt: "",
  expiredAt: "",
  imageFile: null,
};

const Pools = () => {
  const [pools, setPools] = useState([]);

  // modal
  const [open, setOpen] = useState(false);

  // form
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // image preview
  const previewUrl = useMemo(() => {
    if (!form.imageFile) return "";
    return URL.createObjectURL(form.imageFile);
  }, [form.imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------------- MODAL ---------------- */
  const openModal = () => {
    setOpen(true);
    setErrors({});
  };

  const closeModal = () => {
    setOpen(false);
    setErrors({});
    setForm(initialForm);
  };

  /* ---------------- FORM ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      setForm((prev) => ({ ...prev, imageFile: files[0] || null }));
      setErrors((prev) => ({ ...prev, imageFile: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "This field is required";

    if (!form.price) newErrors.price = "This field is required";
    else if (Number(form.price) <= 0)
      newErrors.price = "Price must be greater than 0";

    if (!form.jackpot) newErrors.jackpot = "This field is required";
    else if (Number(form.jackpot) <= 0)
      newErrors.jackpot = "Jackpot must be greater than 0";

    if (!form.startedAt) newErrors.startedAt = "This field is required";
    if (!form.expiredAt) newErrors.expiredAt = "This field is required";

    if (form.startedAt && form.expiredAt) {
      const s = new Date(form.startedAt).getTime();
      const e = new Date(form.expiredAt).getTime();
      if (e <= s) newErrors.expiredAt = "Expire must be after start";
    }

    if (!form.imageFile)
      newErrors.imageFile = "Pool image is required";
    else if (!form.imageFile.type.startsWith("image/"))
      newErrors.imageFile = "Invalid image file";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("jackpot", form.jackpot);
      formData.append("start_at", form.startedAt);
      formData.append("expire_at", form.expiredAt);
      formData.append("Imageurl", form.imageFile); // 👈 multer
       const adminToken = localStorage.getItem("admin_token");

      const res = await axiosInstance.post(
        "/pool/add-pools",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
               Authorization: `Bearer ${adminToken}`,
          },
          withCredentials: true, // ✅ cookies send karne ke liye
        }
      );

      if (!res.data?.success)
        throw new Error(res.data?.message || "Failed");

      // optimistic UI update
      const newpools = {
        id: Date.now(),
        title: form.title,
        price: Number(form.price),
        jackpot: Number(form.jackpot),
        started_at: form.startedAt,
        expired_at: form.expiredAt,
        Imageurl: `/uploads/${form.imageFile.name}`,
      };

      setPools((prev) => [newpools, ...prev]);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setPools((prev) => prev.filter((t) => t.id !== id));
  };

  /* ---------------- UI ---------------- */
  const input =
    "w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-200";
  const error =
    "border-red-500 focus:ring-2 focus:ring-red-200";
  const label = "text-sm font-semibold text-gray-700";
  const errText = "text-xs text-red-600 mt-1";

  return (
    <div className="max-w-6xl mx-auto">
      <PoolsTable
        pools={pools}
        onDelete={handleDelete}
        onAddClick={openModal}
      />

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-lg">
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h2 className="font-bold text-lg">Add pools</h2>
              <button onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className={label}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`${input} ${errors.title && error}`}
                />
                {errors.title && <p className={errText}>{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className={`${input} ${errors.price && error}`}
                  />
                  {errors.price && <p className={errText}>{errors.price}</p>}
                </div>

                <div>
                  <label className={label}>Jackpot</label>
                  <input
                    type="number"
                    name="jackpot"
                    value={form.jackpot}
                    onChange={handleChange}
                    className={`${input} ${errors.jackpot && error}`}
                  />
                  {errors.jackpot && <p className={errText}>{errors.jackpot}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Started At</label>
                  <input
                    type="datetime-local"
                    name="startedAt"
                    value={form.startedAt}
                    onChange={handleChange}
                    className={`${input} ${errors.startedAt && error}`}
                  />
                </div>

                <div>
                  <label className={label}>Expired At</label>
                  <input
                    type="datetime-local"
                    name="expiredAt"
                    value={form.expiredAt}
                    onChange={handleChange}
                    className={`${input} ${errors.expiredAt && error}`}
                  />
                </div>
              </div>

              <div>
                <label className={label}>pools Image</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleChange}
                  className={`${input} ${errors.imageFile && error}`}
                />
                {errors.imageFile && (
                  <p className={errText}>{errors.imageFile}</p>
                )}

                {form.imageFile && (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="mt-2 h-28 rounded border object-contain"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-[#F0B100] px-5 py-2 rounded-lg font-semibold"
                >
                  {loading ? "Saving..." : "Add pools"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pools;
