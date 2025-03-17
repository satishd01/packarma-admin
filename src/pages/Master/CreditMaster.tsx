import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Badge, Spinner, TextInput } from "flowbite-react";
import { TbEdit, TbFilter, TbFilterOff } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import ToggleSwitch from "../../components/ToggleSwitch";
import EntriesPerPage from "../../components/EntriesComp";
import DetailsPopup from "../../components/DetailsPopup";
import { ErrorComp } from "../../components/ErrorComp";
import CustomPopup from "../../components/CustomPopup";
import toast from "react-hot-toast";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import { customStyle } from "../../../utils/CustomSelectTheme";
import Select from "react-select";
import PaginationComponent from "../../components/PaginatonComponent";

interface CreditPrice {
  id: number;
  price: number;
  percentage: number;
  currency: string;
  country: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

const CreditMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [creditPrices, setCreditPrices] = useState<CreditPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCreditPrice, setEditingCreditPrice] =
    useState<CreditPrice | null>(null);
  const [price, setPrice] = useState<number | "">("");
  const [percentage, setPercentage] = useState<number | "">("");
  const [currency, setCurrency] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedCreditPrice, setSelectedCreditPrice] =
    useState<CreditPrice | null>(null);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [creditPriceIdToDelete, setCreditPriceIdToDelete] = useState<
    number | null
  >(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState("");
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get(`${BACKEND_API_KEY}/api/admin/master/currencies`);
        setCurrencies(response.data.data.currencies || []);
      } catch (err) {
        console.error("Failed to fetch currencies");
      }
    };

    fetchCurrencies();
  }, []);

  const userContext = useUser();
  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_update"
  );
  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_create"
  );
  const deletePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_delete"
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
    }, 350);
    return () => {
      clearTimeout(handler);
    };
  }, [titleFilter]);

  useEffect(() => {
    fetchCreditPrices();
  }, [currentPage, entriesPerPage, debouncedTitleFilter]);

  const fetchCreditPrices = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/master/credit-prices`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            search: debouncedTitleFilter,
          },
        }
      );
      setCreditPrices(response.data.data.creditPrices || []);
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

  const deleteCreditPrice = (id: number) => {
    setCreditPriceIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (creditPriceIdToDelete !== null) {
      const loadingToast = toast.loading("Deleting credit price...");
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/master/credit-prices/${creditPriceIdToDelete}`
        );
        fetchCreditPrices();
        toast.success("Credit price deleted successfully");
      } catch (err) {
        toast.error("Failed to delete credit price");
      } finally {
        toast.dismiss(loadingToast);
        setDeletePopupOpen(false);
        setCreditPriceIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
    setCreditPriceIdToDelete(null);
  };

  const openAddForm = () => {
    setEditingCreditPrice(null);
    setPrice("");
    setPercentage("");
    setCurrency("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditForm = (creditPrice: CreditPrice) => {
    setEditingCreditPrice(creditPrice);
    setPrice(creditPrice.price);
    setPercentage(creditPrice.percentage);
    setCurrency(creditPrice.currency);
    setCountry(creditPrice.country);
    setStatus(creditPrice.status);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCreditPrice(null);
    setPrice("");
    setPercentage("");
    setCurrency("");
    setStatus("active");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving credit price...");
    try {
      const formData = {
        price,
        percentage,
        currency,
        status,
        country,
      };

      if (editingCreditPrice) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/master/credit-prices/${editingCreditPrice.id}`,
          formData
        );
        toast.success("Credit price updated successfully");
      } else {
        await api.post(`${BACKEND_API_KEY}/master/credit-prices`, formData);
        toast.success("Credit price added successfully");
      }

      closeForm();
      fetchCreditPrices();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.response?.data.message || "Failed to save credit price");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/api/admin/master/credit-prices/${id}`, {
        status: newStatus,
      });
      fetchCreditPrices();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Credit Prices
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
                Add New Credit Price
              </button>
            )}
          </div>
        </div>
      )}
      {filterOpen && (
        <div className="flex justify-start items-start mb-6 flex-col">
          <label htmlFor="search" className="text-sm mb-1 font-medium">
            Search Price and Currency
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
            <ErrorComp error={error} onRetry={fetchCreditPrices} />
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-900 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Id
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Percentage
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Country
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Currency
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
                  {creditPrices.length > 0 ? (
                    creditPrices.map((creditPrice) => (
                      <tr key={creditPrice.id} className="bg-white border-b">
                        <td className="px-6 py-4 text-gray-800">
                          {creditPrice.id}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {creditPrice.price}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {creditPrice.percentage}%
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {creditPrice.country}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {creditPrice.currency}
                        </td>
                        {updatePermission && (
                          <td className="p-4 text-gray-900">
                            <ToggleSwitch
                              checked={creditPrice.status === "active"}
                              onChange={() =>
                                toggleStatus(creditPrice.id, creditPrice.status)
                              }
                            />
                          </td>
                        )}
                        {!updatePermission && (
                          <td className="p-4 text-gray-900">
                            <Badge
                              className="!inline-block"
                              color={
                                creditPrice.status === "active"
                                  ? "success"
                                  : "failure"
                              }
                            >
                              {creditPrice.status.charAt(0).toUpperCase() +
                                creditPrice.status.slice(1)}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() => setSelectedCreditPrice(creditPrice)}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(creditPrice)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-4"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() => deleteCreditPrice(creditPrice.id)}
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
                      <td colSpan={6} className="text-center py-6">
                        No credit prices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {creditPrices.length} out of {pagination.totalItems}{" "}
              Credit Prices
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
        <form
          onSubmit={handleFormSubmit}
          className="w-full max-w-lg mx-auto mt-6"
        >
          <h2 className="text-lg font-bold mb-4">
            {editingCreditPrice ? "Edit Credit Price" : "Add New Credit Price"}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Price</label>
            <TextInput
              className="customInput"
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              required
              placeholder="Enter price"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Percentage</label>
            <TextInput
              className="customInput"
              type="number"
              value={percentage}
              onChange={(e) =>
                setPercentage(e.target.value ? Number(e.target.value) : "")
              }
              required
              placeholder="Enter percentage"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Currency</label>
            <Select
              styles={customStyle}
              id="currency"
              options={currencies.map((currency) => ({
                value: currency.code,
                label: currency.name,
              }))}
              value={
                currency
                  ? {
                      label: `${
                        currencies.find((c) => c.code === currency)?.name
                      }`,
                      value: currency,
                    }
                  : undefined
              }
              onChange={(
                selectedOption: { label: string; value: string } | null
              ) => {
                setCurrency(selectedOption?.value || "");
                setCountry(selectedOption?.label || "");
              }}
              placeholder="Select Currency"
              isSearchable
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-lime-500 text-black px-4 py-2 rounded"
            >
              {editingCreditPrice ? "Update" : "Add"} Credit Price
            </button>
            <button type="button" onClick={closeForm} className="text-red-500">
              Cancel
            </button>
          </div>
        </form>
      )}
      {selectedCreditPrice && (
        <DetailsPopup
          title="Credit Price Details"
          fields={[
            { label: "ID", value: selectedCreditPrice.id.toString() },
            { label: "Currency", value: selectedCreditPrice.currency },
            { label: "Price", value: selectedCreditPrice.price.toString() },
            {
              label: "Percentage",
              value: selectedCreditPrice.percentage.toString(),
            },
            {
              label: "Status",
              value:
                selectedCreditPrice.status === "active" ? "Active" : "Inactive",
            },
            {
              label: "Created At",
              value: new Date(selectedCreditPrice.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedCreditPrice.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedCreditPrice(null)}
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

export default CreditMaster;
