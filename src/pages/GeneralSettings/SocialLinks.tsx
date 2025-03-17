import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import { ErrorComp } from "../../components/ErrorComp";
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";

interface SocialLinks {
  id: number;
  instagram_link: string;
  twitter_link: string;
  youtube_link: string;
  facebook_link: string;
}

const SocialLinks: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    id: 0,
    instagram_link: "",
    twitter_link: "",
    youtube_link: "",
    facebook_link: "",
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
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/general-settings/social-links`
      );
      setSocialLinks(response.data.data);
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
    toast.loading("Updating social links...");
    try {
      const formData = {
        instagram_link: socialLinks?.instagram_link,
        twitter_link: socialLinks?.twitter_link,
        youtube_link: socialLinks?.youtube_link,
        facebook_link: socialLinks?.facebook_link,
      };
      await api.put(
        `${BACKEND_API_KEY}/api/admin/general-settings/social-links`,
        formData
      );
      fetchSocialLinks();
      toast.dismiss();
      toast.success("Social links updated successfully");
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
        <ErrorComp error={error} onRetry={fetchSocialLinks} />
      ) : (
        <form onSubmit={handleFormSubmit} className="w-[80%] gap-5 mx-auto">
          <div className="mb-4">
            <label
              htmlFor="instagram_link"
              className="block text-sm font-medium text-gray-700"
            >
              Instagram Link
            </label>
            <input
              type="text"
              id="instagram_link"
              value={socialLinks?.instagram_link}
              onChange={(e) =>
                setSocialLinks({
                  ...socialLinks,
                  instagram_link: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="twitter_link"
              className="block text-sm font-medium text-gray-700"
            >
              Twitter Link
            </label>
            <input
              type="text"
              id="twitter_link"
              value={socialLinks?.twitter_link}
              onChange={(e) =>
                setSocialLinks({
                  ...socialLinks,
                  twitter_link: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="youtube_link"
              className="block text-sm font-medium text-gray-700"
            >
              YouTube Link
            </label>
            <input
              type="text"
              id="youtube_link"
              value={socialLinks?.youtube_link}
              onChange={(e) =>
                setSocialLinks({
                  ...socialLinks,
                  youtube_link: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="facebook_link"
              className="block text-sm font-medium text-gray-700"
            >
              Facebook Link
            </label>
            <input
              type="text"
              id="facebook_link"
              value={socialLinks?.facebook_link}
              onChange={(e) =>
                setSocialLinks({
                  ...socialLinks,
                  facebook_link: e.target.value,
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
              Update Links
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SocialLinks;
