import { useEffect, useState } from "react";
import { Price, Subscription } from "../pages/Master/SubscriptionPage";
import Select from "react-select";
import api from "../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../utils/ApiKey";
import { customStyle } from "../../utils/CustomSelectTheme";
import toast from "react-hot-toast";
import { Badge, Card, TextInput } from "flowbite-react";
import { useUser } from "../context/userContext";
import { hasUpdateAndCreatePermissions } from "../../utils/PermissionChecker";
import ToggleSwitch from "./ToggleSwitch";
import { MdDeleteOutline } from "react-icons/md";
import CustomPopup from "./CustomPopup";
import { IoArrowBackOutline } from "react-icons/io5";
import { TbEdit } from "react-icons/tb";

interface SubscriptionPrice {
  id: number;
  currency: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const SubscriptionPrice = ({
  data,
  goBackHandler,
}: {
  data: Subscription;
  goBackHandler: () => void;
}) => {
  const [inputPrice, setInputPrice] = useState<Price>({
    price: undefined,
    currency: "",
  });

  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deleteId, setDeletedId] = useState<number | null>(null);
  const [currencyOptions, setCurrencyOptions] = useState<
    {
      code: string;
      symbol: string;
      name: string;
    }[]
  >([]);

  const [usedCurrencyOptions, setUsedCurrencyOptions] = useState<
    {
      code: string;
      symbol: string;
      name: string;
    }[]
  >([]);
  const [prices, setPrices] = useState<SubscriptionPrice[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const userContext = useUser();

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editPrice, setEditPrice] = useState<SubscriptionPrice | null>(null);

  const getCurrencyOptions = async () => {
    try {
      const response = await api.get(
        `${BACKEND_API_KEY}/master/subscription/currencies/${data.id}`,
      );
      setCurrencyOptions(response.data.data.notUsed);
      setUsedCurrencyOptions(response.data.data.used);
    } catch (error) {
      console.error(error);
    }
  };

  const getPrices = async () => {
    try {
      const response = await api.get(
        `${BACKEND_API_KEY}/master/subscription/price/${data.id}`,
      );
      setPrices(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post(
        `${BACKEND_API_KEY}/master/subscription/price/${data.id}`,
        { subscription_id: data.id, ...inputPrice },
      );
      toast.success("Subscription price added successfully");

      setInputPrice({ price: undefined, currency: "" });
      getPrices();
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Failed to add subscription price");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(
        `${BACKEND_API_KEY}/master/subscription/price/${deleteId}`,
      );
      toast.success("Subscription price deleted successfully");
      getPrices();
    } catch (error) {
      toast.error("Failed to delete subscription price");
    }
  };

