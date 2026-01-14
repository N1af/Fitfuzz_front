import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddBrandForm from "./AddBrand";
import { useEffect, useState } from "react";
import { Plus, Trash } from "lucide-react";
import api from "../../api"; // because AddProductForm is in src/components/seller/


interface Brand {
    id: string;
    name: string;
    logo_url?: string; // match backend
}

export default function Brand() {
    const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);

    // Add new brand
    const handleAddBrand = async (newBrand: Omit<Brand, "id">) => {
        try {
            const res = await api.post("/api/brands/create-brand", newBrand);
            setBrands((prev) => [res.data.brand, ...prev]);
            setIsAddBrandOpen(false);
            toast.success("Brand added successfully!");
        } catch (err) {
            console.error("❌ Error adding brand:", err);
            toast.error("Failed to add brand. Try again.");
        }
    };

    // Delete a brand
    const handleDeleteBrand = async (id: string) => {
        if (!confirm("Are you sure you want to delete this brand?")) return;

        try {
            await api.delete(`http://localhost:5000/api/brands/${id}`);
            setBrands((prev) => prev.filter((b) => b.id !== id));
            toast.success("Brand deleted successfully!");
        } catch (err) {
            console.error("❌ Error deleting brand:", err);
            toast.error("Failed to delete brand. Try again.");
        }
    };

    // Fetch all brands
    const fetchBrands = async () => {
        try {
            const res = await api.get("/api/brands/");
            const brandsData = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.brands)
                    ? res.data.brands
                    : [];
            setBrands(brandsData);
        } catch (err) {
            console.error("❌ Error fetching brands:", err);
            toast.error("Failed to fetch brands. Please try again.");
            setBrands([]);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-semibold">Brands</CardTitle>
                            <CardDescription>Manage your brands</CardDescription>
                        </div>

                        <div className="flex gap-3 mt-3 md:mt-0">
                            <Button
                                onClick={() => setIsAddBrandOpen(true)}
                                className="gap-2 bg-primary text-white hover:bg-primary/90 transition-all px-6 py-3"
                            >
                                <Plus className="w-4 h-4" /> Add Brand
                            </Button>
                        </div>

                        {isAddBrandOpen && (
                            <AddBrandForm
                                onClose={() => setIsAddBrandOpen(false)}
                                onAddBrand={handleAddBrand}
                            />
                        )}
                    </CardHeader>

                    <CardContent>
                        {brands.length === 0 ? (
                            <p className="text-gray-500">No brands available</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {brands.map((b) => (
                                    <div key={b.id} className="border rounded-lg p-4 shadow-sm relative">
                                        <img
                                            src={b.logo_url || "/placeholder.png"}
                                            alt={b.name}
                                            className="w-full h-40 object-cover rounded-md mb-3"
                                        />
                                        <h3 className="font-semibold">{b.name}</h3>
                                        
                                        {/* Delete button */}
                                        <Button
                                            onClick={() => handleDeleteBrand(b.id)}
                                            variant="destructive"
                                            className="absolute top-2 right-2 p-2 rounded-full"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
