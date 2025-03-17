import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiChartPie, HiUsers } from "react-icons/hi";
import { VscDebugBreakpointDataUnverified } from "react-icons/vsc";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { IconType } from "react-icons";
import { RiSettings4Line } from "react-icons/ri";
import { FiHeadphones } from "react-icons/fi";
import { useUser } from "../context/userContext";
import { MdDeveloperMode } from "react-icons/md";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

interface MenuItem {
  name: string;
  path: string;
  icon: IconType;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/admin", icon: HiChartPie },
  {
    name: "Master",
    path: "/admin/master",
    icon: HiOutlineSquares2X2,
    submenu: [
      {
        name: "Subscription",
        path: "/admin/master/subscription",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Banner",
        path: "/admin/master/banner",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Ads",
        path: "/admin/master/ads",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Credit Master",
        path: "/admin/master/credit-master",
        icon: VscDebugBreakpointDataUnverified,
      },
    ],
  },
  {
    name: "Product Master",
    path: "/admin/product-master",
    icon: HiOutlineSquares2X2,
    submenu: [
      {
        name: "Category",
        path: "/admin/product-master/category",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Sub Category",
        path: "/admin/product-master/subcategory",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Product Form",
        path: "/admin/product-master/product-form",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Packing Type",
        path: "/admin/product-master/packing-type",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Packaging Machine",
        path: "/admin/product-master/packaging-machine",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Packaging Treatment",
        path: "/admin/product-master/packaging-treatment",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Storage Condition",
        path: "/admin/product-master/storage-condition",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Measurement Unit",
        path: "/admin/product-master/measurement-unit",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Product",
        path: "/admin/product-master/product",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Packaging Material",
        path: "/admin/product-master/packaging-material",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Packaging Solutions",
        path: "/admin/product-master/packaging-solutions",
        icon: VscDebugBreakpointDataUnverified,
      },
    ],
  },
  {
    name: "Customer Section",
    path: "/admin/customer-section",
    icon: HiUsers,
    submenu: [
      {
        name: "User List",
        path: "/admin/customer-section/user-list",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "User Address List",
        path: "/admin/customer-section/user-address-list",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Refer",
        path: "/admin/customer-section/refer",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Redeem Refer",
        path: "/admin/customer-section/redeem-refer",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "User Subscription",
        path: "/admin/customer-section/user-subscription",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "User Free Trail",
        path: "/admin/customer-section/user-free-trail",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Credit Purchase",
        path: "/admin/customer-section/credit-purchase",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Customer Enquiry",
        path: "/admin/customer-section/enquiry",
        icon: VscDebugBreakpointDataUnverified,
      },
    ],
  },
  {
    name: "Staff",
    path: "/admin/staff",
    icon: HiUsers,
  },
  {
    name: "Contact Us",
    path: "/admin/contact-us",
    icon: FiHeadphones,
    submenu: [
      {
        name: "Customer",
        path: "/admin/contact-us/customer",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "System Details",
        path: "/admin/contact-us/system-details",
        icon: VscDebugBreakpointDataUnverified,
      },
    ],
  },
  {
    name: "General Settings",
    path: "/admin/general-settings",
    icon: RiSettings4Line,
  },
  {
    name: "Developer Settings",
    path: "/admin/devloper-settings",
    icon: MdDeveloperMode,
    submenu: [
      {
        name: "Terms and Condition",
        path: "/admin/developer-settings/terms-and-condition",
        icon: VscDebugBreakpointDataUnverified,
      },
      {
        name: "Privacy Policy",
        path: "/admin/developer-settings/privacy-policy",
        icon: VscDebugBreakpointDataUnverified,
      },
    ],
  },
];

const SidebarComponent: FC = function () {
  const [currentPage, setCurrentPage] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userContext = useUser();
  const user = userContext?.user;

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  const hasPermission = (name: string) => {
    return user?.permissions?.some(
      (permission) => permission.page_name === name
    );
  };

  const toggleSubmenu = (path: string) => {
    setOpenSubmenus((prev) => (prev.includes(path) ? [] : [path]));
  };

  const isSubmenuOpen = (path: string) => openSubmenus.includes(path);

  const renderMenuItem = (item: MenuItem) => (
    <div key={item.path}>
      {item.submenu ? (
        <div>
          <div
            className={`flex items-center text-gray-800 justify-between p-2 cursor-pointer rounded-lg mt-2 ${
              currentPage.startsWith(item.path) ? "bg-gray-100" : ""
            }`}
            onClick={() => toggleSubmenu(item.path)}
          >
            <div className="flex items-center">
              <item.icon className="w-6 h-6 mr-2 text-gray-800" />
              <span>{item.name}</span>
            </div>
            <div>
              {isSubmenuOpen(item.path) ? (
                <BiChevronDown className="w-6 h-6" />
              ) : (
                <BiChevronUp className="w-6 h-6" />
              )}
            </div>
          </div>{" "}
          <div
            className={`ml-4 transition-all duration-300 ${
              isSubmenuOpen(item.path) ? "block" : "hidden"
            }`}
          >
            {item.submenu.map((item) => (
              <div
                key={item.path}
                className={`flex items-center text-gray-800 justify-start p-2 cursor-pointer rounded-lg mt-2 ${
                  item.path === currentPage
                    ? "bg-lime-500"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => navigateToPage(item.path)}
              >
                <item.icon
                  className={`w-5 h-5 mr-2 ${
                    item.path === currentPage
                      ? "text-gray-900"
                      : "text-gray-700"
                  }`}
                />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`flex items-center text-gray-800 justify-start p-3 cursor-pointer rounded-lg mt-2 ${
            item.path === currentPage ? "bg-lime-500" : "hover:bg-gray-100"
          }`}
          onClick={() => navigateToPage(item.path)}
        >
          <item.icon
            className={`w-6 h-6 mr-2 ${
              item.path === currentPage ? "text-gray-900" : "text-gray-700"
            }`}
          />
          <span>{item.name}</span>
        </div>
      )}
    </div>
  );

  const navigateToPage = (path: string) => {
    if (path === currentPage) {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="w-[26%] select-none h-[100vh] overflow-x-hidden sidebar-hidden bg-white border-r pt-16">
      <div className="flex flex-col p-2">
        {menuItems
          .filter((item) => hasPermission(item.name))
          .map(renderMenuItem)}
      </div>
    </div>
  );
};

export default SidebarComponent;
