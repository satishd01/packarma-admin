import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Spinner, TextInput } from "flowbite-react";
import { MdDescription, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import DescriptionPopup from "../../components/DescriptionCustomerContactPopup";
import PaginationComponent from "../../components/PaginatonComponent";

interface CustomerForm {
  id: number;
  name: string;
  phone_number: string;
  issue: string;
  createdAt: string;
  updatedAt: string;
  admin_description?: string;
  admin_id?: number;
  admin_name?: string;
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
  const [customerEnquiriesForm, setCustomerEnquiriesForm] = useState<
    CustomerForm[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerForm | null>(
    null
  );
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [customerIdToDelete, setCustomerIdToDelete] = useState<number | null>(
    null
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [debounceSearch, setDebouncedSearch] = useState("");
  const [description, setDescription] = useState("");
  const [isDescriptionPopupOpen, setIsDescriptionPopupOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filter);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [filter]);

  useEffect(() => {
    fetchCustomerEnquiriesForm();
  }, [currentPage, entriesPerPage, debounceSearch]);

  const fetchCustomerEnquiriesForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/contact-us/customer-care`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            search: debounceSearch,
          },
        }
      );
      setCustomerEnquiriesForm(response.data.data.enquiries || []);
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

  const addAdminDescription = async (id: number) => {
    try {
      await api.post(`${BACKEND_API_KEY}/api/admin/contact-us/add-description/${id}`, {
        admin_description: description,
      });
      fetchCustomerEnquiriesForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add description");
    }
  };

  const handleAddDescription = (id: number) => {
    setSelectedCustomerId(id);
    setIsDescriptionPopupOpen(true);
  };

  const handleConfirmAddDescription = async () => {
    if (selectedCustomerId !== null) {
      await addAdminDescription(selectedCustomerId);
      setIsDescriptionPopupOpen(false);
      setSelectedCustomerId(null);
      setDescription("");
    }
  };

  const handleCancelAddDescription = () => {
    setIsDescriptionPopupOpen(false);
    setSelectedCustomerId(null);
    setDescription("");
  };

  const handleConfirmDelete = async () => {
    if (customerIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/product/customers/${customerIdToDelete}`
        );
        fetchCustomerEnquiriesForm();
      } catch (err) {
        setError("Failed to delete customer");
      }
      setDeletePopupOpen(false);
      setCustomerIdToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setCustomerIdToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Customer
      </h1>
      <>
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
                fetchCustomerEnquiriesForm();
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="flex justify-start items-start mb-6 flex-col">
            <label htmlFor="search" className="text-sm mb-1 font-medium">
              Search Name and Phone Number
            </label>
            <TextInput
              className="customInput w-[25%]"
              id="search"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <ErrorComp error={error} onRetry={fetchCustomerEnquiriesForm} />
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
                    Phone Number
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Issue Reported
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Created At
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Admin Description
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customerEnquiriesForm.length > 0 ? (
                  customerEnquiriesForm.map((customerForm) => (
                    <tr
                      key={customerForm.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="p-4 text-gray-900">{customerForm.id}</td>
                      <td className="p-4 text-gray-900">{customerForm.name}</td>
                      <td className="p-4 text-gray-900">
                        {customerForm.phone_number}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.issue}
                      </td>
                      <td className="p-4 text-gray-900">
                        {new Date(customerForm.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.admin_description}
                      </td>
                      <td className="px-6 py-4 text-gray-900 flex">
                        <button
                          onClick={() => setSelectedEnquiry(customerForm)}
                          className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                          aria-label="Info"
                        >
                          <MdOutlineRemoveRedEye />
                        </button>
                        <button
                          onClick={() => handleAddDescription(customerForm.id)}
                          className="text-2xl text-green-600 dark:text-green-500 hover:underline"
                          aria-label="Add Description"
                        >
                          <MdDescription />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No customer enquiries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!error && (
          <p className="my-4 text-sm">
            Showing {customerEnquiriesForm.length} out of{" "}
            {pagination.totalItems} Customer
          </p>
        )}
        <PaginationComponent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagination={pagination}
        />
      </>
      {selectedEnquiry && (
        <DetailsPopup
          title="Customer Enquiries Details"
          fields={[
            { label: "ID", value: selectedEnquiry.id?.toString() },
            { label: "Name", value: selectedEnquiry.name },
            { label: "Phone Number", value: selectedEnquiry.phone_number },
            { label: "Issue", value: selectedEnquiry.issue },
            {
              label: "Admin Id",
              value: selectedEnquiry?.admin_id?.toString() ?? "",
            },
            { label: "Admin Name", value: selectedEnquiry?.admin_name ?? "" },
            {
              label: "Admin Description",
              value: selectedEnquiry.admin_description ?? "",
            },
            {
              label: "Created At",
              value: new Date(selectedEnquiry.createdAt)?.toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedEnquiry.updatedAt)?.toLocaleString(),
            },
          ]}
          onClose={() => setSelectedEnquiry(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this customer?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      <DescriptionPopup
        isOpen={isDescriptionPopupOpen}
        onClose={handleCancelAddDescription}
        onConfirm={handleConfirmAddDescription}
        description={description}
        setDescription={setDescription}
      />
    </div>
  );
};

export default Customer;
