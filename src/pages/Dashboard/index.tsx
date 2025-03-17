import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import type { FC } from "react";
import Chart from "react-apexcharts";
import { FiUser } from "react-icons/fi";
import api from "../../../utils/axiosInstance";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";

const CustomCard = function ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-[#fff] shadow rounded-xl w-full flex flex-col justify-start">
      <p className="font-normal text-slate-500 text-sm">{title}</p>
      <div className="flex justify-between items-end w-full mt-2">
        <p className="font-semibold text-xl">{value}</p>
        <div className="mr-2 text-2xl">{icon}</div>
      </div>
    </div>
  );
};

const DashboardPage: FC = function () {
  const [totalUsers, setTotalUsers] = useState("0");
  const [freeSubscriptions, setFreeSubscriptions] = useState("0");
  const [paidSubscriptions, setPaidSubscriptions] = useState("0");
  const [activeSubscriptions, setActiveSubscriptions] = useState("0");
  const [signupsFromReferrals, setSignupsFromReferrals] = useState("0");
  const [totalEnquiries, setTotalEnquiries] = useState("0");
  const [subscriptionsFromReferral, setSubscriptionsFromReferral] =
    useState("0");
  const [userComparison, setUserComparison] = useState([0, 0]);
  const [referralTaskCompletion, setReferralTaskCompletion] = useState([0, 0]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.allSettled([
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/total-users`),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/total-free-subscriptions`),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/total-paid-subscriptions`),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/total-active-subscriptions`),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/total-signups-referrals`),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/total-enquiries`),
        api.get(
          `${BACKEND_API_KEY}/api/admin/dashboard/total-subscriptions-referral-signups`
        ),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/user-comparison`),
        api.get(`${BACKEND_API_KEY}/api/admin/dashboard/referral-task-completion`),
      ]);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const data = result.value.data.data;
          switch (index) {
            case 0:
              setTotalUsers(data.totalCount);
              break;
            case 1:
              setFreeSubscriptions(data.totalCount);
              break;
            case 2:
              setPaidSubscriptions(data.totalCount);
              break;
            case 3:
              setActiveSubscriptions(data.totalCount);
              break;
            case 4:
              setSignupsFromReferrals(data.totalCount);
              break;
            case 5:
              setTotalEnquiries(data.totalCount);
              break;
            case 6:
              setSubscriptionsFromReferral(data.totalCount);
              break;
            case 7:
              setUserComparison([data.referredUsers, data.normalUsers]);
              break;
            case 8:
              setReferralTaskCompletion([
                data.accountsCreated,
                data.subscriptionsBought,
              ]);
              break;
            default:
              break;
          }
        } else {
          console.error(
            `Failed to fetch data for index ${index}`,
            result.reason
          );
        }
      });
    };

    fetchData();
  }, []);
  const userComparisonChartOptions: ApexOptions = {
    chart: {
      type: "bar",
    },
    xaxis: {
      categories: ["Referred Users", "Normal Users"],
    },
    series: [
      {
        name: "Users",
        data: userComparison,
      },
    ],
  };

  const referralTaskCompletionChartOptions: ApexOptions = {
    chart: {
      type: "bar",
    },
    xaxis: {
      categories: ["Accounts Created", "Subscriptions Bought"],
    },
    series: [
      {
        name: "Users",
        data: referralTaskCompletion,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <p className="text-2xl font-bold capitalize px-10 my-6">
        Welcome to the dashboard 🚀
      </p>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10 px-10">
        <CustomCard title="Total Users" value={totalUsers} icon={<FiUser />} />
        <CustomCard
          title="Total Free Subscriptions"
          value={freeSubscriptions}
          icon={<FiUser />}
        />
        <CustomCard
          title="Total Paid Subscriptions"
          value={paidSubscriptions}
          icon={<FiUser />}
        />
        <CustomCard
          title="Total Active Subscriptions"
          value={activeSubscriptions}
          icon={<FiUser />}
        />
        <CustomCard
          title="Total Signup from Referral"
          value={signupsFromReferrals}
          icon={<FiUser />}
        />
        <CustomCard
          title="Total No. of Enquiries"
          value={totalEnquiries}
          icon={<FiUser />}
        />
        <CustomCard
          title="Total Subscription From Referral Users"
          value={subscriptionsFromReferral}
          icon={<FiUser />}
        />
      </section>

      <section className="flex justify-between">
        <div className="mt-10 px-10 bg-white rounded-lg shadow-md p-4 mx-8 w-[45%]">
          <h3 className="text-xl font-bold">User Comparison</h3>
          <Chart
            options={userComparisonChartOptions}
            series={userComparisonChartOptions.series}
            type="bar"
            height={350}
          />
        </div>
        <div className="mt-10 px-10 bg-white rounded-lg shadow-md p-4 mx-8 w-[45%]">
          <h3 className="text-xl font-bold">Referral Task Completion</h3>
          <Chart
            options={referralTaskCompletionChartOptions}
            series={referralTaskCompletionChartOptions.series}
            type="bar"
            height={350}
          />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
