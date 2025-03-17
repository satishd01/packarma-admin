import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import toast from "react-hot-toast";

const TermsAndCondition = () => {
  const [data, setData] = useState("");

  const userContext = useUser();

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Developer Settings",
    "can_update"
  );

  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Developer Settings",
    "can_create"
  );

  useEffect(() => {
    const fetchData = async () => {
      toast.loading("Please wait...");
      try {
        const resp = await api.get(
          `${BACKEND_API_KEY}/api/admin/developer/terms-and-conditons`
        );
        toast.dismiss();
        setData(resp.data.data);
      } catch (error) {
        toast.dismiss();
        toast.error("Something went wrong");
      }
    };
    fetchData();
  }, []);

  const updateDataHandler = async () => {
    toast.loading("Updating...");
    try {
      await api.post(`${BACKEND_API_KEY}/api/admin/developer/terms-and-conditons`, {
        content: data,
      });
      toast.dismiss();
      toast.success("Updated Successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Terms and Conditions
      </h1>
      <ReactQuill
        theme="snow"
        value={data}
        onChange={(text) => setData(text)}
        style={{ height: "300px" }}
      />
      {(updatePermission || createPermission) && (
        <button
          onClick={updateDataHandler}
          className="bg-lime-500 text-black px-4 py-2 ml-auto rounded block mt-20"
        >
          Update Data
        </button>
      )}
      <a
        className="pb-10 text-sm"
        target="_blank"
        href={BACKEND_MEDIA_LINK + "/public/terms-and-conditions"}
      >
        Link: {BACKEND_MEDIA_LINK + "/public/terms-and-conditions"}
      </a>
    </div>
  );
};

export default TermsAndCondition;
