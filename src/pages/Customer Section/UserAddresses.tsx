import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Spinner } from "flowbite-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import { formatDateTime } from "../../../utils/DateFormatter";
import { useLocation, useNavigate } from "react-router";
import { IoArrowBackOutline } from "react-icons/io5";
import PaginationComponent from "../../components/PaginatonComponent";

interface CustomerForm {
  id: number;
  user_id: number;
  address_name: string;
  address: string;
  state: string;
  city: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  pincode: string;
  created_at: string;
  updatedAt: string;
}
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const CustomerAddresses: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [customerAddressesForm, setCustomerAddressesForm] = useState<
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
  const [selectedAddress, setselectedAddress] = useState<CustomerForm | null>(
    null
  );
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [customerIdToDelete, setCustomerIdToDelete] = useState<number | null>(
    null
  );

  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search.replace("?user_id=", "");

  useEffect(() => {
    fetchCustomerAddressesForm();
  }, [currentPage, entriesPerPage]);

  const fetchCustomerAddressesForm = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
      };
      if (search) {
        params.search = search;
      }
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/customer/users/addresses`,
        { params }
      );
      setCustomerAddressesForm(response.data.data.addresses || []);
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
    if (customerIdToDelete !== null) {
      try {
        await api.delete(
          `${BACKEND_API_KEY}/product/customers/${customerIdToDelete}`
        );
        fetchCustomerAddressesForm();
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
        <div className="flex justify-between items-center">
          <EntriesPerPage
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />
          {search && (
            <div className="flex">
              <button
                className="bg-blue-500 text-white px-3 py-2 rounded block mr-4"
                onClick={() => navigate("/admin/customer-section/user-list")}
              >
                <IoArrowBackOutline />
              </button>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <ErrorComp error={error} onRetry={fetchCustomerAddressesForm} />
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
                    Address Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Address
                  </th>
                  <th scope="col" className="px-4 py-3">
                    State
                  </th>
                  <th scope="col" className="px-4 py-3">
                    City
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pincode
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
                {customerAddressesForm.length > 0 ? (
                  customerAddressesForm.map((customerForm) => (
                    <tr
                      key={customerForm.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="p-4 text-gray-900">{customerForm.id}</td>
                      <td className="p-4 text-gray-900">
                        {customerForm.firstname} {customerForm.lastname}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.address_name}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.address}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.state}
                      </td>
                      <td className="p-4 text-gray-900">{customerForm.city}</td>
                      <td className="p-4 text-gray-900">
                        {customerForm.pincode}
                      </td>
                      <td className="p-4 text-gray-900">
                        {formatDateTime(new Date(customerForm.created_at))}
                      </td>
                      <td className="px-6 py-4 text-gray-900 flex">
                        <button
                          onClick={() => setselectedAddress(customerForm)}
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
                    <td colSpan={8} className="p-4 text-center">
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
            Showing {customerAddressesForm.length} out of{" "}
            {pagination.totalItems} Customer
          </p>
        )}
        <PaginationComponent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagination={pagination}
        />
      </>
      {selectedAddress && (
        <DetailsPopup
          title="Customer Addresses Details"
          fields={[
            { label: "ID", value: selectedAddress.id?.toString() },
            { label: "User ID", value: selectedAddress.user_id?.toString() },
            { label: "First Name", value: selectedAddress.firstname },
            { label: "Last Name", value: selectedAddress.lastname },
            { label: "Email", value: selectedAddress.email },
            { label: "Address Name", value: selectedAddress.address_name },
            { label: "Address", value: selectedAddress.address },
            { label: "State", value: selectedAddress.state },
            { label: "City", value: selectedAddress.city },
            { label: "Pincode", value: selectedAddress.pincode },
            {
              label: "Created At",
              value: formatDateTime(new Date(selectedAddress.created_at)),
            },
            {
              label: "Updated At",
              value: formatDateTime(new Date(selectedAddress.updatedAt)),
            },
          ]}
          onClose={() => setselectedAddress(null)}
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
    </div>
  );
};

export default CustomerAddresses;
