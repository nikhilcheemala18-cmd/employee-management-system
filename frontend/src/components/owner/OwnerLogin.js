import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ownerLoginThunk } from '../redux/slices/ownerSlice';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import './OwnerLogin.css';

const OwnerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const { isPending, currentOwner, loginOwnerStatus, errorOccurred, errMsg } = 
    useSelector((state) => state.ownerLoginReducer);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onLogin(ownerCred) {
    dispatch(ownerLoginThunk(ownerCred));
  }

  useEffect(() => {
    if (loginOwnerStatus) {
      navigate("/ownerHome");
    }
  }, [loginOwnerStatus]);

  return (
      <div className="container-fluid">
        <div className="row min-vh-100 justify-content-center align-items-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card border-0 shadow-lg">
              {/* Card Header */}
              <div className="card-header bg-primary bg-opacity-75 text-white text-center py-4 border-0" >
                <h3 className="mb-0 fw-bold">Owner Portal</h3>
              </div>

              {/* Card Body */}
              <div className="card-body bg-body-secondary p-4 ">
                <form onSubmit={handleSubmit(onLogin)}>
                  {/* Owner ID Field */}
                  <div className="mb-4">
                    <label htmlFor="id" className="form-label text-muted fw-bold">
                      Owner ID
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FontAwesomeIcon icon={faUser} className="text-primary" />
                      </span>
                      <input
                        type="text"
                        id="id"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter your ID"
                        required
                        {...register("id")}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label text-muted fw-bold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FontAwesomeIcon icon={faLock} className="text-primary" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Enter your password"
                        required
                        {...register("password")}
                      />
                      <span 
                        className="input-group-text bg-light border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon 
                          icon={showPassword ? faEyeSlash : faEye} 
                          className="text-primary"
                        />
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary opacity-75 w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSignInAlt} />
                          Login 
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Message */}
                  {errorOccurred && (
                    <div className="alert alert-danger text-center py-2" role="alert">
                      {errMsg}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Additional Links */}
            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Need help? <a href="#" className="text-primary fw-bold">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OwnerLogin;