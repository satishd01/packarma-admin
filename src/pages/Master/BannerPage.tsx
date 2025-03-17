import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Card, Spinner, TextInput, Tooltip } from "flowbite-react";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { toast } from "react-hot-toast";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import ToggleSwitch from "../../components/ToggleSwitch";
import {
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlineClose,
} from "react-icons/ai";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import { HiCursorClick } from "react-icons/hi";
import Select from "react-select";
import PaginationComponent from "../../components/PaginatonComponent";
interface Banner {
  id: number;
  title: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  link: string;
  app_page: string;
  banner_image: string;
  status: string;
  total_views: number;
  total_clicks: number;
  createdAt: string;
  updatedAt: string;
  sequence: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const BannerPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [link, setLink] = useState("");
  const [appPage, setAppPage] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [bannerIdToDelete, setBannerIdToDelete] = useState<number | null>(null);
  const [activityLog, setActivityLog] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState(titleFilter);
  const [filterOpen, setFilterOpen] = useState(false);
  const userContext = useUser();
  const appPages = [
    "BusinessEnquiryScreen",
    "BusinessDescriptionScreen",
    "MainPage",
    "EnterInformationScreen",
    "SearchHistoryScreen",
    "TreatmentDetailPage",
    "TreatmentsPage",
    "InvoiceDetailsScreen",
    "InvoicePage",
    "InvoicesScreen",
    "ManageAddressPage",
    "SubscriptionScreen",
    "CreditHistoryScreen",
    "FreeCreditsScreen",
    "HelpSupportScreen",
    "MyCreditsPage",
    "ProfileScreen",
    "ReferralProgramPage",
    "TermsAndConditionsScreen",
  ];

  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_create"
  );

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_update"
  );

  const deletePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_delete"
  );

  const exportPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_export"
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [titleFilter]);

  useEffect(() => {
    fetchBanners();
  }, [currentPage, entriesPerPage, debouncedTitleFilter]);

  const moveBanner = async (index: number, direction: "up" | "down") => {
    const loadingToast = toast.loading("Moving Banner...");
    try {
      const bannerId = banners[index]?.id;
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (banners[index] && banners[targetIndex]) {
        const temp = banners[index]!.sequence;
        banners[index]!.sequence = banners[targetIndex]!.sequence;
        banners[targetIndex]!.sequence = temp;
      }
      await Promise.all([
        api.put(`${BACKEND_API_KEY}/api/admin/master/update-banner/${bannerId}`, {
          sequence: banners[index]?.sequence,
        }),
        api.put(
          `${BACKEND_API_KEY}/api/admin/master/update-banner/${banners[targetIndex]?.id}`,
          {
            sequence: banners[targetIndex]?.sequence,
          }
        ),
      ]);

      fetchBanners();
      toast.dismiss(loadingToast);
      toast.success("Banner moved successfully");
    } catch (error) {
      console.error("Error moving banner:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to move banner");
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${BACKEND_API_KEY}/api/admin/master/get-banners`, {
        params: {
          page: currentPage,
          limit: entriesPerPage,
          search: debouncedTitleFilter,
        },
      });
      if (response.data.success) {
        if (response.data.data) {
          setBanners(response.data.data?.banners || []);
        } else {
          setBanners([]);
        }
      }
      if (response.data?.data?.pagination) {
        setPagination(response.data.data.pagination);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.log(err);
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const exportBanner = async (id: number, type: string) => {
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/master/export-banner/${id}?type=${type}`,
        { link: BACKEND_MEDIA_LINK },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `Banner_${id}_${type}_Exported_(${formatDateForFilename()}).xlsx`;
      link.setAttribute("download", title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export banner");
    }
  };

  const deleteBanner = (id: string) => {
    setBannerIdToDelete(Number(id));
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bannerIdToDelete !== null) {
      const loadingToast = toast.loading("Deleting banner...");
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/master/delete-banner/${bannerIdToDelete}`
        );
        fetchBanners();
        toast.success("Banner deleted successfully");
      } catch (err) {
        toast.error("Failed to delete banner");
      } finally {
        toast.dismiss(loadingToast);
        setDeletePopupOpen(false);
        setBannerIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setBannerIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingBanner(null);
    setTitle("");
    setDescription("");
    setStartDateTime("");
    setEndDateTime("");
    setLink("");
    setAppPage("");
    setBannerImage(null);
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description);
    setStartDateTime(
      new Date(banner.start_date_time).toISOString().slice(0, 16)
    );
    setEndDateTime(new Date(banner.end_date_time).toISOString().slice(0, 16));
    setLink(banner.link);
    setAppPage(banner.app_page);
    setBannerImage(null);
    setStatus(banner.status);
    setIsFormOpen(true);
    setImagePreview(banner.banner_image);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
    setTitle("");
    setDescription("");
    setStartDateTime("");
    setEndDateTime("");
    setLink("");
    setAppPage("");
    setBannerImage(null);
    setStatus("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (link !== "" && appPage !== "") {
      toast.error("Link or App Page any one is allowed");
      return;
    }
    const loadingToast = toast.loading("Saving banner...");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append(
        "start_date_time",
        new Date(startDateTime).toISOString().slice(0, 19).replace("T", " ")
      );
      formData.append(
        "end_date_time",
        new Date(endDateTime).toISOString().slice(0, 19).replace("T", " ")
      );
      formData.append("link", link);
      formData.append("app_page", appPage);
      formData.append("status", status);
      formData.append("type", "banner");
      if (bannerImage) {
        formData.append("banner", bannerImage);
      }

      if (editingBanner) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/master/update-banner/${editingBanner.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Banner updated successfully");
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/master/add-banner`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Banner added successfully");
      }

      closeForm();
      fetchBanners();
    } catch (err) {
      console.log(err);
      toast.dismiss();
      toast.error("Failed to save banner");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/master/update-banner/${id}`, {
        status: newStatus,
      });
      fetchBanners();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const fetchActivityLog = async (bannerId: number, type: string) => {
    try {
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/master/banner/activity-log/${bannerId}`
      );
      if (
        type === "clicks" &&
        response.data.data.activityStats.total_clicks > 0
      ) {
        setActivityLog({
          type: type,
          userData: response.data.data.userData[type],
        });
      } else if (
        type === "views" &&
        response.data.data.activityStats.total_views > 0
      ) {
        setActivityLog({
          type: type,
          userData: response.data.data.userData[type],
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      toast.dismiss();
    }
  };

  const handleistViewBtn = (banner: Banner, type: string) => {
    fetchActivityLog(banner.id, type);
    setSelectedBanner(banner);
    setShowDetails(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      {showDetails ? (
        <>
          <Card className="relative">
            <button
              onClick={() => {
                setShowDetails(false);
                setSelectedBanner(null);
              }}
              className="absolute top-5 right-5"
            >
              <AiOutlineClose className="text-2xl" />
            </button>
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col w-[60%]">
                <div className="pb-1">
                  <strong>Title:</strong> {selectedBanner?.title}
                </div>
                <div className="pb-1">
                  <strong>Description:</strong> {selectedBanner?.description}
                </div>
                <div className="pb-1">
                  <strong>Total Views:</strong> {selectedBanner?.total_views}
                </div>
                <div className="pb-1">
                  <strong>Total Clicks:</strong> {selectedBanner?.total_clicks}
                </div>
                <div className="pb-1">
                  <strong>Start Date Time:</strong>{" "}
                  {new Date(selectedBanner!.start_date_time).toLocaleString()}
                </div>
                <div className="pb-1">
                  <strong>End Date Time:</strong>{" "}
                  {new Date(selectedBanner!.end_date_time).toLocaleString()}
                </div>
                {selectedBanner?.link && (
                  <div className="pb-1">
                    <strong>Link:</strong>{" "}
                    <a
                      href={selectedBanner?.link}
                      className="text-underline text-blue-500"
                      target="_blank"
                    >
                      {selectedBanner?.link}
                    </a>
                  </div>
                )}
                {selectedBanner?.app_page && (
                  <div className="pb-1">
                    <strong>App Page:</strong> {selectedBanner?.app_page}
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center w-[40%]">
                <img
                  src={BACKEND_MEDIA_LINK + selectedBanner?.banner_image}
                  alt={selectedBanner?.title}
                  className="w-48 h-48 object-cover"
                />
              </div>
            </div>
          </Card>
          {activityLog && (
            <>
              <p className="text-xl font-bold my-4">
                {activityLog.type.charAt(0).toUpperCase() +
                  activityLog.type.slice(1)}{" "}
                Activity Log
              </p>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-5">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Id
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Phone
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.userData.length > 0 ? (
                      activityLog.userData.map((item: any, index: any) => (
                        <tr
                          key={index}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="p-4 text-gray-900">{index + 1}</td>
                          <td className="p-4 text-gray-900">
                            {item.firstname} {item.lastname}
                          </td>
                          <td className="p-4 text-gray-900">{item.email}</td>
                          <td className="p-4 text-gray-900">{item.phone_number}</td>
                          <td className="p-4 text-gray-900">
                            {new Date(item.activity_timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          No Activty Data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
            Manage Banners
          </h1>
          {!isFormOpen && (
            <div className="flex justify-between items-center w-full my-6">
              <EntriesPerPage
                entriesPerPage={entriesPerPage}
                setEntriesPerPage={setEntriesPerPage}
              />
              <div className="flex">
                <button
                  className="bg-blue-500 text-white px-3 py-2 rounded block mr-4"
                  onClick={() => {
                    setFilterOpen(!filterOpen);
                    setTitleFilter("");
                  }}
                >
                  {filterOpen ? (
                    <TbFilterOff size={22} />
                  ) : (
                    <TbFilter size={22} />
                  )}
                </button>
                {createPermission && (
                  <button
                    onClick={openAddForm}
                    className="bg-lime-500 text-black px-4 py-2 rounded block mr-4"
                  >
                    Add New Banner
                  </button>
                )}
              </div>
            </div>
          )}
          {filterOpen && (
            <div className="flex justify-start items-start mb-6 flex-col">
              <label htmlFor="search" className="text-sm mb-1 font-medium">
                Search Banner Title
              </label>
              <TextInput
                className="customInput w-[25%]"
                id="search"
                type="text"
                placeholder="Search here.."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </div>
          )}
          {!isFormOpen && (
            <>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner size="xl" />
                </div>
              ) : error ? (
                <ErrorComp error={error} onRetry={fetchBanners} />
              ) : (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  {banners.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            Id
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Title
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Views
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Clicks
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Image
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Status
                          </th>
                          {exportPermission && (
                            <th scope="col" className="px-4 py-3">
                              Export
                            </th>
                          )}
                          <th scope="col" className="px-4 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {banners.map((banner, index) => (
                          <tr
                            key={banner.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="p-4 text-gray-900">{banner.id}</td>
                            <td className="p-4 text-gray-900">
                              {banner.title}
                            </td>
                            <td className="p-4 text-gray-900">
                              <div className="px-2 py-4 text-gray-900 flex justify-start items-start  cursor-pointer">
                                <span>{banner.total_views}</span>
                                {banner.total_views != 0 && (
                                  <span
                                    className="bg-lime-400 ml-2 px-2 py-1 rounded-full"
                                    onClick={() =>
                                      handleistViewBtn(banner, "views")
                                    }
                                  >
                                    <MdOutlineRemoveRedEye />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-gray-900">
                              <div className="px-2 py-4 text-gray-900 flex justify-start items-start cursor-pointer">
                                <span>{banner.total_clicks}</span>
                                {banner.total_clicks != 0 && (
                                  <span
                                    className="bg-lime-400 ml-2 px-2 py-1 rounded-full"
                                    onClick={() =>
                                      handleistViewBtn(banner, "clicks")
                                    }
                                  >
                                    <MdOutlineRemoveRedEye />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-gray-900 flex">
                              <img
                                src={BACKEND_MEDIA_LINK + banner.banner_image}
                                alt={banner.title}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() => setSelectedBanner(banner)}
                              />
                            </td>
                            {updatePermission && (
                              <td className="p-4 text-gray-900">
                                <ToggleSwitch
                                  checked={banner.status === "active"}
                                  onChange={() =>
                                    toggleStatus(banner.id, banner.status)
                                  }
                                />
                              </td>
                            )}
                            {!updatePermission && (
                              <td className="p-4 text-gray-900">
                                <Badge
                                  className="!inline-block"
                                  color={
                                    banner.status === "active"
                                      ? "success"
                                      : "failure"
                                  }
                                >
                                  {banner.status.charAt(0).toUpperCase() +
                                    banner.status.slice(1)}
                                </Badge>
                              </td>
                            )}
                            {exportPermission && (
                              <td className="p-4 text-gray-900">
                                <button
                                  onClick={() =>
                                    exportBanner(banner.id, "view")
                                  }
                                  className="text-2xl text-green-600 dark:text-green-500 hover:underline mr-4"
                                  aria-label="Export"
                                >
                                  <Tooltip content="Views">
                                    <MdOutlineRemoveRedEye />
                                  </Tooltip>
                                </button>
                                <button
                                  onClick={() =>
                                    exportBanner(banner.id, "click")
                                  }
                                  className="text-2xl text-green-600 dark:text-green-500 hover:underline mr-4"
                                  aria-label="Export"
                                >
                                  <Tooltip content="Clicks">
                                    <HiCursorClick />
                                  </Tooltip>
                                </button>
                              </td>
                            )}
                            <td className="p-4 text-gray-900">
                              <button
                                onClick={() => moveBanner(index, "up")}
                                className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4 disabled:text-blue-200"
                                aria-label="Move Up"
                                disabled={index === 0}
                              >
                                <AiOutlineArrowUp />
                              </button>
                              <button
                                onClick={() => moveBanner(index, "down")}
                                className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4 disabled:text-blue-200"
                                aria-label="Move Down"
                                disabled={index === banners.length - 1}
                              >
                                <AiOutlineArrowDown />
                              </button>

                              <button
                                onClick={() => setSelectedBanner(banner)}
                                className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                                aria-label="Info"
                              >
                                <MdOutlineRemoveRedEye />
                              </button>
                              {updatePermission && (
                                <button
                                  onClick={() => openEditForm(banner)}
                                  className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                                  aria-label="Edit"
                                >
                                  <TbEdit />
                                </button>
                              )}
                              {deletePermission && (
                                <button
                                  onClick={() =>
                                    deleteBanner(banner.id.toString())
                                  }
                                  className="text-2xl text-red-600 dark:text-red-500 hover:underline"
                                  aria-label="Delete"
                                >
                                  <MdDeleteOutline />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-4 text-center text-gray-500">
                      No banners found
                    </div>
                  )}
                </div>
              )}
              {!error && (
                <p className="my-4 text-sm">
                  Showing {banners.length} out of {pagination.totalItems}{" "}
                  Banners
                </p>
              )}
              <PaginationComponent
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagination={pagination}
              />
            </>
          )}

          {isFormOpen && (
            <div className="mx-auto my-10 w-[80%]">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
              </h3>
              <form
                onSubmit={handleFormSubmit}
                className="grid grid-cols-2 gap-5"
              >
                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="customInput mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="start_date_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date Time
                  </label>
                  <input
                    type="datetime-local"
                    id="start_date_time"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="end_date_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date Time
                  </label>
                  <input
                    type="datetime-local"
                    id="end_date_time"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="link"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Link
                  </label>
                  <input
                    type="text"
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="customInput mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="app_page"
                    className="block text-sm font-medium text-gray-700"
                  >
                    App Page
                  </label>
                  <Select
                    isClearable
                    id="app_page"
                    value={{
                      label: appPage,
                      value: appPage,
                    }}
                    onChange={(e) => setAppPage(e?.value || "")}
                    options={appPages.map((page) => ({
                      label: page,
                      value: page,
                    }))}
                    className="customInput mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="banner_image"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Banner Image
                  </label>
                  <input
                    type="file"
                    id="banner_image"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        setBannerImage(file as File | null);
                      } else {
                        setBannerImage(null);
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>

                {editingBanner && imagePreview && (
                  <div className="mb-4">
                    <img
                      src={BACKEND_MEDIA_LINK + imagePreview}
                      alt="Banner Preview"
                      className="w-16 h-16 object-cover mb-2"
                    />
                  </div>
                )}

                <div className="flex justify-end mt-4 items-center">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  >
                    {editingBanner ? "Update Banner" : "Add Banner"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {selectedBanner && (
            <DetailsPopup
              title="Banner Details"
              fields={[
                { label: "ID", value: selectedBanner.id.toString() },
                { label: "Title", value: selectedBanner.title },
                { label: "Description", value: selectedBanner.description },
                {
                  label: "Total Views",
                  value: selectedBanner.total_views.toString(),
                },
                {
                  label: "Total Clicks",
                  value: selectedBanner.total_clicks.toString(),
                },
                {
                  label: "Start Date Time",
                  value: new Date(
                    selectedBanner.start_date_time
                  ).toLocaleString(),
                },
                {
                  label: "End Date Time",
                  value: new Date(
                    selectedBanner.end_date_time
                  ).toLocaleString(),
                },
                { label: "Link", value: selectedBanner.link },
                { label: "App Page", value: selectedBanner.app_page },
                {
                  label: "Banner Image",
                  value: (
                    <img
                      src={BACKEND_MEDIA_LINK + selectedBanner.banner_image}
                      alt={selectedBanner.title}
                      className="w-24 h-24 object-cover"
                    />
                  ),
                },
                {
                  label: "Status",
                  value:
                    selectedBanner.status === "active" ? "Active" : "Inactive",
                },
                {
                  label: "Created At",
                  value: new Date(selectedBanner.createdAt).toLocaleString(),
                },
                {
                  label: "Updated At",
                  value: new Date(selectedBanner.updatedAt).toLocaleString(),
                },
              ]}
              onClose={() => setSelectedBanner(null)}
            />
          )}
          {isDeletePopupOpen && (
            <CustomPopup
              title="Confirm Deletion"
              description="Are you sure you want to delete this banner?"
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BannerPage;
