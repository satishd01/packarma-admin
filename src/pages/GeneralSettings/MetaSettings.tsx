import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import { ErrorComp } from "../../components/ErrorComp";
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";

interface MetaDetails {
  id: number;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
}

const MetaSettings: React.FC = () => {
  const [metaDetails, setMetaDetails] = useState<MetaDetails>({
    id: 0,
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchMetaDetails();
  }, []);

  const fetchMetaDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/general-settings/meta-details`
      );
      setMetaDetails(response.data.data);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatePermission && !createPermission) {
      toast.dismiss();
      toast.error("You are not authorized!");
      return;
    }
    toast.loading("Updating meta details...");
    try {
      const formData = {
        meta_title: metaDetails?.meta_title,
        meta_keywords: metaDetails?.meta_keywords,
        meta_description: metaDetails?.meta_description,
      };
      await api.put(
        `${BACKEND_API_KEY}/api/admin/general-settings/meta-details`,
        formData
      );
      fetchMetaDetails();
      toast.dismiss();
      toast.success("Meta details updated successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to save data");
      setError("Failed to save data");
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <ErrorComp error={error} onRetry={fetchMetaDetails} />
      ) : (
        <form onSubmit={handleFormSubmit} className="w-[80%] gap-5 mx-auto">
          <div className="mb-4">
            <label
              htmlFor="meta_title"
              className="block text-sm font-medium text-gray-700"
            >
              Meta Title
            </label>
            <input
              type="text"
              id="meta_title"
              value={metaDetails?.meta_title}
              onChange={(e) =>
                setMetaDetails({
                  ...metaDetails,
                  meta_title: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="meta_keywords"
              className="block text-sm font-medium text-gray-700"
            >
              Meta Keywords
            </label>
            <input
              type="text"
              id="meta_keywords"
              value={metaDetails?.meta_keywords}
              onChange={(e) =>
                setMetaDetails({
                  ...metaDetails,
                  meta_keywords: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="meta_description"
              className="block text-sm font-medium text-gray-700"
            >
              Meta Description
            </label>
            <input
              type="text"
              id="meta_description"
              value={metaDetails?.meta_description}
              onChange={(e) =>
                setMetaDetails({
                  ...metaDetails,
                  meta_description: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="flex justify-center items-center mt-4 col-span-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Update Details
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MetaSettings;
