import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput } from "flowbite-react";
import { MdOutlineRemoveRedEye, MdDeleteOutline } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import ToggleSwitch from "../../components/ToggleSwitch";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import PermissionDialog from "../../components/PermissionDialog";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import PaginationComponent from "../../components/PaginatonComponent";

interface StaffData {
  emailid: string;
  id: number;
  name: string;
  status: string;
  password: string;
  phonenumber: string;
  country_code: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  permissions?: [];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const ADMIN_EMAIL = import.meta.env["VITE_ADMIN_EMAIL"];

const ManageStaff: React.FC = () => {
  const userContext = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [staffForm, setStaffForm] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [staffIdToDelete, setStaffIdToDelete] = useState<number | null>(null);
  const [editStaff, setEditStaff] = useState<StaffData | null>(null);
  const [formData, setFormData] = useState({
    emailid: "",
    id: 0,
    name: "",
    status: "inactive",
    password: "",
    phonenumber: "",
    country_code: "",
    address: "",
    permissions: [],
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [debounceSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filter);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [filter]);

  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_create",
  );

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_update",
  );

  const deletePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_delete",
  );

  useEffect(() => {
    fetchStaffForm();
  }, [currentPage, entriesPerPage, debounceSearch]);

  const fetchStaffForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${BACKEND_API_KEY}/api/admin/staff/get-all-staff`, {
        params: {
          page: currentPage,
          limit: entriesPerPage,
          search: debounceSearch,
        },
      });

      setStaffForm(response.data.data.admins || []);

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

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`${BACKEND_API_KEY}/api/admin/staff/${staffIdToDelete}`);
      fetchStaffForm();
    } catch (err) {
      setError("Failed to delete staff");
    }
    setDeletePopupOpen(false);
    setStaffIdToDelete(null);
  };

  const handleToggleStatus = async (staffId: number, staffStatus: string) => {
    try {
      await api.put(`${BACKEND_API_KEY}/staff/${staffId}`, {
        status: staffStatus === "active" ? "inactive" : "active",
      });
      fetchStaffForm();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userContext?.user?.email !== ADMIN_EMAIL) {
      toast.error("Only the admin can add or update staff details.");
      return;
    }

    const dataToSend = { ...formData };

    try {
      if (editStaff) {
        console.log("Updating staff:", dataToSend);
        await api.put(`${BACKEND_API_KEY}/api/admin/staff/${editStaff.id}`, dataToSend);
        toast.success("Staff updated successfully");
      } else {
        console.log("Adding new staff:", dataToSend);
        await api.post(`${BACKEND_API_KEY}/staff/add`, dataToSend);
        toast.success("Staff added successfully");
      }

      fetchStaffForm();
      setIsFormOpen(false);
      setEditStaff(null);
      resetFormData();
    } catch (err) {
      console.error("Error saving staff:", err);
      setError("Failed to save staff");
    }
  };

  const resetFormData = () => {
    setFormData({
      emailid: "",
      id: 0,
      name: "",
      status: "inactive",
      password: "",
      phonenumber: "",
      country_code: "",
      address: "",
      permissions: [],
    });
  };

  const handleEditStaff = (staff: StaffData) => {
    const { password, ...staffWithoutPassword } = staff;
    setEditStaff(staff);
    setFormData({
      ...staffWithoutPassword,
      password: "",
      permissions: staff.permissions || [],
    });
    setIsFormOpen(true);
  };

  const handleAddNewAdmin = () => {
    if (userContext?.user?.email !== ADMIN_EMAIL) {
      setError("Only the admin can add new staff.");
      return;
    }
    setEditStaff(null);
    setFormData({
      emailid: "",
      id: 0,
      name: "",
      status: "inactive",
      password: "",
      phonenumber: "",
      country_code: "",
      address: "",
      permissions: [],
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (staffId: number) => {
    setStaffIdToDelete(staffId);
    setDeletePopupOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Staff
      </h1>

      {!isFormOpen && (
        <div className="flex justify-between items-center w-full my-6">
          <EntriesPerPage
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />
          <div className="flex justify-end items-center">
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded block mr-4"
              onClick={() => {
                setFilterOpen(!filterOpen);
                setFilter("");
                fetchStaffForm();
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
            {userContext?.user?.email === ADMIN_EMAIL && createPermission && (
              <button
                onClick={handleAddNewAdmin}
                className="bg-lime-500 text-black px-4 py-2 rounded block mr-4"
              >
                Add New Staff
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="flex justify-start items-start mb-6 flex-col">
          <label htmlFor="search" className="text-sm mb-1 font-medium">
            Search Name and Email Address..
          </label>
          <TextInput
            id="search"
            type="text"
            className="customInput w-[25%]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
            <ErrorComp error={error} onRetry={fetchStaffForm} />
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
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
                      Email Address
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
                  {staffForm.length > 0 ? (
                    staffForm.map((staff) => (
                      <tr
                        key={staff.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">{staff.id}</td>
                        <td className="p-4 text-gray-900">{staff.name}</td>
                        <td className="p-4 text-gray-900">{staff.emailid}</td>
                        <td className="p-4 text-gray-900">
                          {staff.emailid === ADMIN_EMAIL ? (
                            <Badge className="!inline-block" color="success">
                              Active
                            </Badge>
                          ) : userContext?.user?.email === ADMIN_EMAIL ? (
                            <ToggleSwitch
                              checked={staff.status === "active"}
                              onChange={() =>
                                handleToggleStatus(staff.id, staff.status)
                              }
                            />
                          ) : (
                            <Badge
                              className="!inline-block"
                              color={
                                staff.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {staff.status.charAt(0).toUpperCase() +
                                staff.status.slice(1)}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() => setSelectedStaff(staff)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => handleEditStaff(staff)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission &&
                            staff.emailid !== ADMIN_EMAIL && (
                              <button
                                onClick={() => handleDeleteClick(staff.id)}
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
                        No staff found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {staffForm.length} out of {pagination.totalItems} Staff
            </p>
          )}
          <PaginationComponent
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={pagination}
          />
        </>
      )}
      {selectedStaff && (
        <DetailsPopup
          title="Staff Details"
          fields={[
            { label: "ID", value: selectedStaff.id.toString() },
            { label: "Name", value: selectedStaff.name },
            { label: "Email", value: selectedStaff.emailid },
            { label: "Phone Number", value: selectedStaff.phonenumber },
            { label: "Country Code", value: selectedStaff.country_code },
            { label: "Address", value: selectedStaff.address },
            {
              label: "Status",
              value: selectedStaff.status === "active" ? "Active" : "Inactive",
            },
          ]}
          onClose={() => setSelectedStaff(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this staff?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletePopupOpen(false)}
        />
      )}
      {isFormOpen && (
        <div className="mw-[60%] flex justify-center items-center flex-col mx-auto my-10">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-8">
            {editStaff ? "Edit Staff" : "Add New Staff"}
          </h3>
          <form
            onSubmit={handleFormSubmit}
            className="w-[60%] grid grid-cols-2 gap-4"
          >
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="emailid"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="emailid"
                name="emailid"
                value={formData.emailid}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="phonenumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="number"
                id="phonenumber"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="countryCode"
                className="block text-sm font-medium text-gray-700"
              >
                Country Code
              </label>
              <input
                type="text"
                id="countryCode"
                name="country_code"
                value={formData.country_code}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="flex justify-end mt-4 col-span-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                }}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                {editStaff ? "Update Staff" : "Add Staff"}
              </button>
            </div>
          </form>
          <hr className="w-full my-8" />
          {ADMIN_EMAIL === userContext?.user?.email &&
            ADMIN_EMAIL !== editStaff?.emailid &&
            editStaff && <PermissionDialog id={editStaff?.id || 0} />}
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
