import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Button, Spinner, Textarea } from "flowbite-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import { AiOutlineClose } from "react-icons/ai";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import { formatDateTime } from "../../../utils/DateFormatter";
import { customStyle } from "../../../utils/CustomSelectTheme";
import Select from "react-select";
import PaginationComponent from "../../components/PaginatonComponent";

interface ReferForm {
  id: number;
  referral_id: number;
  description: string | null;
  redeem_status: number;
  redeem_requested_at: string;
  createdAt: string;
  updatedAt: string;
  referral_code: string;
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

const RedeemRefer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [referForm, setRedeemRequest] = useState<ReferForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedRefer, setSelectedRefer] = useState<ReferForm | null>(null);
  const [redeemDescription, setRedeemDescription] = useState<string>("");
  const [isRedeemPopupOpen, setRedeemPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSelected, setFilterSelected] = useState<string | undefined>();

  useEffect(() => {
    fetchReferForm();
  }, [currentPage, entriesPerPage, filterSelected]);

  const fetchReferForm = async () => {
    try {
      setLoading(true);

      const params: { page: number; limit: number; redeem_status?: string } = {
        page: currentPage,
        limit: entriesPerPage,
      };

      if (filterSelected) {
        params.redeem_status = filterSelected;
      }

      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/customer/redeem-requests`,
        { params }
      );

      setRedeemRequest(response.data.data.redeemRequest || []);
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

  const handleRedeem = async (id: number) => {
    try {
      await api.post(`${BACKEND_API_KEY}/customer/redeem-requests/${id}`, {
        redeem_status: true,
        description: redeemDescription,
      });
      setRedeemPopupOpen(false);
      setRedeemDescription("");
      fetchReferForm();
      setSelectedRefer(null);
    } catch (err) {
      setError("Failed to redeem refer");
    }
  };

  const handleCancelRedeem = () => {
    setRedeemPopupOpen(false);
    setSelectedRefer(null);
    setRedeemDescription("");
  };

  return (
    <section className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Redeem Refer
      </h1>
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
              fetchReferForm();
              setCurrentPage(1);
            }}
          >
            {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
          </button>
        </div>
      </div>
      {filterOpen && (
        <div className="flex flex-col ml-auto w-[25%] mr-6">
          <Select
            styles={customStyle}
            name="redeemStatus"
            id="redeem-status"
            options={["Completed", "Incompleted"].map((status) => ({
              value: status,
              label: status,
            }))}
            value={
              filterSelected
                ? { label: filterSelected, value: filterSelected }
                : null
            }
            onChange={(
              selectedOption: { label: string; value: string } | null
            ) => {
              setFilterSelected(selectedOption?.value);
              setCurrentPage(1);
            }}
            placeholder="Select Redeem Status"
            isSearchable
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
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
                  Request
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
                    <td className="p-4 text-gray-900">{refer.referral_code}</td>
                    {refer.redeem_status ? (
                      <td className="p-4 text-gray-900">
                        <Badge color="success" className="!inline-block">
                          Completed
                        </Badge>
                      </td>
                    ) : (
                      <td className="p-4 text-gray-900">
                        {formatDateTime(new Date(refer.redeem_requested_at))}
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-900 text-right flex justify-center items-center">
                      <button
                        onClick={() => setSelectedRefer(refer)}
                        className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                        aria-label="Info"
                      >
                        <MdOutlineRemoveRedEye />
                      </button>
                      {!refer.redeem_status && (
                        <button
                          onClick={() => {
                            setRedeemPopupOpen(true);
                            setSelectedRefer(refer);
                          }}
                          className="text-sm text-white px-2 py-1 rounded-md bg-green-600 hover:bg-green-700"
                        >
                          Redeem
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
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
      {!isRedeemPopupOpen && selectedRefer && (
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
            { label: "Referral Code", value: selectedRefer.referral_code },
            {
              label: "Description",
              value: selectedRefer?.description ?? "",
            },
            {
              label: "Redeem Status",
              value: selectedRefer.redeem_status ? "Completed" : "Inactive",
            },
            {
              label: "Redeem Request At",
              value: formatDateTime(
                new Date(selectedRefer.redeem_requested_at)
              ),
            },
            {
              label: "Created At",
              value: formatDateTime(new Date(selectedRefer.createdAt)),
            },
          ]}
          onClose={() => setSelectedRefer(null)}
        />
      )}
      {isRedeemPopupOpen && selectedRefer && (
        <section
          onClick={handleCancelRedeem}
          className={`h-[100vh] w-full fixed top-0 left-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-md w-[34%] p-6 transition-transform transform scale-in`}
          >
            <div className="flex justify-between items-center mb-8">
              <p className="text-lg font-semibold">Redeem Status Update</p>
              <AiOutlineClose
                onClick={handleCancelRedeem}
                className="cursor-pointer text-2xl"
              />
            </div>
            <Textarea
              id="redeem-description"
              value={redeemDescription}
              onChange={(e) => setRedeemDescription(e.target.value)}
              placeholder="Add description"
            />
            <Button
              onClick={() => handleRedeem(selectedRefer.id)}
              className="mt-4"
            >
              Redeem
            </Button>
          </div>
        </section>
      )}
    </section>
  );
};

export default RedeemRefer;
