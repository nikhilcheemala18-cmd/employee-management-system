import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./AdminHome.css";
import { CalendarCheck, ClipboardList, LayoutDashboard, UserCheck, UserPlus, Users } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import AppShell from "../ui/AppShell";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import Toast from "../ui/Toast";
import DashboardPanel from "../ui/DashboardPanel";
import MetricBarChart from "../ui/MetricBarChart";
import { chartItems, workforceSummary } from "../../utils/dashboardMetrics";
import { clearAuthSession } from "../../utils/authSession";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "registration", label: "Owner Registration", icon: UserPlus },
  { id: "owners", label: "Owners", icon: Users },
  { id: "employeeRegistration", label: "Employee Registration", icon: UserPlus, route: "/employeeRegistration" },
  { id: "employeeDetails", label: "Employee Details", icon: ClipboardList, route: "/employeeDetails" },
  { id: "employeeSalaryDetails", label: "Salary Details", icon: ClipboardList, route: "/employeesalaryDetails" },
];

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [ownersList, setOwnersList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  async function onRegistration(ownerObj) {
    let result = await axios.post(
      apiUrl("/admin-api/ownerregistration"),
      ownerObj,
      { headers: authHeaders() }
    );

    if (result.data.message === "owner created") {
      showToast("Owner created successfully");
      reset();
    } else {
      showToast(result.data.message, "error");
    }
  }

  const getOwners = useCallback(async () => {
    try {
      const res = await axios.get(apiUrl("/admin-api/owners"), { headers: authHeaders() });
      setOwnersList(res.data.payload || []);
    } catch (error) {
      showToast("Unable to load owner records", "error");
    }
  }, []);

  const getDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const [ownersResponse, employeesResponse] = await Promise.all([
        axios.get(apiUrl("/admin-api/owners"), { headers: authHeaders() }),
        axios.post(apiUrl("/owner-api/employeedetails/"), { status: "all" }, { headers: authHeaders() }),
      ]);
      setOwnersList(ownersResponse.data.payload || []);
      setEmployees(employeesResponse.data.payload || []);
    } catch (error) {
      showToast("Some dashboard data could not be loaded", "error");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  useEffect(() => {
    if (activeTab === "owners") {
      getOwners();
    }
  }, [activeTab, getOwners]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/adminLogin", { replace: true });
  };

  const handleNavItemClick = (item) => {
    if (item.route) {
      navigate(item.route);
      return;
    }

    setActiveTab(item.id);
  };

  const renderDashboard = () => {
    const summary = workforceSummary(employees);
    const recentEmployees = [...employees]
      .sort((first, second) => String(second.dateOfJoining || "").localeCompare(String(first.dateOfJoining || "")))
      .slice(0, 5);

    return (
      <>
        <PageHeader
          title="Admin Dashboard"
          subtitle="A live view of workforce coverage, owner access, and key HR operations."
          actions={<button className="app-button app-button--soft" onClick={getDashboardData}>Refresh data</button>}
        />
        <div className="stats-grid">
          <StatCard icon={Users} label="Total workforce" value={dashboardLoading ? "..." : summary.total} />
          <StatCard icon={UserCheck} label="Active employees" value={dashboardLoading ? "..." : summary.active} />
          <StatCard icon={UserPlus} label="Registered owners" value={dashboardLoading ? "..." : ownersList.length} />
        </div>

        <div className="dashboard-grid dashboard-grid--primary">
          <MetricBarChart
            title="Workforce by cluster"
            subtitle="Largest employee groups across service regions."
            items={chartItems(employees, "cluster")}
            emptyMessage="Employee data will appear here once records are available."
          />
          <DashboardPanel eyebrow="Administration" title="Quick actions" subtitle="Start the most common HR administration tasks.">
            <div className="quick-actions">
              <button className="quick-action" onClick={() => setActiveTab("registration")}>
                <span className="quick-action__icon"><UserPlus size={19} /></span>
                <span><strong>Add an owner</strong><small>Create portal access for an owner.</small></span>
              </button>
              <button className="quick-action" onClick={() => navigate("/employeeRegistration")}>
                <span className="quick-action__icon"><Users size={19} /></span>
                <span><strong>Register employee</strong><small>Add an individual or import a workforce file.</small></span>
              </button>
              <button className="quick-action" onClick={() => navigate("/employeeSalaryDetails")}>
                <span className="quick-action__icon"><CalendarCheck size={19} /></span>
                <span><strong>Prepare payroll</strong><small>Review monthly attendance-linked wages.</small></span>
              </button>
            </div>
          </DashboardPanel>
        </div>

        <DashboardPanel
          className="dashboard-card--table"
          eyebrow="Latest workforce records"
          title="Recently added employees"
          subtitle="A quick operational snapshot of the latest employee records."
          actions={<button className="app-button app-button--soft" onClick={() => navigate("/employeeDetails")}>View all employees</button>}
        >
          {recentEmployees.length ? (
            <div className="dashboard-table-wrap">
              <table className="table table-hover dashboard-table">
                <thead><tr><th>Employee</th><th>Location</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>{recentEmployees.map((employee) => <tr key={employee.id}><td><strong>{employee.name}</strong><span>{employee.id}</span></td><td>{employee.serviceCenter || "-"}<span>{employee.cluster || "-"}</span></td><td>{String(employee.type || "-").toUpperCase()}</td><td><span className={`status-badge ${employee.status === "Inactive" ? "status-badge--inactive" : "status-badge--active"}`}>{employee.status || "Active"}</span></td></tr>)}</tbody>
              </table>
            </div>
          ) : <p className="dashboard-card__empty">No employee records available yet.</p>}
        </DashboardPanel>
      </>
    );
  };

  const renderRegistration = () => (
    <>
      <PageHeader
        title="Register Owner"
        subtitle="Create a new owner login for the HRM system."
      />
      <form className="form-panel" onSubmit={handleSubmit(onRegistration)}>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" id="name" className="form-control" placeholder="Enter owner name" required {...register("name")} />
          </div>
          <div className="col-md-6">
            <label htmlFor="id" className="form-label">ID</label>
            <input type="text" id="id" className="form-control" placeholder="Enter ID" required {...register("id")} />
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" className="form-control" placeholder="Enter email" required {...register("email")} />
          </div>
          <div className="col-md-6">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" id="password" className="form-control" placeholder="Enter password" required {...register("password")} />
          </div>
        </div>
        <button type="submit" className="app-button app-button--primary text-white mt-4">Register Owner</button>
      </form>
    </>
  );

  const renderOwners = () => (
    <>
      <PageHeader
        title="Owners"
        subtitle="All owners currently registered in the system."
      />
      {ownersList.length === 0 ? (
        <EmptyState title="No owners found" message="Owner records will appear here after registration." />
      ) : (
        <div className="table-shell">
          <div className="table-scroll">
            <table className="table table-hover text-center">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {ownersList.map((owner, index) => (
                  <tr key={index}>
                    <td>{owner.name}</td>
                    <td>{owner.id}</td>
                    <td>{owner.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    if (activeTab === "registration") return renderRegistration();
    if (activeTab === "owners") return renderOwners();
    return renderDashboard();
  };

  return (
    <>
      <AppShell
        title="Admin Workspace"
        subtitle="System administration and owner management"
        navItems={navItems}
        activeItem={activeTab}
        onNavItemClick={handleNavItemClick}
        onLogout={handleLogout}
      >
        {renderContent()}
      </AppShell>
      <Toast message={toast?.message} type={toast?.type} />
    </>
  );
};

export default AdminHome;
