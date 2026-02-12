import React, { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "../api";

interface LocationFormProps {
  onClose: () => void;
  onSaved?: (savedLocation: any) => void;
}

export interface LocationData {
  province: string;
  district: string;
  village: string;
  delivery_charge: number;
  phone?: string;
}


const LocationForm: FC<LocationFormProps> = ({ onClose, onSaved }) => {
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [villages, setVillages] = useState<{ village: string; charge: number }[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [phone, setPhone] = useState("");

  // Load provinces
  useEffect(() => {
    api.get("/api/locations/provinces")
      .then(res => setProvinces(res.data))
      .catch(err => console.error(err));
  }, []);

  // Load districts
  useEffect(() => {
    if (!selectedProvince) return;
    api.get(`/api/locations/districts/${selectedProvince}`)
      .then(res => {
        setDistricts(res.data);
        setSelectedDistrict("");
        setVillages([]);
        setSelectedVillage("");
      })
      .catch(err => console.error(err));
  }, [selectedProvince]);

  // Load villages
  useEffect(() => {
    if (!selectedProvince || !selectedDistrict) return;
    api.get(`/api/locations/villages/${selectedProvince}/${selectedDistrict}`)
      .then(res => {
        setVillages(res.data);
        setSelectedVillage("");
        setDeliveryCharge(0);
      })
      .catch(err => console.error(err));
  }, [selectedDistrict]);

  // Set delivery charge
  useEffect(() => {
    if (!selectedVillage) return;
    const villageObj = villages.find(v => v.village === selectedVillage);
    if (villageObj) setDeliveryCharge(villageObj.charge);
  }, [selectedVillage, villages]);

  const handleSave = async () => {
    if (!userId || !selectedProvince || !selectedDistrict || !selectedVillage || !phone) {
      return alert("Please fill all fields");
    }

    setLoading(true);
    try {
      const res = await api.post("/api/locations", {
        user_id: userId,
        province: selectedProvince,
        district: selectedDistrict,
        village: selectedVillage,
        charge: deliveryCharge,
        phone
      });

      if (onSaved) onSaved(res.data.location);
      alert(`Location saved! Delivery charge: Rs. ${deliveryCharge}`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
      <h4 className="font-semibold mb-2">Select Delivery Location</h4>

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      <select
        value={selectedProvince}
        onChange={e => setSelectedProvince(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select Province</option>
        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {districts.length > 0 && (
        <select
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="">Select District</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}

      {villages.length > 0 && (
        <select
          value={selectedVillage}
          onChange={e => setSelectedVillage(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="">Select Village/City</option>
          {villages.map(v => (
            <option key={v.village} value={v.village}>
              {v.village} (Rs. {v.charge})
            </option>
          ))}
        </select>
      )}

      {selectedVillage && (
        <p className="text-gray-700">Delivery Charge: Rs. {deliveryCharge}</p>
      )}

      <div className="flex gap-2">
        <Button
          className={`bg-green-600 text-white w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Location"}
        </Button>
        <Button className="bg-gray-300 text-gray-700 w-full" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};

export default LocationForm;
