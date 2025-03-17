import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Spinner, TextInput } from "flowbite-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import { FaRegFileExcel } from "react-icons/fa";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import { formatDateTime } from "../../../utils/DateFormatter";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import { AiOutlineSearch } from "react-icons/ai";
import Select from "react-select";
import { customStyle } from "../../../utils/CustomSelectTheme";
import toast from "react-hot-toast";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import PaginationComponent from "../../components/PaginatonComponent";

interface ReferForm {
  id: number;
  referral_code_id: number;
  referred_user_id: number;
  account_created: number;
  subscription_completed: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  referred_firstname: string;
  referred_lastname: string;
  referred_email: string;
  referrer_firstname: string;
  referrer_lastname: string;
  referrer_email: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Refer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [referForm, setReferForm] = useState<ReferForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedRefer, setSelectedRefer] = useState<ReferForm | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    from_date: string | undefined;
    to_date: string | undefined;
    name: string | undefined;
    signup_done: string | undefined;
    subscription_done: string | undefined;
    redeem_done: string | undefined;
  }>({
    from_date: undefined,
    to_date: undefined,
    name: undefined,
    signup_done: undefined,
    subscription_done: undefined,
    redeem_done: undefined,
  });
  useEffect(() => {
    fetchReferForm();
  }, [currentPage, entriesPerPage]);

  const userContext = useUser();

  const exportPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Customer Section",
    "can_export"
  );
  const fetchReferForm = async (type?: string) => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
      };
      if (type !== "nofilter") {
        params.from_date = filterOptions.from_date;
        params.to_date = filterOptions.to_date;
        params.name = filterOptions.name;
        params.signup_done = filterOptions.signup_done;
        params.subscription_done = filterOptions.subscription_done;
        params.redeem_done = filterOptions.redeem_done;
      }
      const response = await api.get(`${BACKEND_API_KEY}/api/admin/customer/referrals`, {
        params,
      });
      setReferForm(response.data.data.referrals || []);
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

  const downloadExcelController = async () => {
    toast.loading("Exporting...");
    try {
      const response = await api.post(
        `${BACKEND_API_KEY}/api/admin/customer/referrals/export`,
        {
          from_date: filterOptions.from_date,
          to_date: filterOptions.to_date,
          name: filterOptions.name,
          signup_done: filterOptions.signup_done,
          subscription_done: filterOptions.subscription_done,
          redeem_done: filterOptions.redeem_done,
        },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `referrals_data_exported_(${formatDateForFilename()}).xlsx`;
      link.setAttribute("download", title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success("Exported successfully");
    } catch (err: any) {
      console.log(err);
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Refer
      </h1>
      <>
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
                setFilterOptions({
                  ...filterOptions,
                  from_date: "",
                  to_date: "",
                  name: "",
                  signup_done: "",
                  subscription_done: "",
                  redeem_done: "",
                });
                fetchReferForm("nofilter");
                setCurrentPage(1);
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
          </div>
        </div>
        {filterOpen && (
          <div className="grid grid-cols-4 gap-4 flex-wrap mb-6 items-end">
            <div>
              <label htmlFor="signupdone" className="text-xs font-medium mb-1">
                Account Created
              </label>
              <Select
                styles={customStyle}
                name="signupStatus"
                id="signupdone"
                options={["Completed", "Incompleted"].map((status) => ({
                  value: status,
                  label: status,
                }))}
                value={
                  filterOptions.signup_done
                    ? {
                        label: filterOptions.signup_done,
                        value: filterOptions.signup_done,
                      }
                    : null
                }
                onChange={(
                  selectedOption: { label: string; value: string } | null
                ) => {
                  setFilterOptions({
                    ...filterOptions,
                    signup_done: selectedOption?.value,
                  });
                }}
                placeholder="Select Signup Status"
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label
                htmlFor="subscriptiondone"
                className="text-xs font-medium mb-1"
              >
                Subscription Task
              </label>
              <Select
                styles={customStyle}
                name="subscriptionStatus"
                id="subscriptiondone"
                options={["Completed", "Incompleted"].map((status) => ({
                  value: status,
                  label: status,
                }))}
                value={
                  filterOptions.subscription_done
                    ? {
                        label: filterOptions.subscription_done,
                        value: filterOptions.subscription_done,
                      }
                    : null
                }
                onChange={(
                  selectedOption: { label: string; value: string } | null
                ) => {
                  setFilterOptions({
                    ...filterOptions,
                    subscription_done: selectedOption?.value,
                  });
                }}
                placeholder="Select Subscription Status"
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label htmlFor="redeemdone" className="text-xs font-medium mb-1">
                Redeem Done
              </label>
              <Select
                styles={customStyle}
                name="redeemStatus"
                id="redeemdone"
                options={["Completed", "Incompleted"].map((status) => ({
                  value: status,
                  label: status,
                }))}
                value={
                  filterOptions.redeem_done
                    ? {
                        label: filterOptions.redeem_done,
                        value: filterOptions.redeem_done,
                      }
                    : null
                }
                onChange={(
                  selectedOption: { label: string; value: string } | null
                ) => {
                  setFilterOptions({
                    ...filterOptions,
                    redeem_done: selectedOption?.value,
                  });
                }}
                placeholder="Select Redeem Status"
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label htmlFor="username" className="text-xs font-medium mb-1">
                Username
              </label>
              <TextInput
                className="customInput"
                value={filterOptions.name}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="from_date" className="text-xs font-medium mb-1">
                From Date
              </label>
              <TextInput
                className="customInput"
                type="date"
                value={filterOptions.from_date}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    from_date: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="to_date" className="text-xs font-medium mb-1">
                To Date
              </label>
              <TextInput
                className="customInput"
                type="date"
                value={filterOptions.to_date}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    to_date: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex">
              <button
                className="bg-lime-500 text-black px-4 py-2 rounded mr-3"
                onClick={() => {
                  fetchReferForm();
                  setCurrentPage(1);
                }}
              >
                <AiOutlineSearch size={22} />
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <ErrorComp error={error} onRetry={fetchReferForm} />
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Referred Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Referred Email
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Referrer Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Created At
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {referForm.length > 0 ? (
                  referForm.map((refer) => (
                    <tr
                      key={refer.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="p-4 text-gray-900">{refer.id}</td>
                      <td className="p-4 text-gray-900">
                        {refer.referred_firstname} {refer.referred_lastname}
                      </td>
                      <td className="p-4 text-gray-900">
                        {refer.referred_email}
                      </td>
                      <td className="p-4 text-gray-900">
                        {refer.referrer_firstname} {refer.referrer_lastname}
                      </td>
                      <td className="p-4 text-gray-900">{refer.code}</td>
                      <td className="p-4 text-gray-900">
                        {formatDateTime(new Date(refer.createdAt))}
                      </td>
                      <td className="px-6 py-4 text-gray-900 flex">
                        <button
                          onClick={() => setSelectedRefer(refer)}
                          className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
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
                      No refer found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!error && (
          <p className="my-4 text-sm">
            Showing {referForm.length} out of {pagination.totalItems} Refer
          </p>
        )}
        <PaginationComponent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagination={pagination}
        />
      </>
      {selectedRefer && (
        <DetailsPopup
          title="Refer Details"
          fields={[
            { label: "ID", value: selectedRefer.id?.toString() },
            {
              label: "Referred Name",
              value:
                selectedRefer.referred_firstname +
                " " +
                selectedRefer.referred_lastname,
            },
            { label: "Referred Email", value: selectedRefer.referred_email },
            {
              label: "Referrer Name",
              value:
                selectedRefer.referrer_firstname +
                " " +
                selectedRefer.referrer_lastname,
            },
            { label: "Referrer Email", value: selectedRefer.referrer_email },
            { label: "Referral Code", value: selectedRefer.code },
            {
              label: "Account Created",
              value: selectedRefer.account_created
                ? "Completed"
                : "Not Completed",
            },
            {
              label: "Subscription Status",
              value: selectedRefer.subscription_completed
                ? "Completed"
                : "Not Completed",
            },
            {
              label: "Redemption Status",
              value: selectedRefer.subscription_completed
                ? "Completed"
                : "Not Completed",
            },
            {
              label: "Created At",
              value: formatDateTime(new Date(selectedRefer.createdAt)),
            },
            {
              label: "Updated At",
              value: formatDateTime(new Date(selectedRefer.updatedAt)),
            },
          ]}
          onClose={() => setSelectedRefer(null)}
        />
      )}
    </div>
  );
};

export default Refer;
