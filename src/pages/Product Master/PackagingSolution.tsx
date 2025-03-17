import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput } from "flowbite-react";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import { FaRegFileExcel } from "react-icons/fa";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import toast from "react-hot-toast";
import { AiOutlineSearch } from "react-icons/ai";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import Select, { SingleValue } from "react-select";
import { customStyle } from "../../../utils/CustomSelectTheme";
import PaginationComponent from "../../components/PaginatonComponent";

interface PackagingSolutionsInterface {
  id: number;
  name: string;
  structure_type: string;
  sequence: number;
  storage_condition_id: number;
  display_shelf_life_days: number;
  product_id: number;
  product_category_id: number;
  product_form_id: number;
  packaging_treatment_id: number;
  packing_type_id: number;
  packaging_machine_id: number;
  packaging_material_id: number;
  product_min_weight: string;
  product_max_weight: string;
  min_order_quantity: number;
  min_order_quantity_unit_id: number;
  createdAt: string;
  updatedAt: string;
  storage_condition_name: string;
  product_name: string;
  category_name: string;
  product_form_name: string;
  packaging_treatment_name: string;
  packing_type_name: string;
  packaging_machine_name: string;
  packaging_material_name: string;
  min_order_quantity_unit_name: string;
  status: string;
  image: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const PackagingSolutions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [packagingSolutions, setPackagingSolutions] = useState<
    PackagingSolutionsInterface[]
  >([]);
  const [formPackagingSolutions, setFormPackagingSolutions] =
    useState<PackagingSolutionsInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedPackagingSolutions, setSelectedPackagingSolutions] =
    useState<PackagingSolutionsInterface | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false);
  const [selectedPackagingSolutionsId, setSelectedPackagingSolutionsId] =
    useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [productForms, setProductForms] = useState<any[]>([]);
  const [packagingTreatments, setPackagingTreatments] = useState<any[]>([]);
  const [packingTypes, setPackingTypes] = useState<any[]>([]);
  const [packagingMachines, setPackagingMachines] = useState<any[]>([]);
  const [packagingMaterials, setPackagingMaterials] = useState<any[]>([]);
  const [storageConditions, setStorageConditions] = useState<any[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("engine");
  const [type, setType] = useState("edit");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const userContext = useUser();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<{
    name: string;
    structure_type: string;
    storage_condition_id: string;
    product_name: string;
    product_form_name: string;
    packaging_treatment_name: string;
    packing_type_name: string;
    packaging_machine_name: string;
    packaging_material_name: string;
  }>({
    name: "",
    structure_type: "",
    storage_condition_id: "",
    product_name: "",
    product_form_name: "",
    packaging_treatment_name: "",
    packing_type_name: "",
    packaging_machine_name: "",
    packaging_material_name: "",
  });

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
    if (filterOpen) {
      fetchPackagingSolutions("filter");
    } else fetchPackagingSolutions();
    fetchSelectOptions();
  }, [currentPage, entriesPerPage]);

  const fetchPackagingSolutions = async (type?: string) => {
    try {
      setLoading(true);
      let response;
      if (type === "filter") {
        response = await api.get(
          `${BACKEND_API_KEY}/api/admin/product/packaging-solutions`,
          {
            params: {
              page: currentPage,
              limit: entriesPerPage,
              name: filter.name,
              structure_type: filter.structure_type,
              storage_condition_id: filter.storage_condition_id,
              product_name: filter.product_name,
              product_form_name: filter.product_form_name,
              packaging_treatment_name: filter.packaging_treatment_name,
              packing_type_name: filter.packing_type_name,
              packaging_machine_name: filter.packaging_machine_name,
              packaging_material_name: filter.packaging_material_name,
            },
          }
        );
      } else {
        response = await api.get(
          `${BACKEND_API_KEY}/api/admin/product/packaging-solutions`,
          {
            params: {
              page: currentPage,
              limit: entriesPerPage,
            },
          }
        );
      }
      setPackagingSolutions(response.data.data.packagingSolutions || []);
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
  const fetchSelectOptions = async () => {
    try {
      const [
        productsResponse,
        categoriesResponse,
        formsResponse,
        treatmentsResponse,
        typesResponse,
        machinesResponse,
        materialsResponse,
        storageConditionsResponse,
        unitsResponse,
      ] = await Promise.all([
        api.get(`${BACKEND_API_KEY}/api/admin/product/get-products?pagination=false`),
        api.get(`${BACKEND_API_KEY}/api/admin/product/categories?pagination=false`),
        api.get(`${BACKEND_API_KEY}/api/admin/product/product-form?pagination=false`),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/packaging-treatment?pagination=false`
        ),
        api.get(`${BACKEND_API_KEY}/api/admin/product/packing-types?pagination=false`),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/packaging-machines?pagination=false`
        ),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/packaging-materials?pagination=false`
        ),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/storage-conditions?pagination=false`
        ),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/measurement-units?pagination=false`
        ),
      ]);

      setProducts(productsResponse.data.data.products);
      setProductCategories(categoriesResponse.data.data.categories);
      setProductForms(formsResponse.data.data.productForms);
      setPackagingTreatments(treatmentsResponse.data.data.packaging_treatments);
      setPackingTypes(typesResponse.data.data.packingTypes);
      setPackagingMachines(machinesResponse.data.data.packaging_machine);
      setPackagingMaterials(materialsResponse.data.data.packagingMaterials);
      setStorageConditions(
        storageConditionsResponse.data.data.storageConditions
      );
      setMeasurementUnits(unitsResponse.data.data.measurementUnits);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to fetch select options"
      );
    }
  };

  const openAddForm = () => {
    setFormPackagingSolutions(null);
    setIsFormOpen(true);
    setImage(null);
    setType("add");
    setFilterOpen(false);
  };

  const openEditForm = (product: PackagingSolutionsInterface) => {
    const selectedProduct = products.find((p) => p.id === product.product_id);
    setFormPackagingSolutions({
      ...product,
      product_category_id:
        selectedProduct?.category_id || product.product_category_id,
      product_form_id: selectedProduct?.form_id || product.product_form_id,
      packaging_treatment_id:
        selectedProduct?.treatment_id || product.packaging_treatment_id,
    });
    setIsFormOpen(true);
    setType("edit");
    setImage(null);
    setImagePreview(product.image);
    setFilterOpen(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setImage(null);
    setFormPackagingSolutions(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = products.find(
      (p) => p.id === formPackagingSolutions?.product_id
    );

    const formData = new FormData();

    if (type === "add") {
      if (formPackagingSolutions?.image === undefined) {
        toast.error("Image Can Not Be Empty!");
      }
    }

    if (!formPackagingSolutions?.name) {
      setActiveTab("engine");
      return;
    }
    if (!formPackagingSolutions?.structure_type) {
      setActiveTab("engine");
      return;
    }
    if (formPackagingSolutions?.sequence === undefined) {
      setActiveTab("engine");
      return;
    }
    if (!formPackagingSolutions?.storage_condition_id) {
      setActiveTab("engine");
      return;
    }
    if (formPackagingSolutions?.display_shelf_life_days === undefined) {
      setActiveTab("engine");
      return;
    }
    if (!formPackagingSolutions?.product_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.product_category_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.product_form_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.packaging_treatment_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.packing_type_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.packaging_machine_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.packaging_material_id) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.product_min_weight) {
      setActiveTab("product");
      return;
    }
    if (!formPackagingSolutions?.product_max_weight) {
      setActiveTab("product");
      return;
    }
    if (formPackagingSolutions?.min_order_quantity === undefined) {
      setActiveTab("moq");
      return;
    }
    if (!formPackagingSolutions?.min_order_quantity_unit_id) {
      setActiveTab("moq");
      return;
    }

    formData.append("name", formPackagingSolutions?.name || "");
    formData.append(
      "structure_type",
      formPackagingSolutions?.structure_type || ""
    );
    formData.append(
      "sequence",
      formPackagingSolutions?.sequence?.toString() || ""
    );
    formData.append(
      "storage_condition_id",
      formPackagingSolutions?.storage_condition_id?.toString() || ""
    );
    formData.append(
      "display_shelf_life_days",
      formPackagingSolutions?.display_shelf_life_days?.toString() || ""
    );
    formData.append(
      "product_id",
      formPackagingSolutions?.product_id?.toString() || ""
    );
    formData.append(
      "product_category_id",
      (
        selectedProduct?.category_id ||
        formPackagingSolutions?.product_category_id
      )?.toString() || ""
    );
    formData.append(
      "product_form_id",
      (
        selectedProduct?.form_id || formPackagingSolutions?.product_form_id
      )?.toString() || ""
    );
    formData.append(
      "packaging_treatment_id",
      (
        selectedProduct?.treatment_id ||
        formPackagingSolutions?.packaging_treatment_id
      )?.toString() || ""
    );
    formData.append(
      "packing_type_id",
      formPackagingSolutions?.packing_type_id?.toString() || ""
    );
    formData.append(
      "packaging_machine_id",
      formPackagingSolutions?.packaging_machine_id?.toString() || ""
    );
    formData.append(
      "packaging_material_id",
      formPackagingSolutions?.packaging_material_id?.toString() || ""
    );
    formData.append(
      "product_min_weight",
      formPackagingSolutions?.product_min_weight?.toString() || ""
    );
    formData.append(
      "product_max_weight",
      formPackagingSolutions?.product_max_weight?.toString() || ""
    );
    formData.append(
      "min_order_quantity",
      formPackagingSolutions?.min_order_quantity?.toString() || ""
    );
    formData.append(
      "min_order_quantity_unit_id",
      formPackagingSolutions?.min_order_quantity_unit_id?.toString() || ""
    );
    formData.append("status", formPackagingSolutions?.status?.toString() || "");
    formData.append("type", "packagingsolution");
    if (image) {
      formData.append("image", image);
    }
    try {
      if (type === "edit") {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/packaging-solutions/${formPackagingSolutions?.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(
          `${BACKEND_API_KEY}/api/admin/product/packaging-solutions`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      closeForm();
      fetchPackagingSolutions();
      setFormPackagingSolutions(null);
      setType("add");
      setActiveTab("engine");
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
      await api.put(`${BACKEND_API_KEY}/api/admin/product/packaging-solutions/${id}`, {
        status: newStatus,
      });
      fetchPackagingSolutions();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update");
    }
  };

  const downloadExcelController = async () => {
    toast.loading("Exporting...");
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/product/export-packaging-solutions`,
        {
          link: BACKEND_MEDIA_LINK,
          name: filter.name,
          structure_type: filter.structure_type,
          storage_condition_id: filter.storage_condition_id,
          product_name: filter.product_name,
          product_form_name: filter.product_form_name,
          packaging_treatment_name: filter.packaging_treatment_name,
          packing_type_name: filter.packing_type_name,
          packaging_machine_name: filter.packaging_machine_name,
          packaging_material_name: filter.packaging_material_name,
        },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `packaging_solutions_exported_(${formatDateForFilename()}).xlsx`;
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

  const handleConfirmDelete = async () => {
    if (selectedPackagingSolutionsId !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/packaging-solutions/${selectedPackagingSolutionsId}`
        );
        fetchPackagingSolutions();
      } catch (err: any) {
        toast.dismiss();
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete");
      }
      setIsDeletePopupOpen(false);
      setSelectedPackagingSolutionsId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setSelectedPackagingSolutionsId(null);
  };

  const deletePackagingSolutions = async (id: number) => {
    setSelectedPackagingSolutionsId(id);
    setIsDeletePopupOpen(true);
  };

  const handleProductChange = (productId: number) => {
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      setFormPackagingSolutions((prev) => ({
        ...prev!,
        product_id: productId,
        product_category_id: selectedProduct.category_id,
        product_form_id: selectedProduct.product_form_id,
        packaging_treatment_id: selectedProduct.packaging_treatment_id,
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Packaging Solutions
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
                setCurrentPage(1);
                setFilter({
                  name: "",
                  structure_type: "",
                  storage_condition_id: "",
                  product_name: "",
                  product_form_name: "",
                  packaging_treatment_name: "",
                  packing_type_name: "",
                  packaging_machine_name: "",
                  packaging_material_name: "",
                });
                fetchPackagingSolutions("nofilter");
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
                Add New Packaging Solution
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <TextInput
            className="customInput"
            id="name"
            placeholder="Name"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          />
          <Select
            styles={customStyle}
            id="structure_type"
            options={[
              { value: "Economical Solution", label: "Economical Solution" },
              { value: "Advance Solution", label: "Advance Solution" },
              { value: "Sustainable Solution", label: "Sustainable Solution" },
            ]}
            value={
              filter.structure_type
                ? {
                    label: filter.structure_type,
                    value: filter.structure_type,
                  }
                : undefined
            }
            onChange={(
              newValue: SingleValue<{
                label: string | undefined;
                value: string;
              }>
            ) => {
              setFilter({
                ...filter,
                structure_type: newValue?.value || "",
              });
            }}
            placeholder="Select Structure Type"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <Select
            styles={customStyle}
            id="storage_condition_id"
            options={storageConditions.map((condition) => ({
              value: condition.id,
              label: condition.name,
            }))}
            value={
              filter.storage_condition_id
                ? {
                    label: storageConditions.find(
                      (condition) =>
                        condition.id === Number(filter.storage_condition_id)
                    )?.name,
                    value: Number(filter.storage_condition_id),
                  }
                : undefined
            }
            onChange={(
              newValue: SingleValue<{
                label: string | undefined;
                value: number;
              }>
            ) => {
              setFilter({
                ...filter,
                storage_condition_id: newValue?.value?.toString() || "",
              });
            }}
            placeholder="Select Storage Condition"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <TextInput
            className="customInput"
            id="product_name"
            placeholder="Product Name"
            value={filter.product_name}
            onChange={(e) =>
              setFilter({ ...filter, product_name: e.target.value })
            }
          />
          <TextInput
            className="customInput"
            id="product_form_name"
            placeholder="Product Form Name"
            value={filter.product_form_name}
            onChange={(e) =>
              setFilter({ ...filter, product_form_name: e.target.value })
            }
          />
          <TextInput
            className="customInput"
            id="packaging_treatment_name"
            placeholder="Packaging Treatment Name"
            value={filter.packaging_treatment_name}
            onChange={(e) =>
              setFilter({
                ...filter,
                packaging_treatment_name: e.target.value,
              })
            }
          />
          <TextInput
            className="customInput"
            id="packing_type_name"
            placeholder="Packing Type Name"
            value={filter.packing_type_name}
            onChange={(e) =>
              setFilter({ ...filter, packing_type_name: e.target.value })
            }
          />
          <TextInput
            className="customInput"
            id="packaging_machine_name"
            placeholder="Packaging Machine Name"
            value={filter.packaging_machine_name}
            onChange={(e) =>
              setFilter({ ...filter, packaging_machine_name: e.target.value })
            }
          />
          <TextInput
            className="customInput"
            id="packaging_material_name"
            placeholder="Packaging Material Name"
            value={filter.packaging_material_name}
            onChange={(e) =>
              setFilter({ ...filter, packaging_material_name: e.target.value })
            }
          />
          <div className="flex">
            <button
              className="bg-lime-500 text-black px-4 py-2 rounded"
              onClick={() => {
                fetchPackagingSolutions("filter");
                setCurrentPage(1);
              }}
            >
              <AiOutlineSearch size={22} />
            </button>
          </div>
        </div>
      )}
      {!isFormOpen && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <ErrorComp error={error} onRetry={fetchPackagingSolutions} />
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Id
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Packaging Solution
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Image
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Structure Type
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Product Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Starts
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packagingSolutions.length > 0 ? (
                    packagingSolutions.map((packagingSolutions) => (
                      <tr
                        key={packagingSolutions.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {packagingSolutions.id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingSolutions.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + packagingSolutions.image}
                            alt={packagingSolutions.name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        <td className="p-4 text-gray-900">
                          {packagingSolutions.structure_type}
                        </td>{" "}
                        <td className="p-4 text-gray-900">
                          {packagingSolutions.product_name}
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={packagingSolutions.status === "active"}
                              onChange={() =>
                                toggleStatus(
                                  packagingSolutions.id,
                                  packagingSolutions.status
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
                                packagingSolutions.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {packagingSolutions.status
                                .charAt(0)
                                .toUpperCase() +
                                packagingSolutions.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() =>
                              setSelectedPackagingSolutions(packagingSolutions)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(packagingSolutions)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deletePackagingSolutions(packagingSolutions.id)
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
                        No packaging solutions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {packagingSolutions.length} out of {pagination.totalItems}{" "}
              Packaging Solutions
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
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
            {type === "edit"
              ? "Edit Packaging Solution"
              : "Add New Packaging Solution"}
          </h3>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("engine")}
              className={`px-4 py-2 text-sm rounded ${
                activeTab === "engine"
                  ? "bg-lime-500 text-blackk"
                  : "bg-gray-200"
              }`}
            >
              Engine Details
            </button>
            <button
              onClick={() => setActiveTab("product")}
              className={`px-4 py-2 text-sm rounded ${
                activeTab === "product"
                  ? "bg-lime-500 text-blackk"
                  : "bg-gray-200"
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab("moq")}
              className={`px-4 py-2 text-sm rounded ${
                activeTab === "moq" ? "bg-lime-500 text-blackk" : "bg-gray-200"
              }`}
            >
              MOQ Details
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            {activeTab === "engine" && (
              <div className="grid grid-cols-2 gap-5">
                <div className="mb-4 col-span-2">
                  <label
                    htmlFor="packagingSolutionName"
                    className="block text-sm font-medium text-gray-700 w-[50%]"
                  >
                    Packaging Solution Name
                  </label>
                  <input
                    type="text"
                    id="packagingSolutionName"
                    value={formPackagingSolutions?.name || ""}
                    onChange={(e) =>
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        name: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="structureType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Structure Type
                  </label>
                  <Select
                    styles={customStyle}
                    id="structure_type"
                    options={[
                      {
                        value: "Economical Solution",
                        label: "Economical Solution",
                      },
                      { value: "Advance Solution", label: "Advance Solution" },
                      {
                        value: "Sustainable Solution",
                        label: "Sustainable Solution",
                      },
                    ]}
                    value={
                      formPackagingSolutions?.structure_type
                        ? {
                            label: formPackagingSolutions?.structure_type,
                            value: formPackagingSolutions?.structure_type,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: string;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        structure_type: newValue?.value || "",
                      }));
                    }}
                    placeholder="Select Structure Type"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="storageCondition"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Storage Condition
                  </label>

                  <Select
                    styles={customStyle}
                    id="storageCondition"
                    options={storageConditions.map((condition) => ({
                      value: condition.id,
                      label: condition.name,
                    }))}
                    value={
                      formPackagingSolutions?.storage_condition_id
                        ? {
                            label: storageConditions.find(
                              (condition) =>
                                condition.id ===
                                formPackagingSolutions.storage_condition_id
                            )?.name,
                            value: formPackagingSolutions.storage_condition_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        storage_condition_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Storage Condition"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="sequence"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sequence
                  </label>
                  <input
                    type="number"
                    id="sequence"
                    value={formPackagingSolutions?.sequence}
                    onChange={(e) =>
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        sequence: parseInt(e.target.value, 10),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="displayShelfLife"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Display Shelf Life (Days)
                  </label>
                  <input
                    type="number"
                    id="displayShelfLife"
                    value={formPackagingSolutions?.display_shelf_life_days}
                    onChange={(e) =>
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        display_shelf_life_days: parseInt(e.target.value, 10),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
              </div>
            )}
            {activeTab === "product" && (
              <div className="grid grid-cols-2 gap-5">
                <div className="mb-4">
                  <label
                    htmlFor="product"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product
                  </label>
                  <Select
                    styles={customStyle}
                    id="product"
                    options={products.map((product) => ({
                      value: product.id,
                      label: product.product_name,
                    }))}
                    value={
                      formPackagingSolutions?.product_id
                        ? {
                            label: products.find(
                              (product) =>
                                product.id === formPackagingSolutions.product_id
                            )?.product_name,
                            value: formPackagingSolutions.product_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      handleProductChange(newValue?.value || 0);
                    }}
                    placeholder="Select Product"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="productCategory"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Category
                  </label>
                  <Select
                    styles={customStyle}
                    id="productCategory"
                    options={productCategories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    value={
                      formPackagingSolutions?.product_category_id
                        ? {
                            label: productCategories.find(
                              (category) =>
                                category.id ===
                                formPackagingSolutions.product_category_id
                            )?.name,
                            value: formPackagingSolutions.product_category_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        product_category_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Product Category"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="productForm"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Form
                  </label>
                  <Select
                    styles={customStyle}
                    id="productForm"
                    options={productForms.map((form) => ({
                      value: form.id,
                      label: form.name,
                    }))}
                    value={
                      formPackagingSolutions?.product_form_id
                        ? {
                            label: productForms.find(
                              (form) =>
                                form.id ===
                                formPackagingSolutions.product_form_id
                            )?.name,
                            value: formPackagingSolutions.product_form_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        product_form_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Product Form"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="packagingTreatment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Packaging Treatment
                  </label>
                  <Select
                    styles={customStyle}
                    id="packagingTreatment"
                    options={packagingTreatments.map((treatment) => ({
                      value: treatment.id,
                      label: treatment.name,
                    }))}
                    value={
                      formPackagingSolutions?.packaging_treatment_id
                        ? {
                            label: packagingTreatments.find(
                              (treatment) =>
                                treatment.id ===
                                formPackagingSolutions.packaging_treatment_id
                            )?.name,
                            value:
                              formPackagingSolutions.packaging_treatment_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        packaging_treatment_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Packaging Treatment"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="packingType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Packing Type
                  </label>
                  <Select
                    styles={customStyle}
                    id="packingType"
                    options={packingTypes.map((type) => ({
                      value: type.id,
                      label: type.name,
                    }))}
                    value={
                      formPackagingSolutions?.packing_type_id
                        ? {
                            label: packingTypes.find(
                              (type) =>
                                type.id ===
                                formPackagingSolutions.packing_type_id
                            )?.name,
                            value: formPackagingSolutions.packing_type_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        packing_type_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Packing Type"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="packagingMachine"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Packaging Machine
                  </label>
                  <Select
                    styles={customStyle}
                    id="packagingMachine"
                    options={packagingMachines.map((machine) => ({
                      value: machine.id,
                      label: machine.name,
                    }))}
                    value={
                      formPackagingSolutions?.packaging_machine_id
                        ? {
                            label: packagingMachines.find(
                              (machine) =>
                                machine.id ===
                                formPackagingSolutions.packaging_machine_id
                            )?.name,
                            value: formPackagingSolutions.packaging_machine_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        packaging_machine_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Packaging Machine"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="packagingMaterial"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Packaging Material
                  </label>
                  <Select
                    styles={customStyle}
                    id="packagingMaterial"
                    options={packagingMaterials.map((material) => ({
                      value: material.id,
                      label: material.material_name,
                    }))}
                    value={
                      formPackagingSolutions?.packaging_material_id
                        ? {
                            label: packagingMaterials.find(
                              (material) =>
                                material.id ===
                                formPackagingSolutions.packaging_material_id
                            )?.material_name,
                            value: formPackagingSolutions.packaging_material_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        packaging_material_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Packaging Material"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="productMinWeight"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Minimum Weight
                  </label>
                  <input
                    type="text"
                    id="productMinWeight"
                    value={formPackagingSolutions?.product_min_weight || ""}
                    onChange={(e) =>
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        product_min_weight: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="productMaxWeight"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Maximum Weight
                  </label>
                  <input
                    type="text"
                    id="productMaxWeight"
                    value={formPackagingSolutions?.product_max_weight || ""}
                    onChange={(e) =>
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        product_max_weight: e.target.value,
                      }))
                    }
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
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={BACKEND_MEDIA_LINK + imagePreview}
                      alt="Packaging Solution Preview"
                      className="w-16 h-16 object-cover mb-2"
                    />
                  </div>
                )}
              </div>
            )}
            {activeTab === "moq" && (
              <div className="grid grid-cols-2 gap-5">
                <div className="mb-4">
                  <label
                    htmlFor="minOrderQuantity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    id="minOrderQuantity"
                    value={formPackagingSolutions?.min_order_quantity}
                    onChange={(e) =>
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        min_order_quantity: parseInt(e.target.value, 10),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="minOrderQuantityUnit"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Minimum Order Quantity Unit
                  </label>
                  <Select
                    styles={customStyle}
                    id="minOrderQuantityUnit"
                    options={measurementUnits.map((unit) => ({
                      value: unit.id,
                      label: unit.name,
                    }))}
                    value={
                      formPackagingSolutions?.min_order_quantity_unit_id
                        ? {
                            label: measurementUnits.find(
                              (unit) =>
                                unit.id ===
                                formPackagingSolutions.min_order_quantity_unit_id
                            )?.name,
                            value:
                              formPackagingSolutions.min_order_quantity_unit_id,
                          }
                        : undefined
                    }
                    onChange={(
                      newValue: SingleValue<{
                        label: string | undefined;
                        value: number;
                      }>
                    ) => {
                      setFormPackagingSolutions((prev) => ({
                        ...prev!,
                        min_order_quantity_unit_id: newValue?.value || 0,
                      }));
                    }}
                    placeholder="Select Minimum Order Quantity Unit"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            )}
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
                {type === "edit"
                  ? "Update Packaging Solution"
                  : "Add Packaging Solution"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedPackagingSolutions && (
        <DetailsPopup
          title="Packaging Solutions Details"
          fields={[
            { label: "ID", value: selectedPackagingSolutions.id.toString() },
            {
              label: "Packaging Solution Name",
              value: selectedPackagingSolutions.name,
            },
            {
              label: "Structure Type",
              value: selectedPackagingSolutions.structure_type || "",
            },
            {
              label: "Sequence",
              value: selectedPackagingSolutions.sequence.toString() || "",
            },
            {
              label: "Storage Condition",
              value: selectedPackagingSolutions.storage_condition_name || "",
            },
            {
              label: "Display Shelf Life (Days)",
              value:
                selectedPackagingSolutions.display_shelf_life_days.toString() ||
                "",
            },
            {
              label: "Product",
              value: selectedPackagingSolutions.product_name || "",
            },
            {
              label: "Product Category",
              value: selectedPackagingSolutions.category_name || "",
            },
            {
              label: "Product Form",
              value: selectedPackagingSolutions.product_form_name || "",
            },
            {
              label: "Packaging Treatment",
              value: selectedPackagingSolutions.packaging_treatment_name || "",
            },
            {
              label: "Packaging Type",
              value: selectedPackagingSolutions.packing_type_name || "",
            },
            {
              label: "Packaging Machine",
              value: selectedPackagingSolutions.packaging_machine_name || "",
            },
            {
              label: "Packaging Material",
              value: selectedPackagingSolutions.packaging_material_name || "",
            },
            {
              label: "Product Min Weight",
              value: selectedPackagingSolutions.product_min_weight || "",
            },
            {
              label: "Product Max Weight",
              value: selectedPackagingSolutions.product_max_weight || "",
            },
            {
              label: "Min Order Quantity",
              value:
                selectedPackagingSolutions.min_order_quantity.toString() || "",
            },
            {
              label: "Min Order Quantity Unit",
              value:
                selectedPackagingSolutions.min_order_quantity_unit_name || "",
            },
            {
              label: "Status",
              value:
                selectedPackagingSolutions.status === "active"
                  ? "Active"
                  : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(
                selectedPackagingSolutions.createdAt
              ).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(
                selectedPackagingSolutions.updatedAt
              ).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedPackagingSolutions(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this packaging solution?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default PackagingSolutions;
