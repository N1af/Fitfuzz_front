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
import api from "../../api";

import { Button } from "../ui/button";

export interface Brand {
    id: string;
    name: string;
    logo_url?: string;
}

export interface AddBrandFormProps {
    onClose: () => void;
    onAddBrand: (brandData: Omit<Brand, "id">) => Promise<void>; // Changed type
}

const AddBrandForm: React.FC<AddBrandFormProps> = ({
    onClose,
    onAddBrand,
}) => {
    const [name, setName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle Image Upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        setImage(file);
    };

    // Remove selected image
    const removeImage = () => {
        setImage(null);
    };

    // Upload images to S3
    const uploadImageToS3 = async (file: File): Promise<string> => {
        const fileInfo = { fileName: file.name, fileType: file.type };
        const { data } = await api.post(
            "/api/s3/upload-brand-urls",
            { files: [fileInfo] }
        );

        const urls = data.urls; // [{ uploadUrl, imageUrl }]
        await api.put(urls[0].uploadUrl, file, {
            headers: { "Content-Type": file.type },
        });

        return urls[0].imageUrl;
    };

    // Submit form - FIXED: NO API CALL HERE
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!image) {
            toast.error("Please select an image");
            return;
        }

        if (!name.trim()) {
            toast.error("Please enter a brand name");
            return;
        }

        try {
            setLoading(true);

            // 1. Upload image to S3 only
            const logo_url = await uploadImageToS3(image);

            // 2. Prepare brand data
            const brandData = {
                name: name.trim(),
                logo_url: logo_url,
            };

            console.log("📤 Sending brand data to parent:", brandData);

            // 3. Call parent function - THIS WILL MAKE THE API CALL
            await onAddBrand(brandData);
            
            // 4. Reset and close
            setName("");
            setImage(null);
            onClose();
            
        } catch (error) {
            console.error("Error in AddBrandForm:", error);
            // Error is already shown by parent, so no need to show again
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter brand name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Brand Image</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                            {!image ? (
                                <>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        required
                                        disabled={loading}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="image"
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload image
                                        </p>
                                    </label>
                                </>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Selected image:
                                    </p>
                                    <div className="relative inline-block">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                            disabled={loading}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {image.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || !name.trim() || !image}
                        >
                            {loading ? "Adding..." : "Add Brand"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddBrandForm;