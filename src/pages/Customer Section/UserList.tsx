import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput, Tooltip } from "flowbite-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import { FaPlusCircle, FaRegFileExcel } from "react-icons/fa";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import { AiOutlineSearch } from "react-icons/ai";
import AddCreditPopup from "../../components/AddCreditPopup";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import { formatDateTime } from "../../../utils/DateFormatter";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import { customStyle } from "../../../utils/CustomSelectTheme";
import Select from "react-select";
import { useNavigate } from "react-router";
import { BiSearchAlt } from "react-icons/bi";
import ToggleSwitch from "../../components/ToggleSwitch";
import { IoLocationOutline } from "react-icons/io5";
import PaginationComponent from "../../components/PaginatonComponent";

type FilterType = {
  name: string;
  phone_number: string;
  email: string;
  active_subscription?: string;
  user_type?: string;
};
interface CustomerForm {
  code: string;
  country_code: string | null;
  credits: number;
  createdAt: string;
  email: string;
  email_domain: string | null;
  email_verified: number;
  email_verified_at: string | null;
  end_date: string | null;
  firstname: string;
  gst_document_link: string | null;
  gst_number: string | null;
  lastname: string;
  password: string;
  phone_number: string | null;
  referral_code_id: number;
  start_date: string | null;
  subscription_id: number | null;
  subscription_name: string | null;
  updatedAt: string;
  user_id: number;
  block: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Customer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [customerForm, setCustomerForm] = useState<CustomerForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerForm | null>(
    null
  );

