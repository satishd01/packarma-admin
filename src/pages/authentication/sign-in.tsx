import { Button, Card, Label, Spinner } from "flowbite-react";
import type { FC } from "react";
import { useState } from "react";
import api from "../../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_API_KEY } from "../../../utils/ApiKey";

const SignInPage: FC = function () {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post('/api/admin/auth/login', {
        emailid: email,
        password,
      });
      if (response.data.statusCode === 401) {
        setError("Invalid email or password");
        return;
      } else if (response.data.data.status === "inactive") {
        setError("Your account is inactive. Please contact admin.");
        setLoading(false);
        return;
      } else {
        localStorage.setItem("token", response.data.data.token);
        navigate("/admin");
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error?.response?.data?.message || "Something went wrong");
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex items-center flex-col justify-center mb-8">
          <img alt="Logo" src="/logo.jpg" className="h-20 mb-3" />
          <span className="text-2xl font-semibold dark:text-white">
            Packarma Admin
          </span>
        </div>
        <Card className="w-full">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500">{error}</div>}
            <div className="mb-4 flex flex-col gap-y-3">
              <Label htmlFor="email">Email</Label>
              <input
                className="customInput block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-lime-500 focus:ring-lime-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-lime-500 dark:focus:ring-lime-500 rounded-lg p-2.5 text-sm"
                id="email"
                name="email"
                placeholder="name@xyz.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6 flex flex-col gap-y-3">
              <Label htmlFor="password">Password</Label>
              <input
                className="customInput block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-lime-500 focus:ring-lime-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-lime-500 dark:focus:ring-lime-500 rounded-lg p-2.5 text-sm"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6 w-full flex justify-center items-center">
              <Button
                type="submit"
                className="w-full lg:w-auto bg-lime-500 disabled:bg-lime-500 hover:bg-lime-500 text-black font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" light={true} />
                ) : (
                  "Login to your account"
                )}
              </Button>
            </div>
          </form>
        </Card>
        <div className="mt-4">
          <Link to="/admin/forgot-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
