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
import api from "../../api"; // because AddProductForm is in src/components/seller/

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
  images?: string[];
  original_price?: string;
  seller_id?: number;
  status?: string;
  sizes?: number[]; // ✅ add this
  colors?: number[];
}

export interface AddProductFormProps {
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
  product?: Product;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onClose,
  onAddProduct,
  product,
}) => {
  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;
    original_price: string;
    stock: string;
    brand_id: string;
    category_id: string;
    subcategory_id: string;
    sizes: string[];
    colors: string[];
  }>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    original_price: product?.original_price || "",
    stock: product?.stock || "",
    brand_id: product?.brand_id ? String(product.brand_id) : "",
    category_id: product?.category_id ? String(product.category_id) : "",
    subcategory_id: product?.subcategory_id
      ? String(product.subcategory_id)
      : "",
    sizes: product?.sizes ? product.sizes.map(String) : [],
    colors: product?.colors ? product.colors.map(String) : [],
  });

  useEffect(() => {
    if (product) {
      // Fill form with existing product for editing
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        original_price: product.original_price || "",
        stock: product.stock || "",
        brand_id: product.brand_id ? String(product.brand_id) : "",
        category_id: product.category_id ? String(product.category_id) : "",
        subcategory_id: product.subcategory_id
          ? String(product.subcategory_id)
          : "",
        sizes: product.sizes ? product.sizes.map(String) : [],
        colors: product.colors ? product.colors.map(String) : [],
      });

      setExistingImages(product.images || []);
    } else {
      // Reset form for Add New Product
      setForm({
        name: "",
        description: "",
        price: "",
        original_price: "",
        stock: "",
        brand_id: "",
        category_id: "",
        subcategory_id: "",
        sizes: [],
        colors: [],
      });
      setExistingImages([]);
    }
  }, [product]);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images || [],
  );
  const [brands, setBrands] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* ✅ Load categories, brands, sizes, colors once */
  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));

    api
      .get("/api/brands")
      .then((res) => setBrands(res.data))
      .catch(() => toast.error("Failed to load brands"));

    api
      .get("/api/sizes")
      .then((res) => setSizes(res.data))
      .catch(() => toast.error("Failed to load sizes"));

    api
      .get("/api/colors")
      .then((res) => setColors(res.data))
      .catch(() => toast.error("Failed to load colors"));
  }, []);

  /* ✅ Load subcategories ONLY for selected category */
  useEffect(() => {
    if (!form.category_id) {
      setSubcategories([]);
      return;
    }

    setSubcategories([]);

    api
      .get(`/api/products/subcategories/${form.category_id}`)
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

    const { data } = await api.post("/api/s3/generate-upload-urls", {
      files: fileInfos,
    });

    await Promise.all(
      files.map((file, i) =>
        api.put(data.urls[i].uploadUrl, file, {
          headers: { "Content-Type": file.type },
        }),
      ),
    );

    return data.urls.map((u) => u.imageUrl);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !form.category_id ||
      !form.subcategory_id ||
      !form.brand_id ||
      !form.sizes.length ||
      !form.colors.length
    ) {
      toast.error(
        "Please select category, subcategory, brand, size, and color",
      );
      return;
    }

    // ✅ If category is Sale, original_price must be filled
    const selectedCategory = categories.find(
      (c) => String(c.category_id) === form.category_id,
    );
    if (selectedCategory?.name === "Sale" && !form.original_price) {
      toast.error("Please enter original price for Sale products");
      return;
    }

    try {
      const sellerId = localStorage.getItem("seller_id");
      if (!sellerId) {
        toast.error("Seller not logged in");
        return;
      }

      setLoading(true);

      let finalImages: string[] = [...existingImages];

      // ✅ Upload ONLY if user selected new images
      if (images.length > 0) {
        const newUploadedUrls = await uploadImagesToS3(images);
        finalImages = [...finalImages, ...newUploadedUrls];
      }

      // ✅ Remove duplicates
      finalImages = Array.from(new Set(finalImages));

      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        original_price: form.original_price || null,
        stock: form.stock,
        brand_id: Number(form.brand_id),
        category_id: Number(form.category_id),
        subcategory_id: Number(form.subcategory_id),
        sizes: form.sizes.map(Number),
        colors: form.colors.map(Number),
        image_url: finalImages[0] || null,
        images: finalImages,
        seller_id: Number(sellerId),
        status: "approved",
      };

      let res;

      if (product) {
        // 🔁 UPDATE
        res = await api.put(`/api/products/${product.id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        // ➕ ADD
        if (finalImages.length === 0) {
          toast.error("Please upload at least one image");
          setLoading(false);
          return;
        }

        res = await api.post("/api/products", payload);
        toast.success("Product added successfully!");
      }

      onAddProduct(res.data.product);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE SIZE CHECKBOX ================= */
  const toggleSize = (sizeId: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(sizeId)
        ? prev.sizes.filter((s) => s !== sizeId)
        : [...prev.sizes, sizeId],
    }));
  };

  /* ================= HANDLE COLOR CHECKBOX ================= */
  const toggleColor = (colorId: string) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter((c) => c !== colorId)
        : [...prev.colors, colorId],
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Update Product" : "Add New Product"}
          </DialogTitle>

          <DialogDescription>
            Product will be published immediately
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            {/* ✅ Show Original Price ONLY if category is Sale */}
            {categories.find((c) => String(c.category_id) === form.category_id)
              ?.name === "Sale" && (
              <div>
                <Label>Original Price *</Label>
                <Input
                  type="number"
                  value={form.original_price}
                  onChange={(e) =>
                    setForm({ ...form, original_price: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div>
              <Label>Stock *</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>

          {/* ... rest of your code remains exactly the same, sizes, colors, images, submit button ... */}

          <div className="grid grid-cols-4 gap-4">
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
                onValueChange={(value) => setForm({ ...form, brand_id: value })}
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

            {/* Size */}
            <div>
              <Label>Size *</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {sizes.map((s) => (
                  <label key={s.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={form.sizes.includes(String(s.id))}
                      onChange={() => toggleSize(String(s.id))}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label>Colors *</Label>
            <div className="flex flex-wrap gap-3 mt-1">
              {colors.map((c) => (
                <label key={c.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    value={c.id}
                    checked={form.colors.includes(String(c.id))}
                    onChange={() => toggleColor(String(c.id))}
                  />
                  {c.name}
                </label>
              ))}
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

            {(existingImages.length > 0 || images.length > 0) && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {existingImages.map((url, i) => (
                  <div key={`existing-${i}`} className="relative">
                    <img
                      src={url}
                      className="h-20 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExistingImages((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.map((img, i) => (
                  <div key={`new-${i}`} className="relative">
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
              {loading
                ? product
                  ? "Updating..."
                  : "Adding..."
                : product
                  ? "Update Product"
                  : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
