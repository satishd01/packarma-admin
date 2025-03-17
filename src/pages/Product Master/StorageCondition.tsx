import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner } from "flowbite-react";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import toast from "react-hot-toast";
import PaginationComponent from "../../components/PaginatonComponent";

interface StorageCondition {
  id: number;
  name: string;
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

const StorageCondition: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [storageCondition, setStorageCondition] = useState<StorageCondition[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStorageCondition, setEditingStorageCondition] =
    useState<StorageCondition | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [shortDescription, setShortDescription] = useState("");
  const [selectedStorageCondition, setSelectedStorageCondition] =
    useState<StorageCondition | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedStorageConditionId, setSelectedStorageConditionId] = useState<
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
    fetchStorageCondition();
  }, [currentPage, entriesPerPage]);

  const fetchStorageCondition = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/storage-conditions`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        }
      );
      setStorageCondition(response.data.data.storageConditions || []);
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

  const openAddForm = () => {
    setEditingStorageCondition(null);
    setName("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (storageCondition: StorageCondition) => {
    setEditingStorageCondition(storageCondition);
    setName(storageCondition.name);
    setStatus(storageCondition.status);
    setShortDescription(storageCondition.short_description);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStorageCondition(null);
    setName("");
    setStatus("");
    setShortDescription("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: name,
        short_description: shortDescription,
        status: status,
      };

      if (editingStorageCondition) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/storage-conditions/${editingStorageCondition.id}`,
          data
        );
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/storage-conditions`, data);
      }

      closeForm();
      fetchStorageCondition();
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
      await api.put(`${BACKEND_API_KEY}/api/admin/product/storage-conditions/${id}`, {
        status: newStatus,
      });
      fetchStorageCondition();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update");
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedStorageConditionId !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/storage-conditions/${selectedStorageConditionId}`
        );
        fetchStorageCondition();
      } catch (err: any) {
        toast.dismiss();
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete");
      }
      setIsDeletePopupOpen(false);
      setSelectedStorageConditionId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setSelectedStorageConditionId(null);
  };

  const deleteStorageCondition = async (id: number) => {
    setSelectedStorageConditionId(id);
    setIsDeletePopupOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Storage Condition
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
              Add New Storage Condition
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
            <ErrorComp error={error} onRetry={fetchStorageCondition} />
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
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {storageCondition.length > 0 ? (
                    storageCondition.map((storageCondition) => (
                      <tr
                        key={storageCondition.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {storageCondition.id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {storageCondition.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          {storageCondition.short_description}
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={storageCondition.status === "active"}
                              onChange={() =>
                                toggleStatus(
                                  storageCondition.id,
                                  storageCondition.status
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
                                storageCondition.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {storageCondition.status.charAt(0).toUpperCase() +
                                storageCondition.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() =>
                              setSelectedStorageCondition(storageCondition)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(storageCondition)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deleteStorageCondition(storageCondition.id)
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
                        No storage condition found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {storageCondition.length} out of {pagination.totalItems}{" "}
              Storage Condition
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
            {editingStorageCondition
              ? "Edit Storage Condition"
              : "Add New Storage Condition"}
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
                {editingStorageCondition
                  ? "Update Storage Condition"
                  : "Add Storage Condition"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedStorageCondition && (
        <DetailsPopup
          title="Storage Condition Details"
          fields={[
            { label: "ID", value: selectedStorageCondition.id.toString() },
            { label: "Name", value: selectedStorageCondition.name },
            {
              label: "Short Description",
              value: selectedStorageCondition.short_description,
            },
            {
              label: "Status",
              value:
                selectedStorageCondition.status === "active"
                  ? "Active"
                  : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(
                selectedStorageCondition.createdAt
              ).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(
                selectedStorageCondition.updatedAt
              ).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedStorageCondition(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this storage condition?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default StorageCondition;
