import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import api from "../../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";

const ReferEarnTAC = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetchTermsAndConditionsData();
  }, []);

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

  const fetchTermsAndConditionsData = async () => {
    try {
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/general-settings/refer-earn/terms-and-conditions`
      );
      setText(response.data.data);
    } catch (err: any) {
      toast.error(err.response.data.message || "Something Went Wrong!");
    }
  };

  const handleChange = (value: string) => {
    setText(value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatePermission && !createPermission) {
      toast.dismiss();
      toast.error("You are not authorized!");
      return;
    }
    toast.loading("Updating Refer and Earn T&C...");
    try {
      await api.put(
        `${BACKEND_API_KEY}/api/admin/general-settings/refer-earn/terms-and-conditions`,
        {
          text,
        }
      );
      toast.dismiss();
      toast.success("Refer and Earn T&C updated successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to save data");
    }
  };

  return (
    <div>
      <div className="w-full min-h-[300px] mx-auto">
        <ReactQuill
          theme="snow"
          value={text}
          onChange={handleChange}
          style={{ height: "300px" }}
        />
      </div>
      <div className="flex justify-center items-center mt-16 col-span-2">
        <button
          type="submit"
          onClick={handleFormSubmit}
          className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        >
          Update Data
        </button>
      </div>
    </div>
  );
};

export default ReferEarnTAC;
