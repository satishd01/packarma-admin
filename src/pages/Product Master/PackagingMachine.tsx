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
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";
import PaginationComponent from "../../components/PaginatonComponent";

interface PackagingMachine {
  id: number;
  name: string;
  image: string;
  status: string;
  short_description: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const PackagingMachine: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [packagingMachine, setPackagingMachine] = useState<PackagingMachine[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackagingMachine, setEditingPackagingMachine] =
    useState<PackagingMachine | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [shortDescription, setShortDescription] = useState("");
  const [selectedPackagingMachine, setSelectedPackagingMachine] =
    useState<PackagingMachine | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [packagingMachineIdToDelete, setPackagingMachineIdToDelete] = useState<
    number | null
  >(null);

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
    fetchPackagingMachine();
  }, [currentPage, entriesPerPage]);

  const fetchPackagingMachine = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/packaging-machines`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        }
      );
      setPackagingMachine(response.data.data.packaging_machine || []);
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

  const deletePackagingMachine = (id: number) => {
    setPackagingMachineIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (packagingMachineIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/packaging-machines/${packagingMachineIdToDelete}`
        );
        fetchPackagingMachine();
      } catch (err: any) {
        toast.dismiss();
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete");
      }
      setDeletePopupOpen(false);
      setPackagingMachineIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setPackagingMachineIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingPackagingMachine(null);
    setName("");
    setImage(null);
    setImagePreview("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (packagingMachine: PackagingMachine) => {
    setEditingPackagingMachine(packagingMachine);
    setName(packagingMachine.name);
    setImage(null);
    setImagePreview(packagingMachine.image);
    setStatus(packagingMachine.status);
    setShortDescription(packagingMachine.short_description);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPackagingMachine(null);
    setName("");
    setImage(null);
    setImagePreview("");
    setStatus("");
    setShortDescription("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("short_description", shortDescription);
      formData.append("status", status);
      formData.append("type", "packagingmachine");
      if (image) {
        formData.append("image", image);
      }

      if (editingPackagingMachine) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/packaging-machines/${editingPackagingMachine.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(
          `${BACKEND_API_KEY}/api/admin/product/packaging-machines`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      closeForm();
      fetchPackagingMachine();
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
      await api.put(`${BACKEND_API_KEY}/api/admin/product/packaging-machines/${id}`, {
        status: newStatus,
      });
      fetchPackagingMachine();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Packaging Machine
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
              className="bg-lime-500 text-black px-4 py-2 rounded block mr-4"
            >
              Add New Packaging Machine
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
            <ErrorComp error={error} onRetry={fetchPackagingMachine} />
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
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Image
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packagingMachine.length > 0 ? (
                    packagingMachine.map((packagingMachine) => (
                      <tr
                        key={packagingMachine.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {packagingMachine.id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingMachine.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingMachine.short_description}
                        </td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + packagingMachine.image}
                            alt={packagingMachine.name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={packagingMachine.status === "active"}
                              onChange={() =>
                                toggleStatus(
                                  packagingMachine.id,
                                  packagingMachine.status
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
                                packagingMachine.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {packagingMachine.status.charAt(0).toUpperCase() +
                                packagingMachine.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() =>
                              setSelectedPackagingMachine(packagingMachine)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(packagingMachine)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deletePackagingMachine(packagingMachine.id)
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
                      <td colSpan={6} className="px-6 py-4 text-center">
                        No packaging machine found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {packagingMachine.length} out of {pagination.totalItems}{" "}
              Packaging Machine
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
            {editingPackagingMachine
              ? "Edit Packaging Machine"
              : "Add New Packaging Machine"}
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
                Image
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
              />
            </div>
            {editingPackagingMachine && imagePreview && (
              <div className="mb-4">
                <img
                  src={BACKEND_MEDIA_LINK + imagePreview}
                  alt="Product Form Preview"
                  className="w-16 h-16 object-cover mb-2"
                />
              </div>
            )}

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
                {editingPackagingMachine
                  ? "Update Packaging Machine"
                  : "Add Packaging Machine"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedPackagingMachine && (
        <DetailsPopup
          title="Category Details"
          fields={[
            { label: "ID", value: selectedPackagingMachine.id.toString() },
            { label: "Name", value: selectedPackagingMachine.name },
            {
              label: "Image",
              value: (
                <img
                  src={BACKEND_MEDIA_LINK + selectedPackagingMachine.image}
                  alt={selectedPackagingMachine.name}
                  className="w-24 h-24 object-cover"
                />
              ),
            },
            {
              label: "Status",
              value:
                selectedPackagingMachine.status === "active"
                  ? "Active"
                  : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(
                selectedPackagingMachine.createdAt
              ).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(
                selectedPackagingMachine.updatedAt
              ).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedPackagingMachine(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this packaging machine?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default PackagingMachine;
