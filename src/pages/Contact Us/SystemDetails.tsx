import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import { ErrorComp } from "../../components/ErrorComp";
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";

interface SystemDetails {
  id: number;
  system_email: string;
  system_phone_number: string;
}

const SystemDetails: React.FC = () => {
  const [systemDetails, setSystemDetails] = useState<SystemDetails>({
    id: 0,
    system_email: "",
    system_phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userContext = useUser();

  useEffect(() => {
    fetchSystemDetails();
  }, []);

  const fetchSystemDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/contact-us/system-details`
      );
      setSystemDetails(response.data.data);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Contact Us",
    "can_update"
  );

  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Contact Us",
    "can_create"
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    toast.loading("Updating system details...");
    try {
      const formData = {
        system_email: systemDetails?.system_email,
        system_phone_number: systemDetails?.system_phone_number,
      };
      await api.put(`${BACKEND_API_KEY}/api/admin/contact-us/system-details`, formData);
      fetchSystemDetails();
      toast.dismiss();
      toast.success("System details updated successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to save data");
      setError("Failed to save data");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage System Details
      </h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <ErrorComp error={error} onRetry={fetchSystemDetails} />
      ) : (
        <form
          onSubmit={
            updatePermission && createPermission ? handleFormSubmit : undefined
          }
          className="w-[40%] mt-10 gap-5 mx-auto"
        >
          <div className="mb-4">
            <label
              htmlFor="system_email"
              className="block text-sm font-medium text-gray-700"
            >
              System Email
            </label>
            <input
              type="email"
              id="system_email"
              value={systemDetails?.system_email}
              disabled={!updatePermission || !createPermission}
              onChange={(e) =>
                setSystemDetails({
                  ...systemDetails,
                  system_email: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="system_phone_number"
              className="block text-sm font-medium text-gray-700"
            >
              System Phone Number
            </label>
            <input
              type="tel"
              id="system_phone_number"
              value={systemDetails?.system_phone_number}
              disabled={!updatePermission || !createPermission}
              onChange={(e) =>
                setSystemDetails({
                  ...systemDetails,
                  system_phone_number: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="flex justify-center items-center mt-4 col-span-2">
            {updatePermission && createPermission && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Update Details
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default SystemDetails;
