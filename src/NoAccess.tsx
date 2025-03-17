import { useNavigate } from "react-router-dom";

const NoAccess = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/admin");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">No Access</h1>
      <p className="text-lg mb-6">
        You do not have permission to view this page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={goToHome}
          className="px-6 py-3 bg-lime-500 text-black rounded-lg shadow-md hover:bg-lime-700 transition duration-300"
        >
          Go to Home
        </button>
        <button
          onClick={logout}
          className="px-6 py-3 bg-lime-500 text-black rounded-lg shadow-md hover:bg-lime-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NoAccess;
