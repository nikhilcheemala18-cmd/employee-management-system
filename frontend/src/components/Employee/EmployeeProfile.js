import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/api";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import StatusBadge from "../ui/StatusBadge";
import Toast from "../ui/Toast";

const EmployeeProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const employee = location.state;

  const [formData, setFormData] = useState({ ...employee });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  if (!employee) {
    return (
      <div className="content-area mx-auto">
        <EmptyState title="Employee not found" message="Return to employee details and open a profile again." />
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(
        apiUrl(`/owner-api/employees/${formData.id}`),
        formData
      );
      showToast("Employee details updated successfully");
      setIsEditing(false);
    } catch (error) {
      showToast("Error updating employee details. Please try again.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="content-area mx-auto">
      <PageHeader
        title="Employee Profile"
        subtitle={`${formData.name || "Employee"} - ${formData.id || ""}`}
        actions={
          <>
            <StatusBadge status={formData.status} />
            <button className="app-button app-button--danger" onClick={() => navigate(-1)}>Go Back</button>
          </>
        }
      />

      <div className="form-panel">
        <section className="mb-4">
          <h5 className="text-primary mb-3">Personal Details</h5>
          <div className="profile-grid">
            <label>
              <strong>Name</strong>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Email</strong>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Aadhar</strong>
              <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>PAN</strong>
              <input type="text" name="pan" value={formData.pan} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
          </div>
        </section>

        <section className="mb-4">
          <h5 className="text-primary mb-3">Employment Details</h5>
          <div className="profile-grid">
            <label>
              <strong>Cluster</strong>
              <input type="text" name="cluster" value={formData.cluster} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Service Center</strong>
              <input type="text" name="serviceCenter" value={formData.serviceCenter} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Daily Wage</strong>
              <input type="number" name="dailyWage" value={formData.dailyWage} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Basic</strong>
              <input type="number" name="basic" value={formData.basic} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Status</strong>
              <select name="status" value={formData.status} onChange={handleChange} className="form-select mt-1" disabled={!isEditing}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <h5 className="text-primary mb-3">Bank Details</h5>
          <div className="profile-grid">
            <label>
              <strong>Account Number</strong>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>Bank Name</strong>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
            <label>
              <strong>IFSC Code</strong>
              <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} className="form-control mt-1" disabled={!isEditing} />
            </label>
          </div>
        </section>

        <div className="d-flex flex-wrap justify-content-end gap-2 mt-4 pt-4 border-top">
          {!isEditing ? (
            <button className="app-button app-button--soft" onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <>
              <button className="app-button app-button--primary text-white" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button className="app-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          )}
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
};

export default EmployeeProfile;
