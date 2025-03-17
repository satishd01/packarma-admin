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

interface PackingTypeForm {
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

const PackingType: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [packingTypeForm, setPackingTypeForm] = useState<PackingTypeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackagingType, setEditingPackagingType] =
    useState<PackingTypeForm | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [shortDescription, setShortDescription] = useState("");
  const [selectedPackagingType, setSelectedPackagingType] =
    useState<PackingTypeForm | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [packingTypeIdToDelete, setPackingTypeIdToDelete] = useState<
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
    fetchPackingTypeForm();
  }, [currentPage, entriesPerPage]);

  const fetchPackingTypeForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/packing-types`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        }
      );
      setPackingTypeForm(response.data.data.packingTypes || []);
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

  const deletePackingTypeForm = (id: number) => {
    setPackingTypeIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (packingTypeIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/packing-types/${packingTypeIdToDelete}`
        );
        fetchPackingTypeForm();
      } catch (err) {
        setError("Failed to delete packing type");
      }
      setDeletePopupOpen(false);
      setPackingTypeIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setPackingTypeIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingPackagingType(null);
    setName("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (packingTypeForm: PackingTypeForm) => {
    setEditingPackagingType(packingTypeForm);
    setName(packingTypeForm.name);
    setStatus(packingTypeForm.status);
    setShortDescription(packingTypeForm.short_description);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPackagingType(null);
    setName("");
    setStatus("");
    setShortDescription("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: name,
        status: status,
        short_description: shortDescription,
      };

      if (editingPackagingType) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/packing-types/${editingPackagingType.id}`,
          data
        );
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/packing-types`, data);
      }

      closeForm();
      fetchPackingTypeForm();
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
      await api.put(`${BACKEND_API_KEY}/api/admin/product/packing-types/${id}`, {
        status: newStatus,
      });
      fetchPackingTypeForm();
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
        Manage Packing Type
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
              Add New Packing Type
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
            <ErrorComp error={error} onRetry={fetchPackingTypeForm} />
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
                  {packingTypeForm.length > 0 ? (
                    packingTypeForm.map((packingTypeForm) => (
                      <tr
                        key={packingTypeForm.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {packingTypeForm.id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packingTypeForm.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packingTypeForm.short_description}
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={packingTypeForm.status === "active"}
                              onChange={() =>
                                toggleStatus(
                                  packingTypeForm.id,
                                  packingTypeForm.status
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
                                packingTypeForm.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {packingTypeForm.status.charAt(0).toUpperCase() +
                                packingTypeForm.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() =>
                              setSelectedPackagingType(packingTypeForm)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(packingTypeForm)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deletePackingTypeForm(packingTypeForm.id)
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
                        No packing type found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {packingTypeForm.length} out of {pagination.totalItems}{" "}
              Packing Type
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
            {editingPackagingType
              ? "Edit Packing Type"
              : "Add New Packing Type"}
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
                {editingPackagingType
                  ? "Update Packing Type"
                  : "Add Packing Type"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedPackagingType && (
        <DetailsPopup
          title="Packaging Type Details"
          fields={[
            { label: "ID", value: selectedPackagingType.id.toString() },
            { label: "Name", value: selectedPackagingType.name },
            {
              label: "Status",
              value:
                selectedPackagingType.status === "active"
                  ? "Active"
                  : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(selectedPackagingType.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedPackagingType.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedPackagingType(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this packing type?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default PackingType;
