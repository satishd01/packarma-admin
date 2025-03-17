import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { Spinner, Tooltip } from "flowbite-react";
import { FaInfoCircle } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import {
  MdClose,
  MdDeleteOutline,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import EntriesPerPage from "../../components/EntriesComp";
import { ErrorComp } from "../../components/ErrorComp";
import DetailsPopup from "../../components/DetailsPopup";
import CustomPopup from "../../components/CustomPopup";
import toast from "react-hot-toast";
import { hasUpdateAndCreatePermissions } from "../../../utils/PermissionChecker";
import { useUser } from "../../context/userContext";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import SubscriptionPrice from "../../components/SubscriptionPrice";
import { IoPricetagOutline } from "react-icons/io5";
import PaginationComponent from "../../components/PaginatonComponent";

export interface Subscription {
  id: number;
  type: string;
  credit_amount: number;
  prices: Price[];
  duration: number;
  status: string;
  benefits: string[];
  createdAt: string;
  updatedAt: string;
  sequence: number;
}

export interface Price {
  price: number | undefined;
  currency: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const SubscriptionPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [type, setType] = useState("");
  const [credit_amount, setCredit_amount] = useState("");
  const [duration, setDuration] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedSubscriptionData, setSelectedSubscriptionData] =
    useState<Subscription | null>(null);

  const [pricePopup, setPricePopup] = useState(false);
  const [pricePopupData, setPricePopupData] = useState<Price[]>([]);
  const userContext = useUser();
  const [subscriptionPricePopup, setSubscriptionPricePopup] = useState(false);

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
    fetchSubscriptions();
  }, [currentPage, entriesPerPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/master/subscriptions`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        },
      );
      setSubscriptions(response.data.data.subscriptions || []);
      if (response.data.data.pagination) {
        setPagination(response.data.data.pagination);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
      setLoading(false);
      setSubscriptions([]);
    }
  };

  const openAddForm = () => {
    setEditingSubscription(null);
    setType("");
    setCredit_amount("");
    setDuration("");
    setBenefits([]);
    setIsFormOpen(true);
  };

  const openEditForm = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setType(subscription.type);
    setCredit_amount(subscription.credit_amount.toString());
    setDuration(subscription.duration.toString());
    setBenefits(subscription.benefits.filter((b) => b.trim() !== ""));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSubscription(null);
    setType("");
    setCredit_amount("");
    setDuration("");
    setBenefits([]);
  };

  const addBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = {
        type,
        credit_amount: Number(credit_amount),
        duration: Number(duration),
        benefits: benefits.join("#"),
      };

      if (editingSubscription) {
        await api.put(
          `${BACKEND_API_KEY}/api/admin/master/subscription/${editingSubscription.id}`,
          formData,
        );
      } else {
        await api.post(`${BACKEND_API_KEY}/api/admin/master/subscription`, formData);
      }

      closeForm();
      fetchSubscriptions();
    } catch (err) {
      setError("Failed to save subscription");
    }
  };

  const openBenefitsPopup = (benefits: string[]) => {
    setIsPopupOpen(true);
    setBenefits(benefits);
  };

  const closeBenefitsPopup = () => {
    setIsPopupOpen(false);
    setBenefits([]);
  };

  const deleteSubscription = (data: Subscription) => {
    setSelectedSubscriptionData(data);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSubscriptionData?.id !== null) {
      const loadingToast = toast.loading("Deleting subscription...");
      try {
        await api.delete(
          `${BACKEND_API_KEY}/api/admin/master/subscription/${selectedSubscriptionData?.id}`,
        );
        fetchSubscriptions();
        toast.success("Subscription deleted successfully");
      } catch (err) {
        toast.error("Failed to delete subscription");
      } finally {
        toast.dismiss(loadingToast);
        setIsDeletePopupOpen(false);
        setSelectedSubscriptionData(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setSelectedSubscriptionData(null);
  };

  const moveSubscription = async (index: number, direction: "up" | "down") => {
    const loadingToast = toast.loading("Moving Subscription...");
    try {
      const subscriptionId = subscriptions[index]?.id;
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (subscriptions[index] && subscriptions[targetIndex]) {
        const temp = subscriptions[index]!.sequence;
        subscriptions[index]!.sequence = subscriptions[targetIndex]!.sequence;
        subscriptions[targetIndex]!.sequence = temp;
      }
      await Promise.all([
        api.put(`${BACKEND_API_KEY}/api/admin/master/subscription/${subscriptionId}`, {
          sequence: subscriptions[index]?.sequence,
        }),
        api.put(
          `${BACKEND_API_KEY}/api/admin/master/subscription/${subscriptions[targetIndex]?.id}`,
          {
            sequence: subscriptions[targetIndex]?.sequence,
          },
        ),
      ]);

      fetchSubscriptions();
      toast.dismiss(loadingToast);
      toast.success("Subscription moved successfully");
    } catch (error) {
      console.error("Error moving subscription:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to move subscription");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Manage Subscriptions
      </h1>
      {!isFormOpen && !subscriptionPricePopup && (
        <div className="flex justify-between items-center w-full my-6">
          <EntriesPerPage
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />
          {createPermission && (
            <button
              onClick={openAddForm}
              className="bg-lime-500 text-black px-4 py-2 rounded mb-4 block ml-auto mr-4"
            >
              Add New Subscription
            </button>
          )}
        </div>
      )}
      {!isFormOpen && !subscriptionPricePopup && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <ErrorComp error={error} onRetry={fetchSubscriptions} />
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
                      Credit Amount
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Duration
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Prices
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Benefits
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length > 0 ? (
                    subscriptions.map((subscription, index) => (
                      <tr
                        key={subscription.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4 text-gray-900">{subscription.id}</td>
                        <td className="p-4 text-gray-900">
                          {subscription.type}
                        </td>
                        <td className="p-4 text-gray-900">
                          {subscription.credit_amount}
                        </td>
                        <td className="p-4 text-gray-900">
                          {subscription.duration} days
                        </td>
                        <td className="p-4 text-gray-900">
                          {subscription.prices ? (
                            <button
                              onClick={() => {
                                setPricePopup(true);
                                setPricePopupData(subscription.prices);
                              }}
                              className="text-xl text-blue-600 dark:text-blue-500 hover:underline"
                              aria-label="View Prices"
                            >
                              <FaInfoCircle aria-label="View Prices" />
                            </button>
                          ) : (
                            "No Data!"
                          )}
                        </td>
                        <td className="p-4 text-gray-900">
                          {subscription.benefits ? (
                            <button
                              onClick={() =>
                                openBenefitsPopup(subscription.benefits)
                              }
                              className="text-xl text-blue-600 dark:text-blue-500 hover:underline"
                              aria-label="View Benefits"
                            >
                              <FaInfoCircle />
                            </button>
                          ) : (
                            "No Data!"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900 flex">
                          <button
                            onClick={() => moveSubscription(index, "up")}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4 disabled:text-blue-200"
                            aria-label="Move Up"
                            disabled={index === 0}
                          >
                            <AiOutlineArrowUp />
                          </button>
                          <button
                            onClick={() => moveSubscription(index, "down")}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4 disabled:text-blue-200"
                            aria-label="Move Down"
                            disabled={index === subscriptions.length - 1}
                          >
                            <AiOutlineArrowDown />
                          </button>
                          <button
                            onClick={() => {
                              setSubscriptionPricePopup(true);
                              setSelectedSubscriptionData(subscription);
                            }}
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <Tooltip content="Add Prices">
                              <IoPricetagOutline />
                            </Tooltip>
                          </button>
                          <button
                            onClick={() =>
                              setSelectedSubscription(subscription)
                            }
                            className="text-2xl text-blue-600 dark:text-blue-500 hover:underline mr-4"
                            aria-label="Info"
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          {updatePermission && (
                            <button
                              onClick={() => openEditForm(subscription)}
                              className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                              aria-label="Edit"
                            >
                              <TbEdit />
                            </button>
                          )}
                          {deletePermission && (
                            <button
                              onClick={() => deleteSubscription(subscription)}
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
                      <td colSpan={7} className="px-6 py-4 text-center">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!error && (
            <p className="my-4 text-sm">
              Showing {subscriptions.length} out of {pagination.totalItems}{" "}
              Subscriptions
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
            {editingSubscription ? "Edit Subscription" : "Add New Subscription"}
          </h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-5">
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
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="credit_amount"
                className="block text-sm font-medium text-gray-700"
              >
                Credit Amount
              </label>
              <input
                type="number"
                id="credit_amount"
                value={credit_amount}
                onChange={(e) => setCredit_amount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (days)
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
                    placeholder="Enter a benefit"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <IoMdRemove />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 flex justify-center items-center"
              >
                <IoMdAdd className="mr-1" /> Add Benefit
              </button>
            </div>
            <div className="flex justify-center items-center mt-4 col-span-2">
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
                {editingSubscription
                  ? "Update Subscription"
                  : "Add Subscription"}
              </button>
            </div>
          </form>
        </div>
      )}
      {subscriptionPricePopup && (
        <SubscriptionPrice
          data={selectedSubscriptionData!}
          goBackHandler={() => setSubscriptionPricePopup(false)}
        />
      )}

      {selectedSubscription && (
        <DetailsPopup
          title="Subscription Details"
          fields={[
            { label: "ID", value: selectedSubscription.id.toString() },
            { label: "Name", value: selectedSubscription.type },
            {
              label: "Credit Amount",
              value: selectedSubscription.credit_amount.toString(),
            },
            {
              label: "Duration",
              value: selectedSubscription.duration.toString(),
            },
            {
              label: "Benefits",
              value: (
                <ul>
                  {selectedSubscription.benefits.map((benefit, index) => (
                    <li key={index}>
                      {index + 1}. {benefit}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              label: "Created At",
              value: new Date(selectedSubscription.createdAt).toLocaleString(),
            },
            {
              label: "Updated At",
              value: new Date(selectedSubscription.updatedAt).toLocaleString(),
            },
          ]}
          onClose={() => setSelectedSubscription(null)}
        />
      )}
      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this banner?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black z-40 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Benefits</h3>
            <ul className="list-disc list-inside">
              {benefits.map((benefit, index) => (
                <li key={index} className="mb-2">
                  {benefit}
                </li>
              ))}
            </ul>
            <button
              onClick={closeBenefitsPopup}
              className="mt-4 px-4 py-2 bg-lime-500 text-black rounded hover:bg-lime-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {pricePopup && (
        <div className="fixed inset-0 bg-black z-40 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-scroll">
            <div className="flex justify-end">
              <button
                onClick={() => setPricePopup(false)}
                className="mb-4 px-4 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 transition duration-300 ease-in-out"
              >
                <MdClose />
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-gray-200 bg-gray-100 px-4 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="border-b-2 border-gray-200 bg-gray-100 px-4 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricePopupData.map((price, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 border-b border-gray-200">
                      {price.currency}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      {price.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