  const [isAddCreditPopupOpen, setIsAddCreditPopupOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<{
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    email_domain: string;
    password: string;
    gst_number: string;
    gst_document_link: string;
    phone_number: string;
    country_code: string;
    credits: number;
  }>({
    user_id: 0,
    firstname: "",
    lastname: "",
    email: "",
    email_domain: "",
    password: "",
    gst_number: "",
    gst_document_link: "",
    phone_number: "",
    country_code: "",
    credits: 0,
  });
  const [filter, setFilter] = useState<FilterType>({
    name: "",
    phone_number: "",
    email: "",
    active_subscription: undefined,
    user_type: undefined,
  });
  const userContext = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerForm();
  }, [currentPage, entriesPerPage]);

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Customer Section",
    "can_update"
  );

  const exportPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Customer Section",
    "can_export"
  );

  const fetchCustomerForm = async (type?: string) => {
    try {
      setLoading(true);
      let response;
      if (type === "nofilter") {
        response = await api.get(`${BACKEND_API_KEY}/api/admin/customer/users`, {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        });
      } else {
        response = await api.get(`${BACKEND_API_KEY}/api/admin/customer/users`, {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            name: filter.name,
            phone_number: filter.phone_number,
            email: filter.email,
            active_subscription: filter.active_subscription,
            user_type: filter.user_type,
          },
        });
      }
      setCustomerForm(response?.data?.data.users || []);
      if (response?.data?.data.pagination) {
        setPagination(response?.data?.data.pagination);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const downloadExcelController = async () => {
    toast.loading("Exporting...");
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/customer/users/export`,
        {
          link: BACKEND_MEDIA_LINK,
          name: filter.name,
          phone_number: filter.phone_number,
          email: filter.email,
          active_subscription: filter.active_subscription,
          user_type: filter.user_type,
        },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `users_data_exported_(${formatDateForFilename()}).xlsx`;
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

  const handleAddCredits = (userId: number) => {
    setSelectedUserId(userId);
    setIsAddCreditPopupOpen(true);
  };

  const handleAddCreditsSubmit = async (
    userId: number,
    credits: number,
    description = "Credit Given By Admin"
  ) => {
    try {
      await api.post(`${BACKEND_API_KEY}/api/admin/customer/users/add-credit/${userId}`, {
        credits,
        description,
      });
      fetchCustomerForm();
      setIsAddCreditPopupOpen(false);
    } catch (err) {
      setError("Failed to add credits");
      setIsAddCreditPopupOpen(false);
    }
  };

  const toggleBlockHandler = async (id: string, blockValue: number) => {
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/customer/users/block/${id}`,
        {
          block: blockValue === 1 ? 0 : 1,
        }
      );
      if (response.status === 200) {
        toast.dismiss();
        toast.success("Block Status Updated!");
        setIsFormOpen(false);
        fetchCustomerForm();
      } else {
        toast.error("Failed to update customer");
      }
    } catch (err) {
      toast.error("Failed to update customer");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/customer/users/update/${editingCustomer?.user_id}`,
        {
          ...editingCustomer,
        }
      );
      if (response.status === 200) {
        toast.success("Customer updated successfully");
        setIsFormOpen(false);
        fetchCustomerForm();
      } else {
        toast.error("Failed to update customer");
      }
    } catch (err) {
      toast.error("Failed to update customer");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Customer
      </h1>
      {!isFormOpen && (
        <div className="flex justify-between items-center w-full my-6">
          <EntriesPerPage
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />
          <div className="flex justify-end items-center">
            {exportPermission && (
              <button
                className="bg-green-500 text-white px-3 py-2 rounded block mr-4"
                onClick={downloadExcelController}
              >
                <FaRegFileExcel size={22} />
              </button>
            )}
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded block mr-4"
              onClick={() => {
                setFilterOpen(!filterOpen);
                setFilter({
                  ...filter,
                  email: "",
                  phone_number: "",
                  name: "",
                  active_subscription: undefined,
                  user_type: undefined,
                });
                fetchCustomerForm("nofilter");
                setCurrentPage(1);
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="grid grid-cols-4 gap-4 flex-wrap mb-6 items-end">
          <TextInput
            className="customInput w-full"
            type="text"
            placeholder="Search Name.."
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          />
          <TextInput
            type="text"
            className="customInput w-full"
            placeholder="Search Phone Number.."
            value={filter.phone_number}
            onChange={(e) =>
              setFilter({ ...filter, phone_number: e.target.value })
            }
          />
          <TextInput
            className="customInput w-full"
            type="text"
            placeholder="Search Email.."
            value={filter.email}
            onChange={(e) => setFilter({ ...filter, email: e.target.value })}
          />
          <Select
            styles={customStyle}
            id="subscriptionStatus"
            options={["Active", "Inactive"].map((status) => ({
              value: status,
              label: status,
            }))}
            value={
              filter.active_subscription
                ? {
                    label: filter.active_subscription,
                    value: filter.active_subscription,
                  }
                : undefined
            }
            onChange={(
              selectedOption: { label: string; value: string } | null
            ) => {
              setFilter({
                ...filter,
                active_subscription: selectedOption?.value,
              });
            }}
            placeholder="Select Subscription Status"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <Select
            styles={customStyle}
            id="userType"
            options={["Normal", "Referred"].map((status) => ({
              value: status,
              label: status,
            }))}
            value={
              filter.user_type
                ? {
                    label: filter.user_type,
                    value: filter.user_type,
                  }
                : undefined
            }
            onChange={(
              selectedOption: { label: string; value: string } | null
            ) => {
              setFilter({
                ...filter,
                user_type: selectedOption?.value || undefined,
              });
            }}
            placeholder="Select User Type"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />

          <div className="flex">
            <button
              className="bg-lime-500 text-black px-4 py-2 rounded mr-3"
              onClick={() => {
                fetchCustomerForm();
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
            <ErrorComp error={error} onRetry={fetchCustomerForm} />
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
              <table className="w-full overflow-x-scroll text-sm text-left text-gray-500 dark:text-gray-400">
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
                      Phone No.
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Referal Code
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Active Subscription
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Credits
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Created At
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Block
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerForm.length > 0 ? (
                    customerForm.map((customerForm) => (
                      <tr
                        key={customerForm.user_id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">
                          {customerForm.user_id}
                        </td>
                        <td className="p-4 text-gray-900">
                          {customerForm.firstname} {customerForm.lastname}
                        </td>
                        <td className="p-4 text-gray-900">
                          {customerForm.email}
                        </td>
                        <td className="p-4 text-gray-900">
                          {customerForm.phone_number}
                        </td>
                        <td className="p-4 text-gray-900">
                          {customerForm.code}
                        </td>
                        <td className="p-4 text-gray-900">
                          <Badge
                            className="!inline-block"
                            color={
                              customerForm.subscription_id !== null
                                ? "success"
                                : "failure"
                            }
                          >
                            {customerForm.subscription_id !== null
                              ? "Yes"
                              : "No"}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-900">
                          {customerForm.credits}
                        </td>
                        <td className="p-4 text-gray-900">
                          {new Date(customerForm.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-gray-900">
                          <ToggleSwitch
                            checked={customerForm.block === 1}
                            onChange={() =>
                              toggleBlockHandler(
                                customerForm.user_id.toString(),
                                customerForm.block
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-gray-900 text-right flex justify-end">
                          {updatePermission && (
                            <button
                              onClick={() => {
                                setEditingCustomer({
                                  user_id: customerForm.user_id,
                                  firstname: customerForm.firstname,
                                  lastname: customerForm.lastname,
                                  email: customerForm.email,
                                  email_domain: customerForm.email_domain || "",
                                  password: customerForm.password || "",
                                  gst_number: customerForm.gst_number || "",
                                  gst_document_link:
                                    customerForm.gst_document_link || "",
                                  phone_number: customerForm.phone_number || "",
                                  country_code: customerForm.country_code || "",
                                  credits: customerForm.credits || 0,
                                });
                                setIsFormOpen(true);
                                setFilterOpen(false);
                              }}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-4"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleAddCredits(customerForm.user_id)
                            }
                            className="text-xl text-green-600 dark:text-green-500 hover:underline mr-4"
                            aria-label="Add Credits"
                          >
                            <Tooltip content="Add Credits">
                              <FaPlusCircle />
                            </Tooltip>
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/customer-section/user-address-list?user_id=${customerForm.user_id}`
                              )
                            }
                            className="text-2xl text-purple-600 dark:text-purple-500 hover:underline mr-4"
                            aria-label="Show Addresses"
                          >
                            <Tooltip content="Address">
                              <IoLocationOutline />
                            </Tooltip>
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/customer-section/enquiry?user_id=${customerForm.user_id}`
                              )
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Search History"
                          >
                            <Tooltip content="Search History">
                              <BiSearchAlt />
                            </Tooltip>
                          </button>
                          <button
                            onClick={() => setSelectedCustomer(customerForm)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        No customer found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!error && (
            <p className="my-4 text-sm">
              Showing {customerForm.length} out of {pagination.totalItems}{" "}
              Customer
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
            Update Customer
          </h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-5">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="name"
                value={editingCustomer?.firstname}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    firstname: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="name"
                value={editingCustomer?.lastname}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    lastname: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="name"
                value={editingCustomer?.email}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    email: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="name"
                value={editingCustomer?.phone_number}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    phone_number: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address Domain
              </label>
              <input
                type="email"
                id="name"
                value={editingCustomer?.email_domain}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    email_domain: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="name"
                value={editingCustomer?.password}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    password: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                GST Number
              </label>
              <input
                type="text"
                id="name"
                value={editingCustomer?.gst_number}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    gst_number: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                GST Document Link
              </label>
              <input
                type="text"
                id="name"
                value={editingCustomer?.gst_document_link}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    gst_document_link: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Credits
              </label>
              <input
                type="number"
                id="name"
                value={editingCustomer?.credits}
                onChange={(e) =>
                  setEditingCustomer({
                    ...editingCustomer,
                    credits: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex justify-center mt-4 col-span-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Update Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedCustomer && (
        <DetailsPopup
          title="Customer Details"
          fields={[
            { label: "ID", value: selectedCustomer.user_id?.toString() },
            {
              label: "Name",
              value:
                selectedCustomer.firstname + " " + selectedCustomer.lastname,
            },
            { label: "Email", value: selectedCustomer.email },
            {
              label: "Email Domain",
              value: selectedCustomer.email_domain
                ? selectedCustomer.email_domain
                : "Not provided",
            },
            {
              label: "Phone Number",
              value: selectedCustomer.country_code
                ? selectedCustomer.country_code +
                  " " +
                  selectedCustomer.phone_number
                : "Not provided",
            },
            {
              label: "Referal Code",
              value: selectedCustomer.code
                ? selectedCustomer.code
                : "Not provided",
            },
            {
              label: "GST Number",
              value: selectedCustomer.gst_number
                ? selectedCustomer.gst_number
                : "Not provided",
            },
            { label: "Credits", value: selectedCustomer.credits?.toString() },
            {
              label: "Active Subscription",
              value: selectedCustomer.subscription_id === null ? "No" : "Yes",
            },
            {
              label: "Subscription Name",
              value: selectedCustomer.subscription_name ?? "No Subscription",
            },
            {
              label: "Subscription Start Date",
              value: selectedCustomer.start_date
                ? formatDateTime(new Date(selectedCustomer.start_date))
                : "No Subscription",
            },
            {
              label: "Subscription End Date",
              value: selectedCustomer.end_date
                ? formatDateTime(new Date(selectedCustomer.end_date))
                : "No Subscription",
            },
            {
              label: "Email Verified",
              value: selectedCustomer.email_verified ? "Yes" : "No",
            },
            {
              label: "Email Verified At",
              value: selectedCustomer.email_verified_at
                ? formatDateTime(new Date(selectedCustomer.email_verified_at))
                : "Not Verified",
            },
            {
              label: "GST Document Link",
              value: selectedCustomer.gst_document_link
                ? selectedCustomer.gst_document_link
                : "Not Provided",
            },
            {
              label: "Created At",
              value: formatDateTime(new Date(selectedCustomer.createdAt)),
            },
            {
              label: "Updated At",
              value: formatDateTime(new Date(selectedCustomer.updatedAt)),
            },
          ]}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
      <AddCreditPopup
        isOpen={isAddCreditPopupOpen}
        onClose={() => setIsAddCreditPopupOpen(false)}
        onAddCredits={handleAddCreditsSubmit}
        userId={selectedUserId!}
      />
    </div>
  );
};

export default Customer;
