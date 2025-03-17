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

interface ProductForm {
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

const ProductForm: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [productForm, setProductForm] = useState<ProductForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductForm, setEditingProductForm] =
    useState<ProductForm | null>(null);
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
  const [selectedProductForm, setSelectedProductForm] =
    useState<ProductForm | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<number | null>(
    null
  );

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
    fetchProductForm();
  }, [currentPage, entriesPerPage]);

  const fetchProductForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/product-form`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        }
      );
      setProductForm(response.data.data.productForms || []);
      if (response.data.data.pagination) {
        setPagination(response.data.data.pagination);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
      setProductForm([]);
    }
  };

  const deleteProductForm = async (id: number) => {
    setProductIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/product-form/${productIdToDelete}`
        );
        fetchProductForm();
      } catch (err) {
        setError("Failed to delete product form");
      }
      setDeletePopupOpen(false);
      setProductIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setProductIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingProductForm(null);
    setName("");
    setImage(null);
    setImagePreview("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (productForm: ProductForm) => {
    setEditingProductForm(productForm);
    setName(productForm.name);
    setImage(null);
    setImagePreview(productForm.image);
    setStatus(productForm.status);
    setShortDescription(productForm.short_description);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProductForm(null);
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
      formData.append("type", "productform");
      if (image) {
        formData.append("image", image);
      }

      if (editingProductForm) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/product-form/${editingProductForm.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/product-form`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      closeForm();
      fetchProductForm();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to save product form");
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/product/product-form/${id}`, {
        status: newStatus,
      });
      fetchProductForm();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update product form");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Product Form
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
              Add New Product Form
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
            <ErrorComp error={error} onRetry={fetchProductForm} />
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
                  {productForm.length > 0 ? (
                    productForm.map((productForm) => (
                      <tr
                        key={productForm.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">{productForm.id}</td>
                        <td className="p-4 text-gray-900">
                          {productForm.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          {productForm.short_description}
                        </td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + productForm.image}
                            alt={productForm.name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={productForm.status === "active"}
                              onChange={() =>
                                toggleStatus(productForm.id, productForm.status)
                              }
                            />
                          </td>
                        )}
                        {!updatePermission && (
                          <td className="p-4 text-gray-900">
                            <Badge
                              className="!inline-block"
                              color={
                                productForm.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {productForm.status.charAt(0).toUpperCase() +
                                productForm.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() => setSelectedProductForm(productForm)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(productForm)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() => deleteProductForm(productForm.id)}
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
                        No product form found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {productForm.length} out of {pagination.totalItems}{" "}
              Product Form
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
            {editingProductForm ? "Edit Product Form" : "Add New Product Form"}
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
            {editingProductForm && imagePreview && (
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
                {editingProductForm
                  ? "Update Product Form"
                  : "Add Product Form"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedProductForm && (
        <DetailsPopup
          title="Product Form Details"
          fields={[
            { label: "ID", value: selectedProductForm.id.toString() },
            { label: "Name", value: selectedProductForm.name },
            {
              label: "Description",
              value: selectedProductForm.short_description,
            },
            {
              label: "Image",
              value: (
                <img
                  src={BACKEND_MEDIA_LINK + selectedProductForm.image}
                  alt={selectedProductForm.name}
                  className="w-24 h-24 object-cover"
                />
              ),
            },
            {
              label: "Status",
              value:
                selectedProductForm.status === "active" ? "Active" : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(selectedProductForm.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedProductForm.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedProductForm(null)}
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

export default ProductForm;
