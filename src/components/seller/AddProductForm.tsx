import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: string;
  brand_id: number;
  brand_name?: string;
  category_id: number;
  subcategory_id: number;
  image_url: string;
  seller_id?: number;
  status?: string;
}

export interface AddProductFormProps {
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onClose,
  onAddProduct,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    brand_id: "",
    category_id: "",
    subcategory_id: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* ✅ Load categories once */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));

    axios
      .get("http://localhost:5000/api/brands")
      .then((res) => setBrands(res.data))
      .catch(() => toast.error("Failed to load brands"));
  }, []);

  /* ✅ Load subcategories ONLY for selected category */
  useEffect(() => {
    if (!form.category_id) {
      setSubcategories([]);
      return;
    }

    setSubcategories([]); // 🔴 CLEAR OLD SUBCATEGORIES FIRST

    axios
      .get(`http://localhost:5000/api/products/subcategories/${form.category_id}`)
      .then((res) => setSubcategories(res.data))
      .catch(() => toast.error("Failed to load subcategories"));
  }, [form.category_id]);

  /* ✅ Image Upload */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToS3 = async (files: File[]) => {
    const fileInfos = files.map((f) => ({
      fileName: f.name,
      fileType: f.type,
    }));

    const { data } = await axios.post(
      "http://localhost:5000/api/s3/generate-upload-urls",
      { files: fileInfos }
    );

    await Promise.all(
      files.map((file, i) =>
        axios.put(data.urls[i].uploadUrl, file, {
          headers: { "Content-Type": file.type },
        })
      )
    );

    return data.urls.map((u) => u.imageUrl);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.category_id || !form.subcategory_id || !form.brand_id) {
      toast.error("Please select category, subcategory and brand");
      return;
    }

    try {
      const sellerId = localStorage.getItem("seller_id");
      if (!sellerId) {
        toast.error("Seller not logged in");
        return;
      }

      setLoading(true);

      const uploadedUrls = await uploadImagesToS3(images);

      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        stock: form.stock,
        brand_id: Number(form.brand_id),
        category_id: Number(form.category_id),
        subcategory_id: Number(form.subcategory_id),
        image_url: uploadedUrls[0],
        seller_id: Number(sellerId),
        status: "pending",
      };

      const res = await axios.post(
        "http://localhost:5000/api/products",
        payload
      );

      onAddProduct(res.data.product);
      toast.success("Product added successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Product will be published after admin approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name *</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Stock *</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select
                value={form.category_id}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    category_id: value,
                    subcategory_id: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem
                      key={c.category_id}
                      value={String(c.category_id)}
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div>
              <Label>Subcategory *</Label>
              <Select
                value={form.subcategory_id}
                onValueChange={(value) =>
                  setForm({ ...form, subcategory_id: value })
                }
                disabled={!subcategories.length}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      subcategories.length
                        ? "Select subcategory"
                        : "Select category first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((s) => (
                    <SelectItem
                      key={s.subcategory_id}
                      value={String(s.subcategory_id)}
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div>
              <Label>Brand *</Label>
              <Select
                value={form.brand_id}
                onValueChange={(value) =>
                  setForm({ ...form, brand_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>Images (Max 5)</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      className="h-20 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
