import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Spinner, TextInput } from "flowbite-react";
import { MdOutlineRemoveRedEye, MdPictureAsPdf } from "react-icons/md";
import { BACKEND_API_KEY, BACKEND_MEDIA_LINK } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import { FaRegFileExcel } from "react-icons/fa";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import { formatDateTime } from "../../../utils/DateFormatter";
import { AiOutlineSearch } from "react-icons/ai";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import { customStyle } from "../../../utils/CustomSelectTheme";
import Select from "react-select";
import toast from "react-hot-toast";
import { formatDateForFilename } from "../../../utils/ExportDateFormatter";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import PaginationComponent from "../../components/PaginatonComponent";

interface SubscriptionList {
  id: string;
  type: string;
}

interface User {
  user_id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Address {
  address_name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  phone_number: string;
}

interface ProductDetails {
  product_description: string;
  amount: string;
  discount: string;
  taxable_value: string;
  cgst_rate: string;
  cgst_amount: string;
  sgst_rate: string;
  sgst_amount: string;
  igst_rate: string;
  igst_amount: string;
  total_amount: string;
}

interface Subscription {
  type: string;
  credit_amount: number;
  duration: number;
  benefits: string;
  start_date: string;
  end_date: string;
}

interface CustomerForm {
  id: number;
  user: User;
  address: Address;
  customer_name: string;
  customer_gstno: string;
  total_price: string;
  currency: string;
  invoice_link: string;
  transaction_id: string;
  payment_id: string;
  invoice_date: string;
  product_details: ProductDetails;
  subscription: Subscription;
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
    null,
  );
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionList[]>(
    [],
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<{
    name: string | undefined;
    subscription_type: string | undefined;
    start_date: string | undefined;
    end_date: string | undefined;
  }>({
    name: "",
    subscription_type: "",
    start_date: "",
    end_date: "",
  });

  const userContext = useUser();

  const exportPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Customer Section",
    "can_export",
  );

  const getSubscriptionList = async () => {
    const response = await api.get(
      `${BACKEND_API_KEY}/api/admin/customer/subscription-list`,
    );
    setSubscriptionList(response.data.data);
  };

  useEffect(() => {
    getSubscriptionList();
  }, []);

  useEffect(() => {
    fetchCustomerForm();
  }, [currentPage, entriesPerPage]);

