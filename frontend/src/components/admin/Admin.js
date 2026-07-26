import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { apiUrl } from "../../config/api";
import { saveAuthSession } from "../../utils/authSession";

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await axios.post(apiUrl("/admin-api/login"), { id: adminId, password });

      if (res.data.message === "Login success") {
        saveAuthSession({ role: "admin", token: res.data.token, user: res.data.admin });
        navigate(location.state?.from || "/adminHome", { replace: true });
      } else {
        setError(res.data.message || "Invalid ID or Password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid ID or Password");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100 justify-content-center align-items-center">
        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg rounded-3">
            <div className="card-header bg-primary bg-opacity-75 text-white text-center py-4 border-0 rounded-top-3" >
              <h3 className="fw-bold mb-0">Admin Login</h3>
            </div>
            <div className="card-body bg-body-secondary p-4">
              <form onSubmit={handleLogin}>
                {/* Admin ID Field */}
                <div className="mb-4">
                  <label htmlFor="adminId" className="form-label fw-semibold">Admin ID</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FontAwesomeIcon icon={faUser} className="text-primary" />
                    </span>
                    <input
                      type="text"
                      id="adminId"
                      className="form-control form-control-lg bg-light"
                      placeholder="Enter Admin ID"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FontAwesomeIcon icon={faLock} className="text-primary" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control form-control-lg bg-light"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="input-group-text bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="text-primary"
                      />
                    </span>
                  </div>
                </div>

                {/* Login Button */}
                <button type="submit" className="btn btn-primary opacity-75 btn-lg w-100 mb-4" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </button>
              </form>

              {/* Error Message */}
              {(error || location.state?.authMessage) && (
                <div className="alert alert-danger text-center py-2 mb-0">
                  {error || location.state?.authMessage}
                </div>
              )}

              {/* Additional Links (Optional) */}
              <div className="text-center mt-4">
                <p className="mb-0">
                  Forgot password? <a href="/reset-password" className="text-primary  text-decoration-none fw-semibold">Reset</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
