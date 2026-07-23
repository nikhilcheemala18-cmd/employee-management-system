import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { resetState } from '../redux/slices/ownerSlice';
import { ClipboardList, LayoutDashboard, UserCheck, UserPlus, Users, WalletCards } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import AppShell from "../ui/AppShell";
import ConfirmDialog from "../ui/ConfirmDialog";
import DashboardPanel from "../ui/DashboardPanel";
import MetricBarChart from "../ui/MetricBarChart";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import Toast from "../ui/Toast";
import { chartItems, workforceSummary } from "../../utils/dashboardMetrics";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "registration", label: "Employee Registration", icon: UserPlus, route: "/employeeRegistration" },
  { id: "employeesalarydetails", label: "Employee Salary Details", icon: WalletCards, route: "/employeesalaryDetails" },
  { id: "employeedetails", label: "Employee Details", icon: ClipboardList, route: "/employeeDetails" },
];

const OwnerHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOwner, loginOwnerStatus } = useSelector((state) => state.ownerLoginReducer);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [empList, setEmpList] = useState(JSON.parse(localStorage.getItem('empList')) || []);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const getDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post(apiUrl('/owner-api/employeedetails/'), { status: 'all' }, { headers: authHeaders() });
      setEmpList(response.data.payload || []);
    } catch (error) {
      showToast("Unable to load workforce data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!loginOwnerStatus) {
      navigate('/');
    }
  }, [loginOwnerStatus, navigate]);

  useEffect(() => {
    if (loginOwnerStatus) getDashboardData();
  }, [getDashboardData, loginOwnerStatus]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('empList', JSON.stringify(empList));
  }, [empList]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('empList');
    localStorage.removeItem('selectedEmployee')
    dispatch(resetState());
    navigate('/ownerLogin');
  };

  const handleNavItemClick = (item) => {
    setActiveTab(item.id);
    if (item.route) {
      navigate(item.route);
    }
  };

  const summary = workforceSummary(empList);
  const activeRate = summary.total ? Math.round((summary.active / summary.total) * 100) : 0;
  const recentEmployees = [...empList]
    .sort((first, second) => String(second.dateOfJoining || "").localeCompare(String(first.dateOfJoining || "")))
    .slice(0, 4);

  return (
    <>
      <AppShell
        title="Owner Workspace"
        subtitle={`Welcome${currentOwner?.name ? `, ${currentOwner.name}` : ""}`}
        navItems={navItems}
        activeItem={activeTab}
        onNavItemClick={handleNavItemClick}
        onLogout={() => setShowLogoutConfirm(true)}
      >
        <PageHeader
          title="Owner Dashboard"
          subtitle="Manage workforce records and move confidently from onboarding to payroll."
          actions={<button className="app-button app-button--soft" onClick={getDashboardData}>Refresh data</button>}
        />

        <div className="stats-grid">
          <StatCard icon={Users} label="Total employees" value={loading ? "..." : summary.total} />
          <StatCard icon={UserCheck} label="Active workforce" value={loading ? "..." : `${activeRate}%`} />
          <StatCard icon={WalletCards} label="Payroll-ready records" value={loading ? "..." : summary.active} />
        </div>

        <div className="dashboard-grid dashboard-grid--primary">
          <MetricBarChart title="Employees by service center" subtitle="Your highest-volume workforce locations." items={chartItems(empList, "serviceCenter")} />
          <DashboardPanel eyebrow="Daily operations" title="Quick actions" subtitle="Keep core people operations moving.">
            <div className="quick-actions">
              <button className="quick-action" onClick={() => navigate('/employeeRegistration')}>
                <span className="quick-action__icon"><UserPlus size={19} /></span>
                <span><strong>Add employee</strong><small>Register a new employee or import employee data.</small></span>
              </button>
              <button className="quick-action" onClick={() => navigate('/employeeDetails')}>
                <span className="quick-action__icon"><ClipboardList size={19} /></span>
                <span><strong>Review employees</strong><small>Filter records and update employee details.</small></span>
              </button>
              <button className="quick-action" onClick={() => navigate('/employeeSalaryDetails')}>
                <span className="quick-action__icon"><WalletCards size={19} /></span>
                <span><strong>Run payroll report</strong><small>Calculate monthly wages and export reports.</small></span>
              </button>
            </div>
          </DashboardPanel>
        </div>

        <DashboardPanel eyebrow="Workforce pulse" title="Recently added employees" subtitle="Latest people records currently available in the system." actions={<button className="app-button app-button--soft" onClick={() => navigate('/employeeDetails')}>Open employee dashboard</button>}>
          {recentEmployees.length ? <div className="recent-people-list">{recentEmployees.map((employee) => <div className="recent-person" key={employee.id}><div className="recent-person__avatar">{employee.name?.slice(0, 1) || "E"}</div><div><strong>{employee.name}</strong><span>{employee.id} · {employee.type?.toUpperCase()}</span></div><div className="recent-person__location">{employee.serviceCenter || "Not assigned"}<small>{employee.cluster || "-"}</small></div><span className={`status-badge ${employee.status === "Inactive" ? "status-badge--inactive" : "status-badge--active"}`}>{employee.status || "Active"}</span></div>)}</div> : <p className="dashboard-card__empty">No employee records available yet.</p>}
        </DashboardPanel>
      </AppShell>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout?"
        message="You will return to the owner login page."
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <Toast message={toast?.message} type={toast?.type} />
    </>
  );
};

export default OwnerHome;
