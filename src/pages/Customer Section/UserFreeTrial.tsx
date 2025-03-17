import React, { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";
import { formatDateTime } from "../../../utils/DateFormatter";
import { ErrorComp } from "../../components/ErrorComp";
import PaginationComponent from "../../components/PaginatonComponent";
import EntriesPerPage from "../../components/EntriesComp";

interface User {
  user_id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Subscription {
  subscription_id: number;
  type: string;
  credit_amount: number;
  duration: number;
  benefits: string;
  start_date: string;
  end_date: string;
}

interface SubscriptionData {
  user: User;
  subscription: Subscription;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const FreeTrialSubscriptions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, entriesPerPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${BACKEND_API_KEY}/api/admin/customer/subscriptions-free-trail`,
        {
          params: {
            page: currentPage,
            limit: entriesPerPage,
          },
        }
      );

      setSubscriptions(response.data.data.subscriptions || []);

      setPagination(response.data.data.pagination);

      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to fetch subscription data"
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        Free Trial Subscriptions
      </h1>
      <EntriesPerPage
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <ErrorComp error={error} onRetry={fetchSubscriptions} />
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">
                  User ID
                </th>
                <th scope="col" className="px-4 py-3">
                  Name
                </th>
                <th scope="col" className="px-4 py-3">
                  Email
                </th>
                <th scope="col" className="px-4 py-3">
                  Subscription Type
                </th>
                <th scope="col" className="px-4 py-3">
                  Start Date
                </th>
                <th scope="col" className="px-4 py-3">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length > 0 ? (
                subscriptions.map((item) => (
                  <tr
                    key={item.user.user_id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="p-4 text-gray-900">{item.user.user_id}</td>
                    <td className="p-4 text-gray-900">
                      {`${item.user.firstname} ${item.user.lastname}`}
                    </td>
                    <td className="p-4 text-gray-900">{item.user.email}</td>
                    <td className="p-4 text-gray-900">
                      {item.subscription.type}
                    </td>
                    <td className="p-4 text-gray-900">
                      {formatDateTime(new Date(item.subscription.start_date))}
                    </td>
                    <td className="p-4 text-gray-900">
                      {formatDateTime(new Date(item.subscription.end_date))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No free trial subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!error && subscriptions.length > 0 && (
        <p className="my-4 text-sm">
          Showing {subscriptions.length} Free Trial Subscriptions
        </p>
      )}
      <PaginationComponent
        currentPage={pagination.currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
      />
    </div>
  );
};

export default FreeTrialSubscriptions;
