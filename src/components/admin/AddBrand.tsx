import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";

export interface Brand {
    id: string;
    name: string;
    images: File | null;
}

export interface AddBrandFormProps {
    onClose: () => void;
    onAddBrand: (brand: Brand) => void;
}

const AddBrandForm: React.FC<AddBrandFormProps> = ({
    onClose,
    onAddBrand,
}) => {
    const [form, setForm] = useState({
        name: "",
        images: null,
    });
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    // Handle Image Upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        if (images.length + files.length > 1) {
            toast.error("Maximum 1 images allowed");
            return;
        }

        setImages([...images, ...files]);
    };

    // Remove selected image
    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Upload images to S3
    const uploadImagesToS3 = async (files: File[]) => {
        const fileInfos = files.map(f => ({ fileName: f.name, fileType: f.type }));
        const { data } = await axios.post(
            "http://localhost:5000/api/s3/upload-brand-urls",
            { files: fileInfos }
        );

        const urls = data.urls; // [{ uploadUrl, imageUrl }]
        await Promise.all(
            files.map((file, index) =>
                axios.put(urls[index].uploadUrl, file, {
                    headers: { "Content-Type": file.type },
                })
            )
        );

        return urls.map(u => u.imageUrl);
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const uploadedUrls = await uploadImagesToS3(images);

            const brandData = {
                name: form.name,
                logo_url: uploadedUrls[0], // use logo_url to match backend
            };

            const response = await axios.post(
                "http://localhost:5000/api/brands/create-brand",
                brandData,
                { headers: { "Content-Type": "application/json" } }
            );

            onAddBrand(response.data.brand);
            toast.success("Brand Added Successfully!");
            onClose();
        } catch (error) {
            console.error("Error adding brand:", error);
            toast.error("Failed to add brand. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Brand</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new brand.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="name">Brand Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="images">Brand Image (*Please name your image before uploading)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                            <Input
                                id="images"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setForm((prev) => ({
                                        ...prev,
                                        images: file,
                                    }));
                                    handleImageUpload(e);
                                }}
                                required
                            />
                            <label
                                htmlFor="images"
                                className="flex flex-col items-center justify-center cursor-pointer"
                            >
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Click to upload images
                                </p>
                            </label>

                            {images.length > 0 && (
                                <div className="grid grid-cols-5 gap-2 mt-4">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Brand"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddBrandForm;