  const deletePricePopup = (id: number) => {
    setDeletePopupOpen(true);
    setDeletedId(id);
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`${BACKEND_API_KEY}/master/subscription/price/${id}`, {
        status: newStatus,
      });
      getPrices();
    } catch (err: any) {
      toast.dismiss();

      if (err?.response && err?.response?.data) {
        toast.error(err?.response?.data?.message);
      } else toast.error("Failed to update");
    }
  };

  const openEditForm = (price: SubscriptionPrice) => {
    setEditPrice(price);
    setIsEditFormOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editPrice) return;
    const { updatedAt, createdAt, ...editData } = editPrice;
    try {
      await api.put(
        `${BACKEND_API_KEY}/master/subscription/price/${editPrice.id}`,
        { ...editData },
      );
      toast.success("Subscription price updated successfully");

      setEditPrice(null);
      getPrices();
      setIsEditFormOpen(false);
    } catch (error) {
      toast.error("Failed to update subscription price");
    }
  };

  useEffect(() => {
    getCurrencyOptions();
    getPrices();
  }, []);

  const updatePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_update",
  );

  const createPermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_create",
  );

  const deletePermission = hasUpdateAndCreatePermissions(
    userContext,
    "Master",
    "can_delete",
  );
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center">
          {createPermission && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 mr-4"
            >
              Add Subscription Price
            </button>
          )}
          <button
            onClick={() => goBackHandler()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 mr-4"
          >
            <IoArrowBackOutline size={20} />
          </button>
        </div>
      </div>

      <Card className="relative">
        <div className="flex flex-col w-[60%]">
          <div className="pb-1">
            <strong>Subscription Id:</strong> {data?.id}
          </div>
          <div className="pb-1">
            <strong>Subscription Type:</strong> {data?.type}
          </div>
          <div className="pb-1">
            <strong>Duration:</strong> {data?.duration}
          </div>
          <div className="pb-1">
            <strong>Credit Amount:</strong> {data?.credit_amount}
          </div>
        </div>
      </Card>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-10">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">
                Country
              </th>
              <th scope="col" className="px-4 py-3">
                Currency
              </th>
              <th scope="col" className="px-4 py-3">
                Price
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
            {prices.length > 0 ? (
              prices.map((price) => (
                <tr
                  key={price.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-2 text-gray-900">
                    {
                      usedCurrencyOptions?.find(
                        (c) => c.code === price.currency,
                      )?.name
                    }
                  </td>
                  <td className="px-6 py-2 text-gray-900">{price.currency}</td>
                  <td className="px-6 py-2 text-gray-900">{price.price}</td>
                  {updatePermission && (
                    <td className="px-6 py-2 text-gray-900">
                      <ToggleSwitch
                        checked={price.status === "active"}
                        onChange={() => toggleStatus(price.id, price.status)}
                      />
                    </td>
                  )}
                  {!updatePermission && (
                    <td className="p-4 text-gray-900">
                      <Badge
                        className="!inline-block"
                        color={price.status ? "success" : "failure"}
                      >
                        {price.status.charAt(0).toUpperCase() +
                          price.status.slice(1)}
                      </Badge>
                    </td>
                  )}
                  <td className="px-6 py-4 text-gray-900 flex">
                    {updatePermission && (
                      <button
                        onClick={() => openEditForm(price)}
                        className="text-2xl text-lime-600 dark:text-lime-500 hover:underline mr-3"
                        aria-label="Edit"
                      >
                        <TbEdit />
                      </button>
                    )}
                    {deletePermission && (
                      <button
                        onClick={() => deletePricePopup(price.id)}
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
                <td colSpan={4} className="text-center">
                  No prices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <section
          onClick={() => setIsFormOpen(false)}
          className={`h-[100vh] w-full fixed top-0 left-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center`}
        >
          <form
            className={`bg-white rounded-md w-[34%] p-6 transition-transform transform scale-in`}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <p className="mb-4 text-xl font-bold">Add Subscription Price</p>
            <Select
              styles={customStyle}
              id="currency"
              options={currencyOptions.map((currency) => ({
                value: currency.code,
                label: `${currency.name} : ${currency.code} : ${currency.symbol}`,
              }))}
              value={
                inputPrice.currency
                  ? {
                      label: `${
                        currencyOptions.find(
                          (c) => c.code === inputPrice.currency,
                        )?.name
                      } : ${inputPrice.currency} : ${
                        currencyOptions.find(
                          (c) => c.code === inputPrice.currency,
                        )?.symbol
                      }`,
                      value: inputPrice.currency,
                    }
                  : undefined
              }
              onChange={(
                selectedOption: { label: string; value: string } | null,
              ) => {
                setInputPrice({
                  ...inputPrice,
                  currency: selectedOption?.value || "",
                });
              }}
              placeholder="Select Currency"
              isSearchable
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <TextInput
              type="number"
              value={inputPrice.price}
              onChange={(e) =>
                setInputPrice({
                  ...inputPrice,
                  price: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="customInput mt-4"
              placeholder="Enter Price"
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-lime-500 text-white font-medium px-4 py-2 rounded-md mr-2"
                type="submit"
              >
                Add
              </button>
              <button
                className="bg-gray-400 text-white font-medium  px-4 py-2 rounded-md"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {isEditFormOpen && (
        <section
          onClick={() => setIsEditFormOpen(false)}
          className={`h-[100vh] w-full fixed top-0 left-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center`}
        >
          <form
            className={`bg-white rounded-md w-[34%] p-6 transition-transform transform scale-in`}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleEditSubmit}
          >
            <p className="mb-4 text-xl font-bold">Edit Subscription Price</p>
            <Select
              styles={customStyle}
              id="currency"
              options={currencyOptions.map((currency) => ({
                value: currency.code,
                label: `${currency.name} : ${currency.code} : ${currency.symbol}`,
              }))}
              value={
                editPrice?.currency
                  ? {
                      label: `${
                        usedCurrencyOptions.find(
                          (c) => c.code === editPrice.currency,
                        )?.name
                      } : ${editPrice.currency} : ${
                        usedCurrencyOptions.find(
                          (c) => c.code === editPrice.currency,
                        )?.symbol
                      }`,
                      value: editPrice.currency,
                    }
                  : undefined
              }
              onChange={(
                selectedOption: { label: string; value: string } | null,
              ) => {
                setEditPrice({
                  ...editPrice,
                  currency: selectedOption?.value || "",
                  id: editPrice?.id || 0,
                  price: editPrice?.price || 0,
                  status: editPrice?.status || "",
                  createdAt: editPrice?.createdAt || "",
                  updatedAt: editPrice?.updatedAt || "",
                });
              }}
              placeholder="Select Currency"
              isSearchable
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <TextInput
              type="number"
              value={editPrice?.price}
              onChange={(e) =>
                setEditPrice({
                  ...editPrice,
                  price: e.target.value ? Number(e.target.value) : 0,
                  id: editPrice?.id || 0,
                  currency: editPrice?.currency || "",
                  status: editPrice?.status || "",
                  createdAt: editPrice?.createdAt || "",
                  updatedAt: editPrice?.updatedAt || "",
                })
              }
              className="customInput mt-4"
              placeholder="Enter Price"
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-lime-500 text-white font-medium px-4 py-2 rounded-md mr-2"
                type="submit"
              >
                Update
              </button>
              <button
                className="bg-gray-400 text-white font-medium  px-4 py-2 rounded-md"
                onClick={() => setIsEditFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {isDeletePopupOpen && (
        <CustomPopup
          title="Confirm Deletion"
          description="Are you sure you want to delete this subscription price?"
          onConfirm={handleDelete}
          onCancel={() => setDeletePopupOpen(false)}
        />
      )}
    </section>
  );
};

export default SubscriptionPrice;
