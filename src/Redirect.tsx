import { useEffect } from "react";

const Redirect = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRedirect();
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = () => {
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Redirecting to Packarma App</h1>
    </div>
  );
};

export default Redirect;
