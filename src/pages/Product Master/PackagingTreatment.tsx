import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner } from "flowbite-react";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import toast from "react-hot-toast";
import PaginationComponent from "../../components/PaginatonComponent";

interface PackagingTreatment {
  id: number;
  name: string;
  image: string;
  status: string;
  featured: number;
  short_description: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const PackagingTreatmentPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [packagingTreatments, setPackagingTreatments] = useState<
    PackagingTreatment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackagingTreatment, setEditingPackagingTreatment] =
    useState<PackagingTreatment | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [featured, setfeatured] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [shortDescription, setShortDescription] = useState("");
  const [selectedPackagingTreatment, setSelectedPackagingTreatment] =
    useState<PackagingTreatment | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [packagingTreatmentIdToDelete, setPackagingTreatmentIdToDelete] =
    useState<number | null>(null);

  const userContext = useUser();

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Product Master",
    "can_update"
  );

  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Product Master",
    "can_create"
  );

  const deletePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Product Master",
    "can_delete"
  );

  useEffect(() => {
    fetchPackagingTreatments();
  }, [currentPage, entriesPerPage]);

  const fetchPackagingTreatments = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/packaging-treatment`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        }
      );
      setPackagingTreatments(response.data.data.packaging_treatments || []);
      if (response.data.data.pagination) {
        setPagination(response.data.data.pagination);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const deletePackagingTreatment = (id: number) => {
    setPackagingTreatmentIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (packagingTreatmentIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/packaging-treatment/${packagingTreatmentIdToDelete}`
        );
        fetchPackagingTreatments();
      } catch (err: any) {
        toast.dismiss();
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete");
      }
      setDeletePopupOpen(false);
      setPackagingTreatmentIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setPackagingTreatmentIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingPackagingTreatment(null);
    setName("");
    setImage(null);
    setStatus("active");
    setfeatured(0);
    setIsFormOpen(true);
  };

  const openEditForm = (packagingTreatment: PackagingTreatment) => {
    setEditingPackagingTreatment(packagingTreatment);
    setName(packagingTreatment.name);
    setImage(null);
    setStatus(packagingTreatment.status);
    setfeatured(packagingTreatment.featured ? 1 : 0);
    setIsFormOpen(true);
    setImagePreview(packagingTreatment.image);
    setShortDescription(packagingTreatment.short_description);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPackagingTreatment(null);
    setName("");
    setImage(null);
    setStatus("");
    setfeatured(0);
    setShortDescription("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("short_description", shortDescription);
      formData.append("status", status);
      formData.append("featured", String(featured));
      formData.append("type", "packagingtreatment");
      if (image) {
        formData.append("image", image);
      }

      if (editingPackagingTreatment) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/packaging-treatment/${editingPackagingTreatment.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(
          `${BACKEND_API_KEY}/api/admin/product/packaging-treatment`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      closeForm();
      fetchPackagingTreatments();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to add");
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/product/packaging-treatment/${id}`, {
        status: newStatus,
      });
      fetchPackagingTreatments();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update");
    }
  };

  const togglefeatured = async (id: number, currentfeatured: number) => {
    const newfeatured = currentfeatured === 1 ? 0 : 1;
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/product/packaging-treatment/${id}`, {
        featured: newfeatured,
      });
      fetchPackagingTreatments();
    } catch (err) {
      setError("Failed to update featured");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Packaging Treatments
      </h1>
      {!isFormOpen && (
        <div className="flex justify-between items-center w-full my-6">
          <EntriesPerPage
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />
          {createPermission && (
            <button
              onClick={openAddForm}
              className="bg-lime-500 text-black px-4 py-2 rounded mb-4 block ml-auto mr-4"
            >
              Add New Packaging Treatment
            </button>
          )}
        </div>
      )}
      {!isFormOpen && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <ErrorComp error={error} onRetry={fetchPackagingTreatments} />
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                      Image
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Featured
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packagingTreatments.length > 0 ? (
                    packagingTreatments.map((packagingTreatment) => (
                      <tr
                        key={packagingTreatment.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {packagingTreatment.id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingTreatment.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + packagingTreatment.image}
                            alt={packagingTreatment.name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={packagingTreatment.status === "active"}
                              onChange={() =>
                                toggleStatus(
                                  packagingTreatment.id,
                                  packagingTreatment.status
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
                                packagingTreatment.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {packagingTreatment.status
                                .charAt(0)
                                .toUpperCase() +
                                packagingTreatment.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={packagingTreatment.featured === 1}
                              onChange={() =>
                                togglefeatured(
                                  packagingTreatment.id,
                                  packagingTreatment.featured
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
                                packagingTreatment.featured === 1
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {packagingTreatment.featured === 1 ? "Yes" : "No"}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() =>
                              setSelectedPackagingTreatment(packagingTreatment)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(packagingTreatment)}
                              className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deletePackagingTreatment(packagingTreatment.id)
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
                      <td colSpan={5} className="px-6 py-4 text-center">
                        No packaging treatments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {packagingTreatments.length} out of{" "}
              {pagination.totalItems} Packaging Treatments
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
        <div className="w-[50%] mx-auto my-10">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
            {editingPackagingTreatment
              ? "Edit Packaging Treatment"
              : "Add New Packaging Treatment"}
          </h3>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL
              </label>
              <input
                type="file"
                id="image"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    setImage(file as File | null);
                  } else {
                    setImage(null);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            {editingPackagingTreatment && imagePreview && (
              <div className="mb-4">
                <img
                  src={BACKEND_MEDIA_LINK + imagePreview}
                  alt="Packaging Treatment Preview"
                  className="w-16 h-16 object-cover mb-2"
                />
              </div>
            )}
            <div className="mb-4">
              <label
                htmlFor="featured"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Featured
              </label>
              <div className="flex items-center">
                <ToggleSwitch
                  checked={featured === 1}
                  onChange={() => setfeatured(featured === 1 ? 0 : 1)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="short_description"
                className="block text-sm font-medium text-gray-700"
              >
                Short Description
              </label>
              <textarea
                id="short_description"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="flex justify-end mt-4">
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
                {editingPackagingTreatment
                  ? "Update Packaging Treatment"
                  : "Add Packaging Treatment"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedPackagingTreatment && (
        <DetailsPopup
          title="Packaging Treatment Details"
          fields={[
            { label: "ID", value: selectedPackagingTreatment.id.toString() },
            { label: "Name", value: selectedPackagingTreatment.name },
            {
              label: "Short Description",
              value: selectedPackagingTreatment.short_description,
            },
            {
              label: "Image",
              value: (
                <img
                  src={BACKEND_MEDIA_LINK + selectedPackagingTreatment.image}
                  alt={selectedPackagingTreatment.name}
                  className="w-24 h-24 object-cover"
                />
              ),
            },
            {
              label: "Featured",
              value: selectedPackagingTreatment.featured === 1 ? "Yes" : "No",
            },
            {
              label: "Status",
              value:
                selectedPackagingTreatment.status === "active"
                  ? "Active"
                  : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(
                selectedPackagingTreatment.createdAt
              ).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(
                selectedPackagingTreatment.updatedAt
              ).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedPackagingTreatment(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this packaging treatment?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default PackagingTreatmentPage;
