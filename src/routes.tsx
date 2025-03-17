import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import NavbarSidebarLayout from "./layouts/navbar-sidebar";
import DashboardPage from "./pages/Dashboard";
import SignInPage from "./pages/authentication/sign-in";
import SubscriptionPage from "./pages/Master/SubscriptionPage";
import BannerPage from "./pages/Master/BannerPage";
import AdsPage from "./pages/Master/AdsPage";
import CreditMaster from "./pages/Master/CreditMaster";
import Category from "./pages/Product Master/Category";
import SubCategory from "./pages/Product Master/SubCategory";
import ProductForm from "./pages/Product Master/ProductForm";
import PackingType from "./pages/Product Master/PackingType";
import PackagingMachine from "./pages/Product Master/PackagingMachine";
import PackagingTreatment from "./pages/Product Master/PackagingTreatment";
import StorageCondition from "./pages/Product Master/StorageCondition";
import MeasurementUnit from "./pages/Product Master/MeasurementUnit";
import Product from "./pages/Product Master/Product";
import PackagingMaterial from "./pages/Product Master/PackagingMaterial";
import PackagingSolution from "./pages/Product Master/PackagingSolution";
import CustomerEnquiry from "./pages/Customer Section/CustomerEnquiry";
import CreditPurchase from "./pages/Customer Section/CreditPurchase";
import Refer from "./pages/Customer Section/Refer";
import UserList from "./pages/Customer Section/UserList";
import UserAddresses from "./pages/Customer Section/UserAddresses";
import UserSubscription from "./pages/Customer Section/UserSubscription";
import ManageStaff from "./pages/Staff/ManageStaff";
import Settings from "./pages/GeneralSettings/settings";
import Customer from "./pages/Contact Us/Customer";
import SystemDetails from "./pages/Contact Us/SystemDetails";
import NoAccess from "./NoAccess";
import NotFoundPage from "./404Page";
import VerifyOtpPage from "./pages/authentication/ForgetPassword";
import ForgotPassword from "./pages/authentication/ForgetPassword";
import TermsandCondition from "./pages/Developer Settings/TermsandCondition";
import PrivacyPolicy from "./pages/Developer Settings/PrivacyPolicy";
import RedemRefer from "./pages/Customer Section/RedemRefer";
import Redirect from "./Redirect";
import FreeTrialSubscriptions from "./pages/Customer Section/UserFreeTrial";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Redirect />} />
    <Route path="/admin/login" element={<SignInPage />} />
    <Route path="/admin/forgot-password" element={<ForgotPassword />} />
    <Route path="/admin/update-password" element={<VerifyOtpPage />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <DashboardPage />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* Master routes */}
    <Route
      path="/admin/master/subscription"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <SubscriptionPage />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/master/banner"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <BannerPage />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/master/ads"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <AdsPage />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/master/credit-master"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <CreditMaster />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* Product Master routes */}
    <Route
      path="/admin/product-master/category"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <Category />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/subcategory"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <SubCategory />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/product-form"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <ProductForm />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/packing-type"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <PackingType />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/packaging-machine"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <PackagingMachine />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/packaging-treatment"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <PackagingTreatment />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/storage-condition"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <StorageCondition />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/measurement-unit"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <MeasurementUnit />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/product"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <Product />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/packaging-material"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <PackagingMaterial />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/product-master/packaging-solutions"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <PackagingSolution />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* Customer Section */}

    <Route
      path="/admin/customer-section/refer"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <Refer />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/redeem-refer"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <RedemRefer />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/user-list"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <UserList />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/user-address-list"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <UserAddresses />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/user-subscription"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <UserSubscription />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/user-free-trail"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <FreeTrialSubscriptions />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/credit-purchase"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <CreditPurchase />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customer-section/enquiry"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <CustomerEnquiry />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/contact-us/customer"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <Customer />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/contact-us/system-details"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <SystemDetails />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* Staff Section */}
    <Route
      path="/admin/staff"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <ManageStaff />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* General Settings */}
    <Route
      path="/admin/general-settings"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <Settings />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* Developer Settings */}
    <Route
      path="/admin/developer-settings/terms-and-condition"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <TermsandCondition />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/developer-settings/privacy-policy"
      element={
        <ProtectedRoute>
          <NavbarSidebarLayout>
            <PrivacyPolicy />
          </NavbarSidebarLayout>
        </ProtectedRoute>
      }
    />
    {/* No Access */}
    <Route path="/admin/no-access" element={<NoAccess />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
