import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput } from "flowbite-react";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import { FaRegFileExcel } from "react-icons/fa";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import toast from "react-hot-toast";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import PaginationComponent from "../../components/PaginatonComponent";

interface PackagingMaterial {
  id: number;
  material_name: string;
  status: string;
  material_description?: string;
  createdAt: string;
  updatedAt: string;
  wvtr: string;
  otr: string;
  cof: string;
  sit: string;
  gsm: string;
  special_feature?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const PackagingMaterial: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [packagingMaterials, setPackagingMaterials] = useState<
    PackagingMaterial[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackagingMaterial, setEditingPackagingMaterial] =
    useState<PackagingMaterial | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [materialDescription, setMaterialDescription] = useState("");
  const [selectedPackagingMaterial, setSelectedPackagingMaterial] =
    useState<PackagingMaterial | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedPackagingMaterialId, setSelectedPackagingMaterialId] =
    useState<number | null>(null);
  const [wvtr, setWvtr] = useState("");
  const [otr, setOtr] = useState("");
  const [cof, setCof] = useState("");
  const [sit, setSit] = useState("");
  const [gsm, setGsm] = useState("");
  const [specialFeature, setSpecialFeature] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [materialFilter, setMaterialFilter] = useState("");
  const [materialFilterDebounced, setDebouncedMaterialFilter] = useState("");

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

  const exportPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Product Master",
    "can_export"
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMaterialFilter(materialFilter);
    }, 350);
    setCurrentPage(1);

    return () => {
      clearTimeout(handler);
    };
  }, [materialFilter]);

  useEffect(() => {
    fetchPackagingMaterials();
  }, [currentPage, entriesPerPage, materialFilterDebounced]);

  const fetchPackagingMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/packaging-materials`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            search: materialFilter,
          },
        }
      );
      setPackagingMaterials(response.data.data.packagingMaterials || []);
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
    setEditingPackagingMaterial(null);
    setMaterialName("");
    setStatus("active");
    setIsFormOpen(true);
    setFilterOpen(false);
  };

  const openEditForm = (packagingMaterial: PackagingMaterial) => {
    setEditingPackagingMaterial(packagingMaterial);
    setMaterialName(packagingMaterial.material_name);
    setStatus(packagingMaterial.status);
    setMaterialDescription(packagingMaterial.material_description || "");
    setWvtr(packagingMaterial.wvtr);
    setOtr(packagingMaterial.otr);
    setCof(packagingMaterial.cof);
    setSit(packagingMaterial.sit);
    setGsm(packagingMaterial.gsm);
    setSpecialFeature(packagingMaterial.special_feature || "");
    setIsFormOpen(true);
    setFilterOpen(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPackagingMaterial(null);
    setMaterialName("");
    setStatus("");
    setMaterialDescription("");
    setWvtr("");
    setOtr("");
    setCof("");
    setSit("");
    setGsm("");
    setSpecialFeature("");
  };

  const downloadExcelController = async () => {
    toast.loading("Exporting...");
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/product/packaging-materials/export`,
        {},
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `packaging_materials_exported_(${formatDateForFilename()}).xlsx`;
      link.setAttribute("download", title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success("Exported successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        material_name: materialName,
        material_description: materialDescription,
        status: status,
        wvtr: wvtr,
        otr: otr,
        cof: cof,
        sit: sit,
        gsm: gsm,
        special_feature: specialFeature,
      };

      if (editingPackagingMaterial) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/packaging-materials/${editingPackagingMaterial.id}`,
          data
        );
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/packaging-materials`, data);
      }

      closeForm();
      fetchPackagingMaterials();
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
      await api.put(`${BACKEND_API_KEY}/api/admin/product/packaging-materials/${id}`, {
        status: newStatus,
      });
      fetchPackagingMaterials();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update");
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedPackagingMaterialId !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/packaging-materials/${selectedPackagingMaterialId}`
        );
        fetchPackagingMaterials();
      } catch (err: any) {
        toast.dismiss();
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete");
      }
      setIsDeletePopupOpen(false);
      setSelectedPackagingMaterialId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setSelectedPackagingMaterialId(null);
  };

  const deletePackagingMaterial = async (id: number) => {
    setSelectedPackagingMaterialId(id);
    setIsDeletePopupOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Packaging Material
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
                setMaterialFilter("");
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
            {exportPermission && (
              <button
                className="bg-green-500 text-white px-3 py-2 rounded block mr-4"
                onClick={downloadExcelController}
              >
                <FaRegFileExcel size={22} />
              </button>
            )}
            {createPermission && (
              <button
                onClick={openAddForm}
                className="bg-lime-500 text-black px-4 py-2 rounded block mr-4"
              >
                Add New Packaging Material
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="flex justify-start items-center mb-6">
          <TextInput
            type="text"
            className="customInput w-[25%]"
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            placeholder="Search Material.."
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
            <ErrorComp error={error} onRetry={fetchPackagingMaterials} />
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
                  {packagingMaterials.length > 0 ? (
                    packagingMaterials.map((packagingMaterial) => (
                      <tr
                        key={packagingMaterial.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {packagingMaterial.id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingMaterial.material_name}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingMaterial.material_description}
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={packagingMaterial.status === "active"}
                              onChange={() =>
                                toggleStatus(
                                  packagingMaterial.id,
                                  packagingMaterial.status
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
                                packagingMaterial.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {packagingMaterial.status
                                .charAt(0)
                                .toUpperCase() +
                                packagingMaterial.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() =>
                              setSelectedPackagingMaterial(packagingMaterial)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(packagingMaterial)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deletePackagingMaterial(packagingMaterial.id)
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
                        No packaging material found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {packagingMaterials.length} out of {pagination.totalItems}{" "}
              Packaging Material
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
            {editingPackagingMaterial
              ? "Edit Packaging Material"
              : "Add New Packaging Material"}
          </h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-5">
            <div className="mb-4">
              <label
                htmlFor="material_name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="material_name"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="wvtr"
                className="block text-sm font-medium text-gray-700"
              >
                WVTR
              </label>
              <input
                type="text"
                id="wvtr"
                value={wvtr}
                onChange={(e) => setWvtr(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="otr"
                className="block text-sm font-medium text-gray-700"
              >
                OTR
              </label>
              <input
                type="text"
                id="otr"
                value={otr}
                onChange={(e) => setOtr(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="cof"
                className="block text-sm font-medium text-gray-700"
              >
                COF
              </label>
              <input
                type="text"
                id="cof"
                value={cof}
                onChange={(e) => setCof(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="sit"
                className="block text-sm font-medium text-gray-700"
              >
                SIT
              </label>
              <input
                type="text"
                id="sit"
                value={sit}
                onChange={(e) => setSit(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="gsm"
                className="block text-sm font-medium text-gray-700"
              >
                GSM
              </label>
              <input
                type="text"
                id="gsm"
                value={gsm}
                onChange={(e) => setGsm(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4 col-span-2">
              <label
                htmlFor="special_feature"
                className="block text-sm font-medium text-gray-700"
              >
                Special Feature
              </label>
              <input
                type="text"
                id="special_feature"
                value={specialFeature}
                onChange={(e) => setSpecialFeature(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4 col-span-2">
              <label
                htmlFor="material_description"
                className="block text-sm font-medium text-gray-700"
              >
                Short Description
              </label>
              <textarea
                id="material_description"
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="flex justify-end col-span-2 mt-4">
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
                {editingPackagingMaterial
                  ? "Update Packaging Material"
                  : "Add Packaging Material"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedPackagingMaterial && (
        <DetailsPopup
          title="Packaging Material Details"
          fields={[
            { label: "ID", value: selectedPackagingMaterial.id.toString() },
            { label: "Name", value: selectedPackagingMaterial.material_name },
            {
              label: "Short Description",
              value: selectedPackagingMaterial.material_description || "",
            },
            { label: "WVTR", value: selectedPackagingMaterial.wvtr.toString() },
            { label: "OTR", value: selectedPackagingMaterial.otr.toString() },
            { label: "COF", value: selectedPackagingMaterial.cof.toString() },
            { label: "SIT", value: selectedPackagingMaterial.sit.toString() },
            { label: "GSM", value: selectedPackagingMaterial.gsm.toString() },
            {
              label: "Special Feature",
              value: selectedPackagingMaterial.special_feature || "",
            },
            {
              label: "Status",
              value:
                selectedPackagingMaterial.status === "active"
                  ? "Active"
                  : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(
                selectedPackagingMaterial.createdAt
              ).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(
                selectedPackagingMaterial.updatedAt
              ).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedPackagingMaterial(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this packaging material?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default PackagingMaterial;
