import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

function AddPackages() {
  const [form, setForm] = useState({
    name: "",
    price: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- HANDLE CHANGE ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // clear server messages when typing
    setServerError("");
    setSuccess("");
  };

  /* ---------- VALIDATION ---------- */
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "This field is required";
    }

    if (!form.price) {
      newErrors.price = "This field is required";
    } else if (Number(form.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- SUBMIT (✅ API INTEGRATION) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    if (!validate()) return;

    try {
      setSaving(true);
const token = localStorage.getItem("admin_token");

const res = await axiosInstance.post(
  "/package/add",
  {
    package_name: form.name.trim(),
    package_price: Number(form.price),
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      // If your API returns { success: true, message: "...", data: {...} }
      if (res.data?.success === false) {
        throw new Error(res.data?.message || "Failed to add package.");
      }

      setSuccess(res.data?.message || "✅ Package added successfully!");

      // reset form
      setForm({ name: "", price: "" });
      setErrors({});
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while adding package.";
      setServerError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Package</h2>

      {/* ✅ Success message */}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {/* ✅ Error message */}
      {serverError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Package Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter package name"
            className={[
              "w-full rounded-lg px-3 py-2 text-sm border focus:outline-none transition",
              errors.name
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-teal-500",
            ].join(" ")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (🪙)
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            className={[
              "w-full rounded-lg px-3 py-2 text-sm border focus:outline-none transition",
              errors.price
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-teal-500",
            ].join(" ")}
          />
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className={[
            "w-full mt-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
            saving
              ? "bg-teal-300 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 active:scale-[0.98]",
          ].join(" ")}
        >
          {saving ? "Saving..." : "Save Package"}
        </button>
      </form>
    </div>
  );
}

export default AddPackages;
