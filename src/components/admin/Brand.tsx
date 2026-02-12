import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddBrandForm from "./AddBrand";
import { useEffect, useState } from "react";
import { Plus, Trash } from "lucide-react";
import api from "../../api";

interface Brand {
    id: string;
    name: string;
    logo_url?: string;
}

export default function Brand() {
    const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);

    // Add new brand - ONLY API CALL IS HERE
    const handleAddBrand = async (newBrand: Omit<Brand, "id">) => {
        console.log("🎯 handleAddBrand called with:", newBrand);
        setLoading(true);
        try {
            // SINGLE API CALL
            const res = await api.post("/api/brands/create-brand", newBrand);
            console.log("✅ API Response:", res.data);
            
            // Update state with the new brand
            setBrands((prev) => [res.data.brand, ...prev]);
            setIsAddBrandOpen(false);
            toast.success("Brand added successfully!");
        } catch (err: any) {
            console.error("❌ Error adding brand:", err);
            
            // Show appropriate error message
            if (err.response?.data?.error?.includes("duplicate")) {
                toast.error("Brand name already exists. Please use a different name.");
            } else if (err.response?.data?.error) {
                toast.error(`Failed: ${err.response.data.error}`);
            } else {
                toast.error("Failed to add brand. Try again.");
            }
            
            // Re-throw error so AddBrandForm stays open
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a brand
    const handleDeleteBrand = async (id: string) => {
        if (!confirm("Are you sure you want to delete this brand?")) return;

        try {
            await api.delete(`/api/brands/${id}`);
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
                                disabled={loading}
                            >
                                <Plus className="w-4 h-4" /> Add Brand
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Move AddBrandForm here, not inside CardHeader */}
                        {isAddBrandOpen && (
                            <AddBrandForm
                                onClose={() => setIsAddBrandOpen(false)}
                                onAddBrand={handleAddBrand}
                            />
                        )}

                        {brands.length === 0 ? (
                            <p className="text-gray-500">No brands available</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {brands.map((b) => (
                                    <div key={b.id} className="border rounded-lg p-4 shadow-sm relative">
                                        <div className="h-40 flex items-center justify-center bg-gray-100 rounded-md mb-3">
                                            <img
                                                src={b.logo_url || "/placeholder.png"}
                                                alt={b.name}
                                                className="max-w-full max-h-40 object-contain rounded-md"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.png";
                                                }}
                                            />
                                        </div>
                                        <h3 className="font-semibold text-center">{b.name}</h3>
                                        
                                        {/* Delete button */}
                                        <Button
                                            onClick={() => handleDeleteBrand(b.id)}
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 p-2 rounded-full h-8 w-8"
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