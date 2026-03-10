import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function EditPoolsModal({ open, onClose, pools, editPoolId, onUpdated }) {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const poolObj = useMemo(() => {
    if (!pools) return null;
    if (!Array.isArray(pools)) return pools;

    return pools.find((p) => (p?._id || p?.id) === editPoolId) || null;
  }, [pools, editPoolId]);

  const [form, setForm] = useState({
    id: "",
    title: "",
    price: "",
    jackpot: "",
    start_at: "",
    expire_at: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const toDatetimeLocal = (val) => {
    if (!val) return "";
    const s = String(val);
    const fixed = s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s;
    const d = new Date(fixed);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  };

  const makeUrl = (path) => {
    if (!path) return "";
    const str = String(path);
    if (/^https?:\/\//i.test(str)) return str;
    if (!baseURL) return str;
    return `${baseURL.replace(/\/$/, "")}/${str.replace(/^\//, "")}`;
  };

  // ✅ cache-buster to force latest image
  const bust = (url) =>
    url ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}` : "";

  const poolIdentifier = useMemo(() => {
    return poolObj?.slug || poolObj?.id || poolObj?._id || "";
  }, [poolObj]);

  useEffect(() => {
    if (!open) return;
    if (!poolObj) return;

    const startVal =
      poolObj.start_at ??
      poolObj.startedAt ??
      poolObj.startAt ??
      poolObj.started_at ??
      "";

    const expireVal =
      poolObj.expire_at ??
      poolObj.expiredAt ??
      poolObj.expireAt ??
      poolObj.expired_at ??
      "";

    const imgVal =
      poolObj.imageUrl ??
      poolObj.Imageurl ??
      poolObj.image ??
      poolObj.image_url ??
      poolObj.pool_image ??
      poolObj.thumbnail ??
      poolObj.banner ??
      "";

    setForm({
      id: poolObj.id || poolObj._id || "",
      title: poolObj.title || "",
      price: poolObj.price ?? "",
      jackpot: poolObj.jackpot ?? "",
      start_at: toDatetimeLocal(startVal),
      expire_at: toDatetimeLocal(expireVal),
    });

    // ✅ bust cache on open
    setPreview(bust(makeUrl(imgVal)));
    setImageFile(null);
  }, [open, poolObj]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // ✅ show selected image instantly
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!poolIdentifier) {
      alert("Pool id not found");
      return;
    }

    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      alert("Admin token missing. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("price", String(form.price));
      fd.append("jackpot", String(form.jackpot));
      fd.append("start_at", form.start_at);
      fd.append("expire_at", form.expire_at);

      if (imageFile) fd.append("image", imageFile);

      const slug = poolObj?.slug || poolIdentifier;

      const res = await axiosInstance.patch(`/admin/pool/${slug}`, fd, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          // ✅ DO NOT set multipart content-type manually
        },
      });

      if (!res.data?.success) {
        alert(res.data?.message || "Update failed");
        return;
      }

      // ✅ Update preview using response image (if available) + bust cache
      const updated = res.data?.data || res.data?.pool || null;

      const updatedImgVal =
        updated?.imageUrl ??
        updated?.Imageurl ??
        updated?.image ??
        updated?.image_url ??
        updated?.pool_image ??
        updated?.thumbnail ??
        updated?.banner ??
        "";

      if (updatedImgVal) {
        setPreview(bust(makeUrl(updatedImgVal)));
      } else if (preview && preview.startsWith("blob:")) {
        // keep local preview if backend doesn't return image url
        setPreview(preview);
      }

      setImageFile(null);

      // ✅ refresh table/list
      onUpdated?.();

      // ✅ close modal
      onClose?.();
    } catch (err) {
      console.log("STATUS:", err?.response?.status);
      console.log("DATA:", err?.response?.data);
      console.log("MSG:", err?.message);

      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
      <div className="bg-white w-full max-w-lg rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4">Edit pool</h3>

        {!poolObj ? (
          <p className="text-sm text-gray-500">
            Pool data not found. Please try again.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Pool Image
              </label>

              <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
              </div>

              {imageFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <input
              type="number"
              name="jackpot"
              value={form.jackpot}
              onChange={handleChange}
              placeholder="Jackpot"
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <input
              type="datetime-local"
              name="start_at"
              value={form.start_at}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="datetime-local"
              name="expire_at"
              value={form.expire_at}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border text-gray-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-black text-[#F0B100] font-semibold"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditPoolsModal;