  const fetchCustomerForm = async (type?: string) => {
    try {
      setLoading(true);
      let response;
      if (type === "nofilter") {
        response = await api.get('api/admin/customer/subscriptions', {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        });
      } else {
        response = await api.get('api/admin/customer/subscriptions', {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            name: filter?.name,
            subscription_type: filter?.subscription_type,
            start_date: filter?.start_date,
            end_date: filter?.end_date,
          },
        });
      }
      setCustomerForm(response.data.data.invoices || []);
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
        '/api/admin/customer/subscriptions/export',
        {
          link: BACKEND_MEDIA_LINK,
          name: filter?.name,
          subscription_type: filter?.subscription_type,
          start_date: filter?.start_date,
          end_date: filter?.end_date,
        },
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      let title = `subscriptions_data_exported_(${formatDateForFilename()}).xlsx`;
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

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage User Subscriptions
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
                setFilter({
                  ...filter,
                  name: "",
                  subscription_type: "",
                  start_date: "",
                  end_date: "",
                });
                fetchCustomerForm("nofilter");
                setCurrentPage(1);
              }}
            >
              {filterOpen ? <TbFilterOff size={22} /> : <TbFilter size={22} />}
            </button>
          </div>
        </div>
        {filterOpen && (
          <div className="grid grid-cols-3 gap-4 flex-wrap mb-6 items-end">
            <TextInput
              className="customInput w-full"
              type="text"
              placeholder="Search User Name.."
              value={filter.name}
              onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            />
            <Select
              styles={customStyle}
              id="subscriptionType"
              options={subscriptionList.map((subscription) => ({
                label: subscription.type,
                value: subscription.type,
              }))}
              value={
                filter.subscription_type
                  ? {
                      label: filter.subscription_type,
                      value: filter.subscription_type,
                    }
                  : undefined
              }
              onChange={(
                selectedOption: { label: string; value: string } | null,
              ) => {
                setFilter({
                  ...filter,
                  subscription_type: selectedOption?.value,
                });
              }}
              placeholder="Select Subscription Type"
              isSearchable
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <TextInput
              className="customInput w-full"
              type="date"
              placeholder="Start Date"
              value={filter.start_date}
              onChange={(e) =>
                setFilter({ ...filter, start_date: e.target.value })
              }
            />
            <TextInput
              className="customInput w-full"
              type="date"
              placeholder="End Date"
              value={filter.end_date}
              onChange={(e) =>
                setFilter({ ...filter, end_date: e.target.value })
              }
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <ErrorComp error={error} onRetry={fetchCustomerForm} />
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
                    Subscription
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Order Id
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Payment Id
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Currency
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Start Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    End Date
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
                      key={customerForm.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="p-4 text-gray-900">{customerForm.id}</td>
                      <td className="p-4 text-gray-900">
                        {customerForm.customer_name}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.subscription.type}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.transaction_id}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.payment_id}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.currency}
                      </td>
                      <td className="p-4 text-gray-900">
                        {customerForm.total_price}
                      </td>
                      <td className="p-4 text-gray-900">
                        {formatDateTime(
                          new Date(customerForm.subscription.start_date),
                        )}
                      </td>
                      <td className="p-4 text-gray-900">
                        {formatDateTime(
                          new Date(customerForm.subscription.end_date),
                        )}{" "}
                      </td>
                      <td className="px-6 py-4 text-gray-900 flex">
                        <button
                          onClick={() =>
                            window.open(
                              BACKEND_MEDIA_LINK + customerForm.invoice_link,
                            )
                          }
                          className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                          aria-label="Info"
                        >
                          <MdPictureAsPdf />
                        </button>
                        <button
                          onClick={() => setSelectedCustomer(customerForm)}
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
                      No user subscriptions found
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
      {selectedCustomer && (
        <DetailsPopup
          title="User Subscription Details"
          fields={[
            { label: "ID", value: selectedCustomer.id?.toString() },
            {
              label: "Name",
              value:
                selectedCustomer.user.firstname +
                " " +
                selectedCustomer.user.lastname,
            },
            {
              label: "Email",
              value: selectedCustomer.user.email,
            },
            {
              label: "User ID",
              value: selectedCustomer.user.user_id?.toString(),
            },
            {
              label: "Customer Name",
              value: selectedCustomer.customer_name,
            },
            {
              label: "Customer GST No",
              value: selectedCustomer.customer_gstno,
            },
            {
              label: "Total Price",
              value: selectedCustomer.total_price,
            },
            {
              label: "Currency",
              value: selectedCustomer.currency,
            },
            {
              label: "Invoice Date",
              value: formatDateTime(new Date(selectedCustomer.invoice_date)),
            },
            {
              label: "Invoice Link",
              value: (
                <a
                  href={BACKEND_MEDIA_LINK + selectedCustomer.invoice_link}
                  target="_blank"
                  className="underline text-blue-500"
                >
                  Open Invoice
                </a>
              ),
            },
            {
              label: "Order ID",
              value: selectedCustomer.transaction_id,
            },
            {
              label: "Payment ID",
              value: selectedCustomer.payment_id,
            },
            {
              label: "Product Description",
              value: selectedCustomer.product_details.product_description,
            },
            {
              label: "Amount",
              value: selectedCustomer.product_details.amount,
            },
            {
              label: "Discount",
              value: selectedCustomer.product_details.discount,
            },
            {
              label: "Taxable Value",
              value: selectedCustomer.product_details.taxable_value,
            },
            {
              label: "CGST",
              value: `${
                Number(selectedCustomer.product_details.cgst_rate) * 100
              }% (${selectedCustomer.product_details.cgst_amount})`,
            },
            {
              label: "SGST",
              value: `${
                Number(selectedCustomer.product_details.sgst_rate) * 100
              }% (${selectedCustomer.product_details.sgst_amount})`,
            },
            {
              label: "IGST",
              value: `${
                Number(selectedCustomer.product_details.igst_rate) * 100
              }% (${selectedCustomer.product_details.igst_amount})`,
            },
            {
              label: "Before Discount Amount",
              value: selectedCustomer.product_details.total_amount,
            },
            {
              label: "Subscription Type",
              value: selectedCustomer.subscription.type,
            },
            {
              label: "Subscription Duration",
              value: selectedCustomer.subscription.duration.toString(),
            },
            {
              label: "Subscription Start Date",
              value: formatDateTime(
                new Date(selectedCustomer.subscription.start_date),
              ),
            },
            {
              label: "Subscription End Date",
              value: formatDateTime(
                new Date(selectedCustomer.subscription.end_date),
              ),
            },
            {
              label: "Address Name",
              value: selectedCustomer.address.address_name,
            },
            {
              label: "Address",
              value: selectedCustomer.address.address,
            },
            {
              label: "State",
              value: selectedCustomer.address.state,
            },
            {
              label: "City",
              value: selectedCustomer.address.city,
            },
            {
              label: "Pincode",
              value: selectedCustomer.address.pincode,
            },
            {
              label: "Phone Number",
              value: selectedCustomer.address.phone_number,
            },
          ]}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

export default Customer;
