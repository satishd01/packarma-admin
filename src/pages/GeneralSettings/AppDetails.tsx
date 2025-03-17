import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import { ErrorComp } from "../../components/ErrorComp";
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";

interface AppDetails {
  id: number;
  app_link_android: string;
  app_link_ios: string;
  app_version_android: string;
  app_version_ios: string;
}

const AppDetails: React.FC = () => {
  const [appDetails, setAppDetails] = useState<AppDetails>({
    id: 0,
    app_link_android: "",
    app_link_ios: "",
    app_version_android: "",
    app_version_ios: "",
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
    fetchAppDetails();
  }, []);

  const fetchAppDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/general-settings/app-details`
      );
      setAppDetails(response.data.data);
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
    toast.loading("Updating app details...");
    try {
      const formData = {
        app_link_android: appDetails?.app_link_android,
        app_link_ios: appDetails?.app_link_ios,
        app_version_android: appDetails?.app_version_android,
        app_version_ios: appDetails?.app_version_ios,
      };
      await api.put(
        `${BACKEND_API_KEY}/api/admin/general-settings/app-details`,
        formData
      );
      fetchAppDetails();
      toast.dismiss();
      toast.success("App details updated successfully");
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
        <ErrorComp error={error} onRetry={fetchAppDetails} />
      ) : (
        <form onSubmit={handleFormSubmit} className="w-[80%] gap-5 mx-auto">
          <div className="mb-4">
            <label
              htmlFor="app_link_android"
              className="block text-sm font-medium text-gray-700"
            >
              App Link Android
            </label>
            <input
              type="text"
              id="app_link_android"
              value={appDetails?.app_link_android}
              onChange={(e) =>
                setAppDetails({
                  ...appDetails,
                  app_link_android: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="app_link_ios"
              className="block text-sm font-medium text-gray-700"
            >
              App Link iOS
            </label>
            <input
              type="text"
              id="app_link_ios"
              value={appDetails?.app_link_ios}
              onChange={(e) =>
                setAppDetails({
                  ...appDetails,
                  app_link_ios: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="app_version_android"
              className="block text-sm font-medium text-gray-700"
            >
              App Version Android {'(Format-> ["V1","V2","V3"])'}
            </label>
            <input
              type="text"
              id="app_version_android"
              value={appDetails?.app_version_android}
              onChange={(e) =>
                setAppDetails({
                  ...appDetails,
                  app_version_android: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="app_version_ios"
              className="block text-sm font-medium text-gray-700"
            >
              App Version iOS {'(Format-> ["V1","V2","V3"])'}
            </label>
            <input
              type="text"
              id="app_version_ios"
              value={appDetails?.app_version_ios}
              onChange={(e) =>
                setAppDetails({
                  ...appDetails,
                  app_version_ios: e.target.value,
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

export default AppDetails;
