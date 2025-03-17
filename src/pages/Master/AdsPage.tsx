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

interface Product {
  product_id: number;
  product_name: string;
  product_image: string;
}

interface Advertisement {
  id: number;
  title: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  link: string;
  app_page: string;
  image: string;
  status: string;
  total_views: number;
  total_clicks: number;
  createdAt: string;
  updatedAt: string;
  sequence: number;
  products: Product[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const AdsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvertisement, setEditingAdvertisement] =
    useState<Advertisement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [link, setLink] = useState("");
  const [appPage, setAppPage] = useState("");
  const [advertisementImage, setAdvertisementImage] = useState<File | null>(
    null
  );
  const [status, setStatus] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedAdvertisement, setSelectedAdvertisement] =
    useState<Advertisement | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [advertisementIdToDelete, setAdvertisementIdToDelete] = useState<
    number | null
  >(null);
  const [activityLog, setActivityLog] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState(titleFilter);
  const [filterOpen, setFilterOpen] = useState(false);
  const userContext = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number[]>([]);

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
    getProducts();
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [currentPage, entriesPerPage, debouncedTitleFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [titleFilter]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/master/get-advertisements`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            search: debouncedTitleFilter,
          },
        }
      );
      if (response.data.success) {
        if (response.data.data) {
          setAdvertisements(response.data.data?.advertisements || []);
        } else {
          setAdvertisements([]);
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

  const deleteAdvertisement = (id: string) => {
    setAdvertisementIdToDelete(Number(id));
    setDeletePopupOpen(true);
  };

  const getProducts = async () => {
    const response = await api.get(
      `${BACKEND_API_KEY}/api/admin/product/get-products?pagination=false`
    );
    setProducts(response.data.data.products);
  };

  const exportAdvertisement = async (id: number, type: string) => {
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/master/export-advertisement/${id}?type=${type}`,
        { link: BACKEND_MEDIA_LINK },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `Advertisement_${id}_${type}_Exported_(${formatDateForFilename()}).xlsx`;
      link.setAttribute("download", title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("Failed to export advertisement");
    }
  };

  const moveAdvertisement = async (index: number, direction: "up" | "down") => {
    const loadingToast = toast.loading("Moving Advertisement...");
    try {
      const advertisementId = advertisements[index]?.id;
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (advertisements[index] && advertisements[targetIndex]) {
        const temp = advertisements[index]!.sequence;
        advertisements[index]!.sequence = advertisements[targetIndex]!.sequence;
        advertisements[targetIndex]!.sequence = temp;
      }
      await Promise.all([
        api.patch(
          `${BACKEND_API_KEY}/api/admin/master/update-advertisement/${advertisementId}`,
          {
            sequence: advertisements[index]?.sequence,
          }
        ),
        api.patch(
          `${BACKEND_API_KEY}/api/admin/master/update-advertisement/${advertisements[targetIndex]?.id}`,
          {
            sequence: advertisements[targetIndex]?.sequence,
          }
        ),
      ]);

      fetchAdvertisements();
      toast.dismiss(loadingToast);
      toast.success("Advertisement moved successfully");
    } catch (error) {
      console.error("Error moving advertisement:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to move advertisement");
    }
  };

  const handleConfirmDelete = async () => {
    if (advertisementIdToDelete !== null) {
      const loadingToast = toast.loading("Deleting advertisement...");
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/master/delete-advertisement/${advertisementIdToDelete}`
        );
        fetchAdvertisements();
        toast.success("Advertisement deleted successfully");
      } catch (err) {
        toast.error("Failed to delete advertisement");
      } finally {
        toast.dismiss(loadingToast);
        setDeletePopupOpen(false);
        setAdvertisementIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setAdvertisementIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingAdvertisement(null);
    setTitle("");
    setDescription("");
    setStartDateTime("");
    setEndDateTime("");
    setLink("");
    setAppPage("");
    setAdvertisementImage(null);
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (advertisement: Advertisement) => {
    setEditingAdvertisement(advertisement);
    setTitle(advertisement.title);
    setDescription(advertisement.description);
    setStartDateTime(
      new Date(advertisement.start_date_time).toISOString().slice(0, 16)
    );
    setEndDateTime(
      new Date(advertisement.end_date_time).toISOString().slice(0, 16)
    );
    setLink(advertisement.link);
    setAppPage(advertisement.app_page);
    setAdvertisementImage(null);
    setStatus(advertisement.status);
    setIsFormOpen(true);
    setImagePreview(advertisement.image);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAdvertisement(null);
    setTitle("");
    setDescription("");
    setStartDateTime("");
    setEndDateTime("");
    setLink("");
    setAppPage("");
    setAdvertisementImage(null);
    setStatus("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving Avertisement...");
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
      if (selectedProduct.length > 0) {
        formData.append("products", selectedProduct.toString());
      }
      formData.append("type", "advertisement");
      if (advertisementImage) {
        formData.append("advertisement_image", advertisementImage);
      }

      if (editingAdvertisement) {
        await api.patch(
          `${BACKEND_API_KEY}/api/admin/master/update-advertisement/${editingAdvertisement.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Advertisement updated successfully");
      } else {
        await api.post(
          `${BACKEND_API_KEY}/api/admin/master/add-advertisement`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Advertisement added successfully");
      }

      closeForm();
      fetchAdvertisements();
    } catch (err) {
      console.log(err);
      toast.dismiss();
      toast.error("Failed to save Advertisement");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.patch(`${BACKEND_API_KEY}/api/admin/master/update-advertisement/${id}`, {
        status: newStatus,
      });
      fetchAdvertisements();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const fetchActivityLog = async (advertisementId: number, type: string) => {
    try {
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/master/advertisement/activity-log/${advertisementId}`
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

  const handleistViewBtn = (advertisement: Advertisement, type: string) => {
    fetchActivityLog(advertisement.id, type);
    setSelectedAdvertisement(advertisement);
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
                setSelectedAdvertisement(null);
              }}
              className="absolute top-5 right-5"
            >
              <AiOutlineClose className="text-2xl" />
            </button>
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col w-[60%]">
                <div className="pb-1">
                  <strong>Title:</strong> {selectedAdvertisement?.title}
                </div>
                <div className="pb-1">
                  <strong>Description:</strong>{" "}
                  {selectedAdvertisement?.description}
                </div>
                <div className="pb-1">
                  <strong>Total Views:</strong>{" "}
                  {selectedAdvertisement?.total_views}
                </div>
                <div className="pb-1">
                  <strong>Total Clicks:</strong>{" "}
                  {selectedAdvertisement?.total_clicks}
                </div>
                <div className="pb-1">
                  <strong>Start Date Time:</strong>{" "}
                  {new Date(
                    selectedAdvertisement!.start_date_time
                  ).toLocaleString()}
                </div>
                <div className="pb-1">
                  <strong>End Date Time:</strong>{" "}
                  {new Date(
                    selectedAdvertisement!.end_date_time
                  ).toLocaleString()}
                </div>
                {selectedAdvertisement?.link && (
                  <div className="pb-1">
                    <strong>Link:</strong>{" "}
                    <a
                      href={selectedAdvertisement?.link}
                      className="text-underline text-blue-500"
                      target="_blank"
                    >
                      {selectedAdvertisement?.link}
                    </a>
                  </div>
                )}
                {selectedAdvertisement?.app_page && (
                  <div className="pb-1">
                    <strong>App Page:</strong> {selectedAdvertisement?.app_page}
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center w-[40%]">
                <img
                  src={BACKEND_MEDIA_LINK + selectedAdvertisement?.image}
                  alt={selectedAdvertisement?.title}
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
            Manage Advertisements
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
                    Add New Advertisement
                  </button>
                )}
              </div>
            </div>
          )}
          {filterOpen && (
            <div className="flex justify-start items-start mb-6 flex-col">
              <label htmlFor="search" className="text-sm mb-1 font-medium">
                Search Advertisement Title
              </label>
              <TextInput
                id="search"
                type="text"
                className="customInput w-full"
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
                <ErrorComp error={error} onRetry={fetchAdvertisements} />
              ) : (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                      {advertisements.length > 0 ? (
                        advertisements.map((advertisement, index) => (
                          <tr
                            key={advertisement.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="p-4 text-gray-900">
                              {advertisement.id}
                            </td>
                            <td className="p-4 text-gray-900">
                              {advertisement.title}
                            </td>
                            <td className="p-4 text-gray-900">
                              <div className="px-2 py-4 text-gray-900 flex justify-start items-start  cursor-pointer">
                                <span>{advertisement.total_views}</span>
                                {advertisement.total_views != 0 && (
                                  <span
                                    className="bg-lime-400 ml-2 px-2 py-1 rounded-full"
                                    onClick={() =>
                                      handleistViewBtn(advertisement, "views")
                                    }
                                  >
                                    <MdOutlineRemoveRedEye />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-gray-900">
                              <div className="px-2 py-4 text-gray-900 flex justify-start items-start  cursor-pointer">
                                <span>{advertisement.total_clicks}</span>
                                {advertisement.total_clicks != 0 && (
                                  <span
                                    className="bg-lime-400 ml-2 px-2 py-1 rounded-full"
                                    onClick={() =>
                                      handleistViewBtn(advertisement, "clicks")
                                    }
                                  >
                                    <MdOutlineRemoveRedEye />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-900 flex">
                              <img
                                src={BACKEND_MEDIA_LINK + advertisement.image}
                                alt={advertisement.title}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() =>
                                  setSelectedAdvertisement(advertisement)
                                }
                              />
                            </td>
                            {updatePermission && (
                              <td className="p-4 text-gray-900">
                                <ToggleSwitch
                                  checked={advertisement.status === "active"}
                                  onChange={() =>
                                    toggleStatus(
                                      advertisement.id,
                                      advertisement.status
                                    )
                                  }
                                />
                              </td>
                            )}
                            {!updatePermission && (
                              <td className="p-4 text-gray-900">
                                <Badge
                                  className="!inline-block"
                                  color={
                                    advertisement.status === "active"
                                      ? "success"
                                      : "failure"
                                  }
                                >
                                  {advertisement.status
                                    .charAt(0)
                                    .toUpperCase() +
                                    advertisement.status.slice(1)}
                                </Badge>
                              </td>
                            )}
                            {exportPermission && (
                              <td className="p-4 text-gray-900">
                                <button
                                  onClick={() =>
                                    exportAdvertisement(
                                      advertisement.id,
                                      "view"
                                    )
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
                                    exportAdvertisement(
                                      advertisement.id,
                                      "click"
                                    )
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
                            <td className="px-6 py-4 text-gray-900 flex">
                              <button
                                onClick={() => moveAdvertisement(index, "up")}
                                className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4 disabled:text-blue-200"
                                aria-label="Move Up"
                                disabled={index === 0}
                              >
                                <AiOutlineArrowUp />
                              </button>
                              <button
                                onClick={() => moveAdvertisement(index, "down")}
                                className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4 disabled:text-blue-200"
                                aria-label="Move Down"
                                disabled={index === advertisements.length - 1}
                              >
                                <AiOutlineArrowDown />
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedAdvertisement(advertisement)
                                }
                                className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                                aria-label="Info"
                              >
                                <MdOutlineRemoveRedEye />
                              </button>
                              {updatePermission && (
                                <button
                                  onClick={() => openEditForm(advertisement)}
                                  className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                                  aria-label="Edit"
                                >
                                  <TbEdit />
                                </button>
                              )}
                              {deletePermission && (
                                <button
                                  onClick={() =>
                                    deleteAdvertisement(
                                      advertisement.id.toString()
                                    )
                                  }
                                  className="text-2xl text-red-600 dark:text-red-500 hover:underline"
                                  aria-label="Delete"
                                >
                                  <MdDeleteOutline />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center">
                            No advertisements found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {!error && (
                <p className="my-4 text-sm">
                  Showing {advertisements.length} out of {pagination.totalItems}{" "}
                  Advertisements
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
                {editingAdvertisement
                  ? "Edit Advertisement"
                  : "Add New Advertisement"}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="link"
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
                    htmlFor="products"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Products
                  </label>
                  <Select
                    isMulti
                    id="products"
                    options={products.map((product) => ({
                      label: product.product_name,
                      value: product.id,
                    }))}
                    value={selectedProduct.map((productId) => ({
                      label: products.find((p) => p.id === productId)
                        ?.product_name,
                      value: productId,
                    }))}
                    onChange={(selectedOptions) =>
                      setSelectedProduct(
                        selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : []
                      )
                    }
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Advertisement Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        setAdvertisementImage(file as File | null);
                      } else {
                        setAdvertisementImage(null);
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>

                {editingAdvertisement && imagePreview && (
                  <div className="mb-4">
                    <img
                      src={BACKEND_MEDIA_LINK + imagePreview}
                      alt="Advertisement Preview"
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
                    {editingAdvertisement
                      ? "Update Advertisement"
                      : "Add Advertisement"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {selectedAdvertisement && (
            <DetailsPopup
              title="Advertisement Details"
              fields={[
                { label: "ID", value: selectedAdvertisement.id.toString() },
                { label: "Title", value: selectedAdvertisement.title },
                {
                  label: "Description",
                  value: selectedAdvertisement.description,
                },
                {
                  label: "Total Views",
                  value: selectedAdvertisement.total_views.toString(),
                },
                {
                  label: "Total Clicks",
                  value: selectedAdvertisement.total_clicks.toString(),
                },
                {
                  label: "Start Date Time",
                  value: selectedAdvertisement.start_date_time,
                },
                {
                  label: "End Date Time",
                  value: selectedAdvertisement.end_date_time,
                },
                { label: "Link", value: selectedAdvertisement.link },
                { label: "App Page", value: selectedAdvertisement.app_page },
                {
                  label: "Products",
                  value: (
                    <div>
                      {selectedAdvertisement.products.map((product) => (
                        <Badge
                          color={"info"}
                          key={product.product_id}
                          className="!inline-block mr-2"
                        >
                          {product.product_name}
                        </Badge>
                      ))}
                    </div>
                  ),
                },
                {
                  label: "Advertisement Image",
                  value: (
                    <img
                      src={BACKEND_MEDIA_LINK + selectedAdvertisement.image}
                      alt={selectedAdvertisement.title}
                      className="w-24 h-24 object-cover"
                    />
                  ),
                },
                {
                  label: "Status",
                  value:
                    selectedAdvertisement.status === "active"
                      ? "Active"
                      : "Inactive",
                },
                {
                  label: "Created At",
                  value: new Date(
                    selectedAdvertisement.createdAt
                  ).toLocaleString(),
                },
                {
                  label: "Updated At",
                  value: new Date(
                    selectedAdvertisement.updatedAt
                  ).toLocaleString(),
                },
              ]}
              onClose={() => setSelectedAdvertisement(null)}
            />
          )}
          {isDeletePopupOpen && (
            <CustomPopup
              title="Confirm Deletion"
              description="Are you sure you want to delete this advertisement?"
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdsPage;
