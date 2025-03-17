import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput } from "flowbite-react";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import toast from "react-hot-toast";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import PaginationComponent from "../../components/PaginatonComponent";

interface Category {
  id: number;
  name: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sequence: number;
  unselected: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const CategoryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [sequence, setSequence] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [unselectedImage, setUnselectedImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [unselectedPreview, setUnSelectedPreview] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<number | null>(
    null
  );
  const [filterOpen, setFilterOpen] = useState(false);

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

  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [titleFilter]);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, entriesPerPage, debouncedTitleFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${BACKEND_API_KEY}/api/admin/product/categories`, {
        params: {
          page: currentPage,
          limit: entriesPerPage,
          search: debouncedTitleFilter,
        },
      });
      setCategories(response.data.data.categories || []);
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

  const deleteCategory = (id: string) => {
    setCategoryIdToDelete(Number(id));
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryIdToDelete !== null) {
      const loadingToast = toast.loading("Deleting category...");
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/categories/${categoryIdToDelete}`
        );
        fetchCategories();
        toast.success("Category deleted successfully");
      } catch (err: any) {
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete category");
      } finally {
        toast.dismiss(loadingToast);
        setDeletePopupOpen(false);
        setCategoryIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setCategoryIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingCategory(null);
    setName("");
    setImage(null);
    setStatus("active");
    setIsFormOpen(true);
    setFilterOpen(false);
    setSequence(null);
    setUnselectedImage(null);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setImage(null);
    setStatus(category.status);
    setIsFormOpen(true);
    setImagePreview(category.image);
    setFilterOpen(false);
    setSequence(category.sequence);
    setUnselectedImage(null);
    setUnSelectedPreview(category.unselected);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setName("");
    setImage(null);
    setStatus("");
    setSequence(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving category...");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("status", status);
      formData.append("sequence", sequence?.toString() || "0");
      formData.append("type", "categories");

      if (unselectedImage) {
        formData.append("unselected", unselectedImage);
      }
      if (image) {
        formData.append("image", image);
      }

      if (editingCategory) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/categories/${editingCategory.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Category updated successfully");
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/categories`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Category added successfully");
      }

      closeForm();
      fetchCategories();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to save category");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/product/categories/${id}`, {
        status: newStatus,
      });
      fetchCategories();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Categories
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
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
            {createPermission && (
              <button
                onClick={openAddForm}
                className="bg-lime-500 text-black px-4 py-2 rounded block mr-4"
              >
                Add New Category
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="flex justify-start items-start mb-6 flex-col">
          <label htmlFor="search" className="text-sm mb-1 font-medium">
            Search Name Here..
          </label>
          <TextInput
            id="search"
            type="text"
            className="customInput w-[25%] mb-4"
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
            <ErrorComp error={error} onRetry={fetchCategories} />
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
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <tr
                        key={category.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">{category.id}</td>
                        <td className="p-4 text-gray-900">{category.name}</td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + category.image}
                            alt={category.name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={category.status === "active"}
                              onChange={() =>
                                toggleStatus(category.id, category.status)
                              }
                            />
                          </td>
                        )}
                        {!updatePermission && (
                          <td className="p-4 text-gray-900">
                            <Badge
                              className="!inline-block"
                              color={
                                category.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {category.status.charAt(0).toUpperCase() +
                                category.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() => setSelectedCategory(category)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(category)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-4"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() =>
                                deleteCategory(category.id.toString())
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
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {categories.length} out of {pagination.totalItems}{" "}
              Categories
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
        <div className="w-[90%] mx-auto my-10">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <TextInput
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 customInput"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="sequence"
                className="block text-sm font-medium text-gray-700"
              >
                Sequence
              </label>
              <TextInput
                type="number"
                id="sequence"
                value={sequence?.toString()}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 customInput"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="unselectedimage"
                className="block text-sm font-medium text-gray-700"
              >
                Unselected Image
              </label>
              <input
                type="file"
                id="unselectedimage"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    setUnselectedImage(file as File | null);
                  } else {
                    setUnselectedImage(null);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              {editingCategory && imagePreview && (
                <img
                  src={BACKEND_MEDIA_LINK + imagePreview}
                  alt="Category Preview"
                  className="w-16 h-16 object-cover mb-2"
                />
              )}
            </div>

            <div className="mb-4">
              {editingCategory && unselectedPreview && (
                <img
                  src={BACKEND_MEDIA_LINK + unselectedPreview}
                  alt="Category Preview"
                  className="w-16 h-16 object-cover mb-2"
                />
              )}
            </div>

            <div className="flex justify-end items-center mt-4 grid-cols-2">
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
                {editingCategory ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedCategory && (
        <DetailsPopup
          title="Category Details"
          fields={[
            { label: "ID", value: selectedCategory.id.toString() },
            { label: "Name", value: selectedCategory.name },
            {
              label: "Image",
              value: (
                <img
                  src={BACKEND_MEDIA_LINK + selectedCategory.image}
                  alt={selectedCategory.name}
                  className="w-24 h-24 object-cover"
                />
              ),
            },
            {
              label: "Status",
              value:
                selectedCategory.status === "active" ? "Active" : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(selectedCategory.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedCategory.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedCategory(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this category?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default CategoryPage;
