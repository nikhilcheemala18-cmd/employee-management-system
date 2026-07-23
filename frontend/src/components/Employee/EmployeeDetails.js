import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Building2, CircleOff, UserCheck, Users } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import { clusterServiceCenters } from "../../constants/locationData";
import DashboardPanel from "../ui/DashboardPanel";
import EmployeeCard from "../ui/EmployeeCard";
import EmptyState from "../ui/EmptyState";
import MetricBarChart from "../ui/MetricBarChart";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import { chartItems, workforceSummary } from "../../utils/dashboardMetrics";

function EmployeeDetails() {
  const navigate = useNavigate();
  const [empList, setEmpList] = useState(JSON.parse(localStorage.getItem('empList')) || []);
  const detailsForm = useForm();
  const [serviceCenters, setServiceCenters] = useState([]);
  const [selectedCluster, setCluster] = useState('');
  const clusterData = Object.keys(clusterServiceCenters);
  const summary = workforceSummary(empList);

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
        title="Employee Dashboard"
        subtitle="Monitor the workforce, then filter down to the employee records you need."
        actions={
          <button className="app-button app-button--danger" onClick={() => navigate(-1)}>
            Close
          </button>
        }
      />

      <div className="stats-grid employee-dashboard-stats">
        <StatCard icon={Users} label="Employees loaded" value={summary.total} />
        <StatCard icon={UserCheck} label="Active employees" value={summary.active} />
        <StatCard icon={CircleOff} label="Inactive employees" value={summary.inactive} />
        <StatCard icon={Building2} label="Service centers" value={new Set(empList.map((employee) => employee.serviceCenter || "Not assigned")).size} />
      </div>

      <div className="dashboard-grid dashboard-grid--employee">
        <MetricBarChart title="Team composition" subtitle="Employee count grouped by role." items={chartItems(empList, "type")} />
        <DashboardPanel eyebrow="Employee records" title="Workforce status" subtitle="Active employees are included in attendance and salary workflows.">
          <div className="workforce-status">
            <div><span className="workforce-status__dot workforce-status__dot--active" /><strong>{summary.active}</strong><small>Active</small></div>
            <div><span className="workforce-status__dot workforce-status__dot--inactive" /><strong>{summary.inactive}</strong><small>Inactive</small></div>
            <p>Use the filters below to review a specific cluster, service center, employment type, or status.</p>
          </div>
        </DashboardPanel>
      </div>

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
        <section className="employee-cards-section mt-4" aria-label="Employee cards">
          <div className="employee-cards-section__header">
            <div>
              <p>Employee directory</p>
              <h2>{empList.length} employee{empList.length === 1 ? "" : "s"} found</h2>
            </div>
            <span>Choose an employee to view or update their profile.</span>
          </div>
          <div className="employee-card-grid">
            {empList.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onViewProfile={(employee) => navigate(`/employee/${employee.id}`, { state: employee })}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-4">
          <EmptyState title="No employees loaded" message="Choose filters and fetch details to view employee records." />
        </div>
      )}
    </div>
  )
}

export default EmployeeDetails
