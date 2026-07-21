import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { apiUrl, authHeaders } from "../../config/api";
import { clusterServiceCenters } from "../../constants/locationData";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import StatusBadge from "../ui/StatusBadge";

function EmployeeDetails() {
  const navigate = useNavigate();
  const [empList, setEmpList] = useState(JSON.parse(localStorage.getItem('empList')) || []);
  const detailsForm = useForm();
  const tableRef = useRef(null);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [selectedCluster, setCluster] = useState('');
  const clusterData = Object.keys(clusterServiceCenters);

  useEffect(() => {
    if (selectedCluster) {
      setServiceCenters(clusterServiceCenters[selectedCluster]);
    }
  }, [selectedCluster]);

  useEffect(() => {
    localStorage.setItem('empList', JSON.stringify(empList));
  }, [empList]);

  const fetchEmployees = async (data) => {
    try {
      const res = await axios.post(apiUrl('/owner-api/employeedetails/'), data, {
        headers: authHeaders(),
      });
      setEmpList(res.data.payload);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <div className="content-area mx-auto">
      <PageHeader
        title="Employee Details"
        subtitle="Filter employees by cluster, service center, type, and status."
        actions={
          <button className="app-button app-button--danger" onClick={() => navigate(-1)}>
            Close
          </button>
        }
      />

      <form className="form-panel" onSubmit={detailsForm.handleSubmit(fetchEmployees)}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Select Cluster</label>
            <select className="form-select" {...detailsForm.register("cluster")} onChange={(e) => setCluster(e.target.value)}>
              <option value="" disabled>-- Select a Cluster --</option>
              {clusterData.map((clusterName, index) => (
                <option key={index} value={clusterName}>
                  {clusterName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Select Service Center</label>
            <select className="form-select" {...detailsForm.register("serviceCenter")} disabled={!serviceCenters.length}>
              <option value="" disabled>-- Select a Service Center --</option>
              {serviceCenters.map((serviceCenter, index) => (
                <option key={index} value={serviceCenter}>
                  {serviceCenter}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Select Type</label>
            <select className="form-select" {...detailsForm.register("type")}>
              <option value="" disabled>-- Select a Type --</option>
              <option value="dlv">DLV</option>
              <option value="deo">DEO</option>
              <option value="hk">HK</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select className="form-select" {...detailsForm.register("status")}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="col-md-2">
            <button type="submit" className="app-button app-button--primary text-white w-100">
              Fetch Details
            </button>
          </div>
        </div>
      </form>

      {empList.length > 0 ? (
        <div className="table-shell mt-4">
          <div className="table-scroll">
            <table ref={tableRef} className="table table-hover text-center" style={{ tableLayout: "fixed", width: "100%" }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <th style={{ width: "150px" }}>Name</th>
                  <th style={{ width: "150px" }}>ID</th>
                  <th style={{ width: "150px" }}>Cluster</th>
                  <th style={{ width: "150px" }}>Service Center</th>
                  <th style={{ width: "150px" }}>Type</th>
                  <th style={{ width: "150px" }}>Status</th>
                  <th className="sticky-col" style={{ position: 'sticky', right: 0, width: "150px" }}>Profile</th>
                </tr>
              </thead>
              <tbody>
                {empList.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ width: "150px" }}>{emp.name}</td>
                    <td style={{ width: "150px" }}>{emp.id}</td>
                    <td style={{ width: "150px" }}>{emp.cluster}</td>
                    <td style={{ width: "150px" }}>{emp.serviceCenter}</td>
                    <td style={{ width: "150px" }}>{emp.type}</td>
                    <td style={{ width: "150px" }}><StatusBadge status={emp.status} /></td>
                    <td className="sticky-col" style={{ position: 'sticky', right: 0 }}>
                      <button
                        className="app-button app-button--soft"
                        onClick={() => navigate(`/employee/${emp.id}`, { state: emp })}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No employees loaded" message="Choose filters and fetch details to view employee records." />
        </div>
      )}
    </div>
  )
}

export default EmployeeDetails
