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
import toast from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { AiOutlineSearch } from "react-icons/ai";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import Select, { SingleValue } from "react-select";
import { customStyle } from "../../../utils/CustomSelectTheme";
import PaginationComponent from "../../components/PaginatonComponent";

interface Product {
  id: number;
  product_name: string;
  category_id: number;
  sub_category_id: number;
  product_form_id: number;
  packaging_treatment_id: number;
  measurement_unit_id: number;
  product_image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Product: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<number | null>(
    null
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [productForms, setProductForms] = useState<any[]>([]);
  const [packagingTreatments, setPackagingTreatments] = useState<any[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedProductFormId, setSelectedProductFormId] = useState("");
  const [selectedPackagingTreatmentId, setSelectedPackagingTreatmentId] =
    useState("");
  const [selectedMeasurementUnitId, setSelectedMeasurementUnitId] =
    useState("");

  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);
  useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filter, setFilter] = useState<{
    categoryId: string;
    subCategoryId: string;
    productName: string;
    productFormId: string;
    packagingTreatmentId: string;
  }>({
    categoryId: "",
    subCategoryId: "",
    productName: "",
    productFormId: "",
    packagingTreatmentId: "",
  });

  const userContext = useUser();

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Product Master",
    "can_update"
  );

  const exportPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Product Master",
    "can_export"
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
    fetchProducts();
    fetchAllData();
  }, [currentPage, entriesPerPage]);

  useEffect(() => {
    filterFieldsByCategory();
  }, [selectedCategoryId]);

  const filterFieldsByCategory = () => {
    if (selectedCategoryId) {
      setFilteredSubCategories(
        subCategories.filter(
          (subCategory) =>
            subCategory.category_id === Number(selectedCategoryId)
        )
      );
    } else {
      setFilteredSubCategories([]);
    }
  };

  const fetchProducts = async (type?: string) => {
    try {
      setLoading(true);
      let response;
      if (type === "filter") {
        setCurrentPage(1);
        response = await api.get(`${BACKEND_API_KEY}/api/admin/product/get-products`, {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            category_id: filter.categoryId,
            sub_category_id: filter.subCategoryId,
            product_form_id: filter.productFormId,
            packaging_treatment_id: filter.packagingTreatmentId,
            productName: filter.productName,
          },
        });
      } else
        response = await api.get(`${BACKEND_API_KEY}/api/admin/product/get-products`, {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            category_id: filter.categoryId,
            sub_category_id: filter.subCategoryId,
            product_form_id: filter.productFormId,
            packaging_treatment_id: filter.packagingTreatmentId,
            productName: filter.productName,
          }
        });
      setProducts(response.data.data.products || []);
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

  const fetchAllData = async () => {
    try {
      const [
        categoriesResponse,
        subCategoriesResponse,
        productFormsResponse,
        packagingTreatmentsResponse,
        measurementUnitsResponse,
      ] = await Promise.all([
        api.get(`${BACKEND_API_KEY}/api/admin/product/categories?pagination=false`),
        api.get(`${BACKEND_API_KEY}/api/admin/product/subcategories?pagination=false`),
        api.get(`${BACKEND_API_KEY}/api/admin/product/product-form?pagination=false`),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/packaging-treatment?pagination=false`
        ),
        api.get(
          `${BACKEND_API_KEY}/api/admin/product/measurement-units?pagination=false`
        ),
      ]);

      setCategories(categoriesResponse.data.data.categories);
      setSubCategories(subCategoriesResponse.data.data.subcategories);
      setProductForms(productFormsResponse.data.data.productForms);
      setPackagingTreatments(
        packagingTreatmentsResponse.data.data.packaging_treatments
      );
      setMeasurementUnits(measurementUnitsResponse.data.data.measurementUnits);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
    }
  };

  const deleteProduct = (id: string) => {
    setProductIdToDelete(Number(id));
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productIdToDelete !== null) {
      const loadingToast = toast.loading("Deleting product...");
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/delete-product/${productIdToDelete}`
        );
        fetchProducts();
        toast.success("Product deleted successfully");
      } catch (err: any) {
        toast.dismiss();
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete");
      } finally {
        toast.dismiss(loadingToast);
        setDeletePopupOpen(false);
        setProductIdToDelete(null);
      }
    }
  };

  const downloadExcelController = async () => {
    toast.loading("Exporting...");
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/product/export-products`,
        {
          category_id: filter.categoryId,
          sub_category_id: filter.subCategoryId,
          product_form_id: filter.productFormId,
          packaging_treatment_id: filter.packagingTreatmentId,
          productName: filter.productName,
          link: BACKEND_MEDIA_LINK,
        },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `products_exported_(${formatDateForFilename()}).xlsx`;
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

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setProductIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setName("");
    setImage(null);
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.product_name);
    setImage(null);
    setStatus(product.status);
    setIsFormOpen(true);
    setImagePreview(product.product_image);
    setSelectedCategoryId(product.category_id.toString());
    setSelectedSubCategoryId(product.sub_category_id.toString());
    setSelectedProductFormId(product.product_form_id.toString());
    setSelectedPackagingTreatmentId(product.packaging_treatment_id.toString());
    setSelectedMeasurementUnitId(product.measurement_unit_id.toString());
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setName("");
    setImage(null);
    setStatus("");
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setSelectedProductFormId("");
    setSelectedPackagingTreatmentId("");
    setSelectedMeasurementUnitId("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving product...");
    try {
      const formData = new FormData();
      formData.append("product_name", name);
      formData.append("status", status);
      formData.append("type", "product");
      formData.append("category_id", selectedCategoryId);
      formData.append("sub_category_id", selectedSubCategoryId);
      formData.append("product_form_id", selectedProductFormId);
      formData.append("packaging_treatment_id", selectedPackagingTreatmentId);
      formData.append("measurement_unit_id", selectedMeasurementUnitId);
      if (image) {
        formData.append("product_image", image);
      }

      if (editingProduct) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/update-product/${editingProduct.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Product updated successfully");
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/add-product`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product added successfully");
      }

      closeForm();
      fetchProducts();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to add");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/product/update-product/${id}`, {
        status: newStatus,
      });
      fetchProducts();
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
        Manage Products
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
                setFilter({
                  ...filter,
                  categoryId: "",
                  subCategoryId: "",
                  packagingTreatmentId: "",
                  productFormId: "",
                  productName: "",
                });
                fetchProducts("nofilter");
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
                onClick={() => {
                  openAddForm();
                  setFilterOpen(false);
                }}
                className="bg-lime-500 text-black px-4 py-2 rounded block ml-auto mr-4"
              >
                Add New Product
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="grid grid-cols-4 gap-4 flex-wrap mb-6">
          <Select
            styles={customStyle}
            id="category"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            value={
              filter.categoryId
                ? {
                    label: categories.find(
                      (category) => category.id === Number(filter.categoryId)
                    )?.name,
                    value: Number(filter.categoryId),
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
                categoryId: newValue?.value?.toString() || "",
              });
            }}
            placeholder="Select Category"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <Select
            styles={customStyle}
            id="subCategoryName"
            options={subCategories
              .filter(
                (subCategory) =>
                  subCategory.category_id === Number(filter.categoryId)
              )
              .map((subCategory) => ({
                value: subCategory.id,
                label: subCategory.name,
              }))}
            value={
              filter.subCategoryId
                ? {
                    label: subCategories.find(
                      (subCategory) =>
                        subCategory.id === Number(filter.subCategoryId)
                    )?.name,
                    value: Number(filter.subCategoryId),
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
                subCategoryId: newValue?.value?.toString() || "",
              });
            }}
            placeholder="Select Sub Category"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <Select
            styles={customStyle}
            id="productFormName"
            options={productForms.map((productForm) => ({
              value: productForm.id,
              label: productForm.name,
            }))}
            value={
              filter.productFormId
                ? {
                    label: productForms.find(
                      (productForm) =>
                        productForm.id === Number(filter.productFormId)
                    )?.name,
                    value: Number(filter.productFormId),
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
                productFormId: newValue?.value?.toString() || "",
              });
            }}
            placeholder="Select Product Form"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <Select
            styles={customStyle}
            id="packagingTreatmentName"
            options={packagingTreatments.map((packagingTreatment) => ({
              value: packagingTreatment.id,
              label: packagingTreatment.name,
            }))}
            value={
              filter.packagingTreatmentId
                ? {
                    label: packagingTreatments.find(
                      (packagingTreatment) =>
                        packagingTreatment.id ===
                        Number(filter.packagingTreatmentId)
                    )?.name,
                    value: Number(filter.packagingTreatmentId),
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
                packagingTreatmentId: newValue?.value?.toString() || "",
              });
            }}
            placeholder="Select Packaging Treatment"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <TextInput
            className="customInput"
            type="text"
            placeholder="Search Product Name.."
            value={filter.productName}
            onChange={(e) =>
              setFilter({ ...filter, productName: e.target.value })
            }
          />
          <div className="flex">
            <button
              className="bg-lime-500 text-black px-4 py-2 rounded"
              onClick={() => fetchProducts("filter")}
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
            <ErrorComp error={error} onRetry={fetchProducts} />
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full overflow-x-auto text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Id
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Sub-Category
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Product Form
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
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">{product.id}</td>
                        <td className="p-4 text-gray-900">
                          {product.product_name}
                        </td>
                        <td className="p-4 text-gray-900">
                          {
                            categories.find(
                              (category) => category.id === product.category_id
                            )?.name
                          }
                        </td>
                        <td className="p-4 text-gray-900">
                          {
                            subCategories.find(
                              (category) =>
                                category.id === product.sub_category_id
                            )?.name
                          }
                        </td>
                        <td className="p-4 text-gray-900">
                          {
                            productForms.find(
                              (category) =>
                                category.id === product.product_form_id
                            )?.name
                          }
                        </td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + product.product_image}
                            alt={product.product_name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={product.status === "active"}
                              onChange={() =>
                                toggleStatus(product.id, product.status)
                              }
                            />
                          </td>
                        )}
                        {!updatePermission && (
                          <td className="p-4 text-gray-900">
                            <Badge
                              className="!inline-block"
                              color={
                                product.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {product.status.charAt(0).toUpperCase() +
                                product.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => {
                                openEditForm(product);
                                setFilterOpen(false);
                              }}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-4"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deleteProduct(product.id.toString())
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
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {products.length} out of {pagination.totalItems} Products
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
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-5">
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
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <Select
                styles={customStyle}
                id="category"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                value={
                  selectedCategoryId
                    ? {
                        label: categories.find(
                          (category) =>
                            category.id === Number(selectedCategoryId)
                        )?.name,
                        value: Number(selectedCategoryId),
                      }
                    : undefined
                }
                onChange={(
                  newValue: SingleValue<{
                    label: string | undefined;
                    value: number;
                  }>
                ) => {
                  setSelectedCategoryId(newValue?.value?.toString() || "");
                }}
                placeholder="Select Category"
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="subCategory"
                className="block text-sm font-medium text-gray-700"
              >
                Sub-Category
              </label>
              <Select
                styles={customStyle}
                id="subCategory"
                options={filteredSubCategories.map((subCategory) => ({
                  value: subCategory.id,
                  label: subCategory.name,
                }))}
                value={
                  selectedSubCategoryId
                    ? {
                        label: filteredSubCategories.find(
                          (subCategory) =>
                            subCategory.id === Number(selectedSubCategoryId)
                        )?.name,
                        value: Number(selectedSubCategoryId),
                      }
                    : undefined
                }
                onChange={(
                  newValue: SingleValue<{
                    label: string | undefined;
                    value: number;
                  }>
                ) => {
                  setSelectedSubCategoryId(newValue?.value?.toString() || "");
                }}
                placeholder="Select Sub-Category"
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
                options={productForms.map((productForm) => ({
                  value: productForm.id,
                  label: productForm.name,
                }))}
                value={
                  selectedProductFormId
                    ? {
                        label: productForms.find(
                          (productForm) =>
                            productForm.id === Number(selectedProductFormId)
                        )?.name,
                        value: Number(selectedProductFormId),
                      }
                    : undefined
                }
                onChange={(
                  newValue: SingleValue<{
                    label: string | undefined;
                    value: number;
                  }>
                ) => {
                  setSelectedProductFormId(newValue?.value?.toString() || "");
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
                  selectedPackagingTreatmentId
                    ? {
                        label: packagingTreatments.find(
                          (treatment) =>
                            treatment.id ===
                            Number(selectedPackagingTreatmentId)
                        )?.name,
                        value: Number(selectedPackagingTreatmentId),
                      }
                    : undefined
                }
                onChange={(
                  newValue: SingleValue<{
                    label: string | undefined;
                    value: number;
                  }>
                ) => {
                  setSelectedPackagingTreatmentId(
                    newValue?.value?.toString() || ""
                  );
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
                htmlFor="measurementUnit"
                className="block text-sm font-medium text-gray-700"
              >
                Measurement Unit
              </label>
              <Select
                styles={customStyle}
                id="measurementUnit"
                options={measurementUnits.map((unit) => ({
                  value: unit.id,
                  label: unit.name,
                }))}
                value={
                  selectedMeasurementUnitId
                    ? {
                        label: measurementUnits.find(
                          (unit) =>
                            unit.id === Number(selectedMeasurementUnitId)
                        )?.name,
                        value: Number(selectedMeasurementUnitId),
                      }
                    : undefined
                }
                onChange={(
                  newValue: SingleValue<{
                    label: string | undefined;
                    value: number;
                  }>
                ) => {
                  setSelectedMeasurementUnitId(
                    newValue?.value?.toString() || ""
                  );
                }}
                placeholder="Select Measurement Unit"
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
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

            {editingProduct && imagePreview && (
              <div className="mb-4">
                <img
                  src={BACKEND_MEDIA_LINK + imagePreview}
                  alt="Product Preview"
                  className="w-16 h-16 object-cover mb-2"
                />
              </div>
            )}
            <div className="flex justify-center mt-4 col-span-2">
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
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedProduct && (
        <DetailsPopup
          title="Product Details"
          fields={[
            { label: "ID", value: selectedProduct.id.toString() },
            { label: "Name", value: selectedProduct.product_name },
            {
              label: "Category",
              value:
                categories.find(
                  (category) => category.id === selectedProduct.category_id
                )?.name || "N/A",
            },
            {
              label: "Sub-Category",
              value:
                subCategories.find(
                  (subCategory) =>
                    subCategory.id === selectedProduct.sub_category_id
                )?.name || "N/A",
            },
            {
              label: "Product Form",
              value:
                productForms.find(
                  (form) => form.id === selectedProduct.product_form_id
                )?.name || "N/A",
            },
            {
              label: "Packaging Treatment",
              value:
                packagingTreatments.find(
                  (treatment) =>
                    treatment.id === selectedProduct.packaging_treatment_id
                )?.name || "N/A",
            },
            {
              label: "Measurement Unit",
              value: (() => {
                const unit = measurementUnits.find(
                  (unit) => unit.id === selectedProduct.measurement_unit_id
                );
                if (unit) {
                  return `${unit.name} (${unit.symbol})`;
                }
                return "N/A";
              })(),
            },
            {
              label: "Image",
              value: (
                <img
                  src={BACKEND_MEDIA_LINK + selectedProduct.product_image}
                  alt={selectedProduct.product_name}
                  className="w-24 h-24 object-cover"
                />
              ),
            },
            {
              label: "Status",
              value:
                selectedProduct.status === "active" ? "Active" : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(selectedProduct.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedProduct.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this product?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Product;
