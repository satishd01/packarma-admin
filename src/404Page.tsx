import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/admin");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <p className="text-2xl text-gray-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button
        onClick={goHome}
        className="px-6 py-3 text-lg text-black bg-lime-500 rounded hover:bg-lime-700"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFoundPage;
