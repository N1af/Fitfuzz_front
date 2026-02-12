import { useEffect, useState } from "react";
import api from "../../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, X } from "lucide-react";

interface Poster {
  id: number;
  title: string;
  image_url: string;
  category_id: number;
  created_at: string;
}

interface Category {
  category_id: number;
  name: string;
}

const Posters = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch Posters ---------------- */
  const fetchPosters = async () => {
    try {
      const res = await api.get("/api/posters");
      setPosters(res.data);
    } catch (err) {
      console.error("❌ Fetch posters failed", err);
    }
  };

  /* ---------------- Fetch Categories ---------------- */
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data);
      if (res.data.length > 0) setCategoryId(res.data[0].category_id);
    } catch (err) {
      console.error("❌ Fetch categories failed", err);
    }
  };

  useEffect(() => {
    fetchPosters();
    fetchCategories();
  }, []);

  /* ---------------- Get S3 Presigned URL ---------------- */
  const getUploadUrl = async (file: File) => {
    const { data } = await api.post("/api/posters/upload-poster-url", {
      fileName: file.name,
      fileType: file.type,
    });
    return data;
  };

  /* ---------------- Upload Poster ---------------- */
  const handleUpload = async () => {
    if (!title || !file) {
      alert("Please provide a title and select an image");
      return;
    }

    try {
      setLoading(true);
      const { uploadUrl, imageUrl } = await getUploadUrl(file);

      // Upload file to S3
      await api.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // Create poster in backend
      await api.post("/api/posters/create", {
        title,
        image_url: imageUrl,
        category_id: categoryId,
      });

      setFile(null);
      setTitle("");
      setCategoryId(categories[0]?.category_id || 1);
      fetchPosters();
    } catch (err) {
      console.error("❌ Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Delete Poster ---------------- */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this poster?")) return;
    try {
      await api.delete(`/api/posters/${id}`);
      fetchPosters();
    } catch (err) {
      console.error("❌ Delete failed", err);
    }
  };

  /* ---------------- Map category_id to category name ---------------- */
  const getCategoryName = (id: number) =>
    categories.find((c) => c.category_id === id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Poster</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Poster title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2"
          />

          {file && (
            <div className="relative inline-block mt-2">
              <span className="px-2 py-1 bg-gray-200 rounded text-sm">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <select
            className="border rounded px-3 py-2"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button onClick={handleUpload} disabled={loading}>
            <Upload className="w-4 h-4 mr-2" />
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      {/* Posters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posters.map((p) => (
          <Card key={p.id} className="overflow-hidden relative">
            <img
              src={p.image_url}
              alt={p.title}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-2 text-xs text-muted-foreground flex justify-between items-center">
              <div>
                <div>Title: {p.title}</div>
                <div>Category: {getCategoryName(p.category_id)}</div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(p.id)}
                className="ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Posters;
