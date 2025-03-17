import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput } from "flowbite-react";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { toast } from "react-hot-toast";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { useUser } from "../../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { customStyle } from "../../../utils/CustomSelectTheme";
import Select, { ActionMeta, SingleValue } from "react-select";
import PaginationComponent from "../../components/PaginatonComponent";
interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  image: string;
  status: string;
  category_name: string;
  createdAt: string;
  updatedAt: string;
  sequence: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const SubCategoryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [status, setStatus] = useState("");
  const [sequence, setSequence] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubCategory | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [subCategoryIdToDelete, setSubCategoryIdToDelete] = useState<
    number | null
  >(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<
    string | undefined
  >("");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
    }, 350);
    setCurrentPage(1);
    return () => {
      clearTimeout(handler);
    };
  }, [titleFilter]);

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
    fetchSubCategories();
    fetchCategories();
  }, [
    currentPage,
    entriesPerPage,
    debouncedTitleFilter,
    selectedFilterCategory,
  ]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/subcategories`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            search: debouncedTitleFilter,
            category_id: selectedFilterCategory,
          },
        }
      );
      setSubCategories(response.data.data.subcategories || []);
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

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/product/categories?pagination=false`
      );
      setCategories(response.data.data.categories || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
    }
  };

  const deleteSubCategory = (id: number) => {
    setSubCategoryIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (subCategoryIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/subcategories/${subCategoryIdToDelete}`
        );
        fetchSubCategories();
        toast.success("Subcategory deleted successfully!");
      } catch (err: any) {
        if (err?.response && err?.response?.data) {
          toast.error(err?.response?.data?.message);
        } else toast.error("Failed to delete subcategory");
      }
      setDeletePopupOpen(false);
      setSubCategoryIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setSubCategoryIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingSubCategory(null);
    setName("");
    setImage(null);
    setImagePreview("");
    setStatus("active");
    setCategoryId(null);
    setSequence(null);
    setIsFormOpen(true);
    setFilterOpen(false);
  };

  const openEditForm = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setName(subCategory.name);
    setImage(null);
    setImagePreview(subCategory.image);
    setStatus(subCategory.status);
    setCategoryId(subCategory.category_id);
    setIsFormOpen(true);
    setSequence(subCategory.sequence);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSubCategory(null);
    setName("");
    setImage(null);
    setImagePreview("");
    setStatus("");
    setCategoryId(null);
    setSequence(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("status", status);
      formData.append("sequence", sequence?.toString() || "0");
      if (categoryId !== null) {
        formData.append("category_id", categoryId.toString());
      }
      formData.append("type", "subcategories");
      if (image) {
        formData.append("image", image);
      }

      if (editingSubCategory) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/product/subcategories/${editingSubCategory.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Subcategory updated successfully!");
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/product/subcategories`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Subcategory added successfully!");
      }

      closeForm();
      fetchSubCategories();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to save subcategory");
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/product/subcategories/${id}`, {
        status: newStatus,
      });
      fetchSubCategories();
    } catch (err: any) {
      toast.dismiss();
      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Subcategories
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
                setSelectedFilterCategory("");
                setCurrentPage(1);
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
            {createPermission && (
              <button
                onClick={openAddForm}
                className="bg-lime-500 text-black px-4 py-2 rounded block mr-4"
              >
                Add New Subcategory
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="grid grid-cols-4 mb-6 gap-4">
          <Select
            styles={customStyle}
            id="category_id"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            value={
              selectedFilterCategory
                ? {
                    label: categories.find(
                      (category) =>
                        category.id === Number(selectedFilterCategory)
                    )?.name,
                    value: Number(selectedFilterCategory),
                  }
                : undefined
            }
            onChange={(
              newValue: SingleValue<{
                label: string | undefined;
                value: number;
              }>,
              _actionMeta: ActionMeta<{
                label: string | undefined;
                value: number;
              }>
            ) => {
              setSelectedFilterCategory(
                newValue?.value?.toString() || undefined
              );
              setCurrentPage(1);
            }}
            placeholder="Select Category"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <TextInput
            className="customInput"
            type="text"
            placeholder="Search name here.."
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
            <ErrorComp error={error} onRetry={fetchSubCategories} />
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
                      Category
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
                  {subCategories.length > 0 ? (
                    subCategories.map((subCategory) => (
                      <tr
                        key={subCategory.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">{subCategory.id}</td>
                        <td className="p-4 text-gray-900">
                          {subCategory.name}
                        </td>
                        <td className="p-4 text-gray-900">
                          <img
                            src={BACKEND_MEDIA_LINK + subCategory.image}
                            alt={subCategory.name}
                            className="w-20 h-20 object-cover"
                          />
                        </td>
                        <td className="p-4 text-gray-900">
                          {subCategory.category_name}
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={subCategory.status === "active"}
                              onChange={() =>
                                toggleStatus(subCategory.id, subCategory.status)
                              }
                            />
                          </td>
                        )}
                        {!updatePermission && (
                          <td className="px-6 py-4 text-gray-900 flex">
                            <Badge
                              className="!inline-block"
                              color={
                                subCategory.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {subCategory.status.charAt(0).toUpperCase() +
                                subCategory.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() => setSelectedSubcategory(subCategory)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => {
                                openEditForm(subCategory);
                                setFilterOpen(false);
                              }}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() => deleteSubCategory(subCategory.id)}
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
                        No subcategories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {subCategories.length} out of {pagination.totalItems}{" "}
              Subcategories
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
            {editingSubCategory ? "Edit Subcategory" : "Add New Subcategory"}
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
            {editingSubCategory && imagePreview && (
              <div className="mb-4">
                <img
                  src={BACKEND_MEDIA_LINK + imagePreview}
                  alt="Subcategory Preview"
                  className="w-16 h-16 object-cover mb-2"
                />
              </div>
            )}
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <Select
                styles={customStyle}
                id="category_id"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                value={
                  categoryId
                    ? {
                        label: categories.find(
                          (category) => category.id == Number(categoryId)
                        )?.name,
                        value: Number(categoryId),
                      }
                    : undefined
                }
                onChange={(
                  newValue: SingleValue<{
                    label: string | undefined;
                    value: number;
                  }>,
                  _actionMeta: ActionMeta<{
                    label: string | undefined;
                    value: number;
                  }>
                ) => {
                  setCategoryId(newValue?.value || null);
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
                htmlFor="sequence"
                className="block text-sm font-medium text-gray-700"
              >
                Sequence
              </label>
              <input
                type="number"
                id="sequence"
                value={sequence || ""}
                onChange={(e) => setSequence(Number(e.target.value))}
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
                {editingSubCategory ? "Update Subcategory" : "Add Subcategory"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedSubcategory && (
        <DetailsPopup
          title="Subcategory Details"
          fields={[
            { label: "ID", value: selectedSubcategory.id.toString() },
            { label: "Subcategory Name", value: selectedSubcategory.name },
            {
              label: "Image",
              value: (
                <img
                  src={BACKEND_MEDIA_LINK + selectedSubcategory.image}
                  alt={selectedSubcategory.name}
                  className="w-24 h-24 object-cover"
                />
              ),
            },
            {
              label: "Category",
              value: selectedSubcategory.category_name,
            },
            {
              label: "Status",
              value:
                selectedSubcategory.status === "active" ? "Active" : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(selectedSubcategory.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedSubcategory.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedSubcategory(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this subcategory?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default SubCategoryPage;
