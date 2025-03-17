import React, { useState, useEffect, FormEvent } from "react";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import { ErrorComp } from "../../components/ErrorComp";
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { TextInput } from "flowbite-react";
import { MdAdd, MdDelete } from "react-icons/md";

interface Benefit {
  benefit_id: number;
  benefit_text: string;
}

const ReferEarnBenefits: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newBenefit, setNewBenefit] = useState<string>("");

  const userContext = useUser();
  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "General Settings",
    "can_update"
  );
  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "General Settings",
    "can_create"
  );

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Benefit[] }>(
        `${BACKEND_API_KEY}/api/admin/general-settings/refer-earn/benefits`
      );
      setBenefits(response.data.data);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const handleAddBenefit = async (e: FormEvent) => {
    e.preventDefault();
    if (!createPermission) {
      toast.dismiss();
      toast.error("You are not authorized!");
      return;
    }
    try {
      await api.post(
        `${BACKEND_API_KEY}/api/admin/general-settings/refer-earn/benefits`,
        {
          benefit_text: newBenefit,
        }
      );
      setNewBenefit("");
      fetchBenefits();
      toast.dismiss();
      toast.success("Benefit added successfully");
    } catch {
      toast.dismiss();
      toast.error("Failed to add benefit");
    }
  };

  const handleDeleteBenefit = async (id: number) => {
    if (!updatePermission) {
      toast.dismiss();
      toast.error("You are not authorized!");
      return;
    }
    try {
      await api.delete(
        `${BACKEND_API_KEY}/api/admin/general-settings/refer-earn/benefits/${id}`
      );
      fetchBenefits();
      toast.dismiss();
      toast.success("Benefit deleted successfully");
    } catch {
      toast.dismiss();
      toast.error("Failed to delete benefit");
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <ErrorComp error={error} onRetry={fetchBenefits} />
      ) : (
        <div className="w-[80%] mx-auto">
          <form
            onSubmit={handleAddBenefit}
            className="mb-5 w-full flex justify-center"
          >
            <TextInput
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Add new benefit"
              className="customInput w-full"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 ml-3 bg-lime-500 text-white rounded"
            >
              <MdAdd />
            </button>
          </form>
          <ul className="list-disc">
            {benefits.map((benefit) => (
              <li
                key={benefit.benefit_id}
                className="flex justify-between items-center mb-2 p-2 rounded-md bg-white text-sm"
              >
                {benefit.benefit_text}
                <button
                  onClick={() => handleDeleteBenefit(benefit.benefit_id)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  <MdDelete />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReferEarnBenefits;
