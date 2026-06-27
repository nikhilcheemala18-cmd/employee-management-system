import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { operatorLoginThunk } from '../redux/slices/operatorSlice';
import { useSelector, useDispatch } from 'react-redux'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const OperatorLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  let {
    register, handleSubmit,
    formState: { errors },
  } = useForm();

  let { isPending, currentOperator, loginOperatorStatus, errorOccurred, errMsg } =
    useSelector((state) => state.operatorLoginReducer);

  let dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogin(empobj) {
    // Add login logic here
    dispatch(operatorLoginThunk(empobj))
  };

  useEffect(() => {
    if (loginOperatorStatus) {
      navigate("/operatorHome");
    }
  }, [loginOperatorStatus]);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100 justify-content-center align-items-center">
        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg rounded-3">
            <div className="card-header bg-primary bg-opacity-75 text-white text-center py-4 border-0 " >
              <h3 className="fw-bold mb-0">Operator Login</h3>
            </div>
            <div className="card-body bg-body-secondary p-4">
              <form onSubmit={handleSubmit(handleLogin)}>
                <div className="mb-4">
                  <label htmlFor="id" className="form-label fw-semibold">Operator ID</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FontAwesomeIcon icon={faUser} className="text-primary" />
                    </span>
                    <input
                      type="text"
                      id="id"
                      className="form-control form-control-lg bg-light"
                      placeholder="Enter your ID"
                      {...register("id")}
                      required
                    />
                  </div>
                </div>
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
                      {...register("password")}
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
                <button type="submit" className="btn btn-primary opacity-75 btn-lg w-100 mb-4">
                  {isPending ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : 'Login'}
                </button>
              </form>
              {errorOccurred === true && (
                <div className="alert alert-danger text-center py-2 mb-0">
                  {errMsg}
                </div>
              )}
              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an account? <a href="/operatorRegister" className="text-primary text-decoration-none fw-semibold">Register</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorLogin;