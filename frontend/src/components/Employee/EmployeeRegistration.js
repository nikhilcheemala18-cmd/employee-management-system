import { useForm } from 'react-hook-form';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { Upload, UserPlus } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import { clusterServiceCenters } from "../../constants/locationData";
import PageHeader from "../ui/PageHeader";
import Toast from "../ui/Toast";

const EmployeeRegistration = () => {
  const registrationForm = useForm();
  const { formState: { errors } } = registrationForm;
  const navigate = useNavigate();
  const [serviceCenters, setServiceCenters] = useState([]);
  const [selectedCluster, setCluster] = useState('');
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState(null);
  const clusterData = Object.keys(clusterServiceCenters);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (selectedCluster) {
      setServiceCenters(clusterServiceCenters[selectedCluster]);
    }
  }, [selectedCluster]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const onRegistration = async (empObj) => {
    try {
      const res = await axios.post(apiUrl('/owner-api/addemployee'), empObj, {
        headers: authHeaders(),
      });

      if (res.data.message === 'Employee registration success') {
        registrationForm.reset();
      }
      showToast(res.data.message, res.data.message === 'Employee registration success' ? "success" : "error");
    } catch (error) {
      showToast('Error registering employee', "error");
    }
  };

  async function handleFileUpload() {
    if (!file) {
      showToast("Please select a file", "error");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length < 2) {
          showToast("Empty or invalid file structure", "error");
          return;
        }

        const headers = rows[0];
        const formattedData = rows.slice(1).map((row) => {
          let obj = {};
          headers.forEach((key, index) => {
            obj[key] = row[index] || "";
          });
          obj['status'] = "Active";
          return obj;
        });

        const result = await axios.post(
          apiUrl("/admin-api/employees"),
          formattedData,
          { headers: authHeaders() }
        );
        showToast(result.data.message);
      } catch (error) {
        showToast("Error processing file", "error");
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="content-area mx-auto">
      <PageHeader
        title="Register a New Employee"
        subtitle="Add personal, bank, location, and salary details for a new employee."
        actions={
          <button className="app-button app-button--danger" onClick={() => navigate(-1)}>
            Close
          </button>
        }
      />

      <form onSubmit={registrationForm.handleSubmit(onRegistration)} className="form-panel">
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="stat-card__icon"><UserPlus size={20} /></div>
          <div>
            <h3 className="mb-1">Employee Information</h3>
            <p className="text-muted mb-0">Fields and validation rules match the existing registration flow.</p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Employee ID</label>
            <input type="text" className="form-control" placeholder="Enter Employee ID" {...registrationForm.register("id", { required: "Employee ID is required" })} />
            {errors.id && <div className="text-danger">{errors.id.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" placeholder="Enter Employee Name" {...registrationForm.register("name", { required: "Employee name is required" })} />
            {errors.name && <div className="text-danger">{errors.name.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter Email" {...registrationForm.register("email", { required: "Email is required" })} />
            {errors.email && <div className="text-danger">{errors.email.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Date of Joining</label>
            <input type="date" className="form-control" {...registrationForm.register("dateOfJoining", { required: "Date of joining is required" })} />
            {errors.dateOfJoining && <div className="text-danger">{errors.dateOfJoining.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Aadhar Number</label>
            <input type="number" className="form-control" placeholder="Enter Aadhar Number" maxLength={12} {...registrationForm.register("aadhar", { required: "Aadhar number is required", pattern: {
              value: /^[0-9]{12}$/,
              message: "Aadhar number must be exactly 12 digits"
            }})} />
            {errors.aadhar && <div className="text-danger">{errors.aadhar.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">PAN Number</label>
            <input type="text" className="form-control" placeholder="Enter PAN Number" {...registrationForm.register("pan", { required: "PAN number is required" })} />
            {errors.pan && <div className="text-danger">{errors.pan.message}</div>}
          </div>
        </div>

        <fieldset className="border p-3 mt-4 rounded">
          <legend className="w-auto px-2">Account Details</legend>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Account Number</label>
              <input type="text" className="form-control" placeholder="Enter Account Number" {...registrationForm.register("accountNumber", { required: "Account number is required" })} />
              {errors.accountNumber && <div className="text-danger">{errors.accountNumber.message}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Bank Name</label>
              <input type="text" className="form-control" placeholder="Enter Bank Name" {...registrationForm.register("bankName", { required: "Bank name is required" })} />
              {errors.bankName && <div className="text-danger">{errors.bankName.message}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">IFSC Code</label>
              <input type="text" className="form-control" placeholder="Enter IFSC Code" {...registrationForm.register("ifsc", { required: "IFSC code is required" })} />
              {errors.ifsc && <div className="text-danger">{errors.ifsc.message}</div>}
            </div>
          </div>
        </fieldset>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label className="form-label">Select Cluster</label>
            <select className="form-select" {...registrationForm.register("cluster")} onChange={(e) => setCluster(e.target.value)} required>
              <option value="" disabled>-- Select a Cluster --</option>
              {clusterData.map((clusterName, index) => (
                <option key={index} value={clusterName}>
                  {clusterName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Select Service Center</label>
            <select className="form-select" {...registrationForm.register("serviceCenter")} required disabled={!serviceCenters.length}>
              <option value="" disabled>-- Select a Service Center --</option>
              {serviceCenters.map((serviceCenter, index) => (
                <option key={index} value={serviceCenter}>
                  {serviceCenter}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Type</label>
            <select className="form-select" {...registrationForm.register("type", { required: "Type is required" })}>
              <option value="" disabled>Select Type</option>
              <option value="hk">HK</option>
              <option value="dlv">DLV</option>
              <option value="deo">DEO</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Daily wage</label>
            <input type="number" className="form-control" placeholder="Enter Daily wage" {...registrationForm.register("dailyWage", { required: "Daily wage is required" })} />
            {errors.dailyWage && <div className="text-danger">{errors.dailyWage.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Basic Salary</label>
            <input type="number" className="form-control" placeholder="Enter Basic" {...registrationForm.register("basic", { required: "Basic Salary is required" })} />
            {errors.basic && <div className="text-danger">{errors.basic.message}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">PF</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" value="yes" {...registrationForm.register("pf", { required: "PF selection is required" })} />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" value="no" {...registrationForm.register("pf", { required: "PF selection is required" })} />
                <label className="form-check-label">No</label>
              </div>
            </div>
            {errors.pf && <div className="text-danger">{errors.pf.message}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">ESIC</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" value="yes" {...registrationForm.register("esic", { required: "ESIC selection is required" })} />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" value="no" {...registrationForm.register("esic", { required: "ESIC selection is required" })} />
                <label className="form-check-label">No</label>
              </div>
            </div>
            {errors.esic && <div className="text-danger">{errors.esic.message}</div>}
          </div>
        </div>

        <button type="submit" className="app-button app-button--primary text-white w-100 mt-4">Register Employee</button>
      </form>

      <div className="upload-panel">
        <Upload size={30} className="text-primary mb-2" />
        <h4 className="mb-2">Upload Employees</h4>
        <p className="text-muted">Upload an Excel file to bulk import employees.</p>
        <label className="app-button app-button--soft mb-3">
          Select File
          <input type="file" accept=".xlsx, .xls" className="d-none" onChange={handleFileChange} />
        </label>
        {file && <p className="text-muted mb-3">{file.name}</p>}
        <button className="app-button app-button--primary text-white" onClick={handleFileUpload}>
          Upload
        </button>
      </div>
      <Toast message={toast?.message} type={toast?.type} />
    </div>
  )
}

export default EmployeeRegistration
