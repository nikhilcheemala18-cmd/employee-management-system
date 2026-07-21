import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./AdminHome.css";
import { ClipboardList, LayoutDashboard, UserPlus, Users } from "lucide-react";
import { apiUrl } from "../../config/api";
import AppShell from "../ui/AppShell";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import Toast from "../ui/Toast";

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
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  async function onRegistration(ownerObj) {
    let result = await axios.post(
      apiUrl("/admin-api/ownerregistration"),
      ownerObj
    );

    if (result.data.message === "owner created") {
      showToast("Owner created successfully");
      reset();
    } else {
      showToast(result.data.message, "error");
    }
  }

  async function getOwners() {
    let res = await axios.get(apiUrl("/admin-api/owners"));
    setOwnersList(res.data.payload);
  }

  useEffect(() => {
    if (activeTab === "owners") {
      getOwners();
    }
  }, [activeTab]);

  const handleLogout = () => {
    navigate("/");
  };

  const handleNavItemClick = (item) => {
    if (item.route) {
      navigate(item.route);
      return;
    }

    setActiveTab(item.id);
  };

  const renderDashboard = () => (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage owners and access employee operations from one workspace."
      />
      <div className="stats-grid">
        <StatCard icon={Users} label="Registered owners" value={ownersList.length} />
        <StatCard icon={UserPlus} label="Owner onboarding" value="Available" />
        <StatCard icon={ClipboardList} label="Employee tools" value="3" />
      </div>
      <div className="page-card p-4">
        <h3 className="mb-2">Welcome to the Admin Dashboard</h3>
        <p className="text-muted mb-0">
          Use the sidebar to register owners, review owner records, or jump into employee registration, details, and salary screens.
        </p>
      </div>
    </>
  );

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
