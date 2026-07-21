import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { resetState } from '../redux/slices/ownerSlice';
import { ClipboardList, LayoutDashboard, UserPlus, WalletCards } from "lucide-react";
import AppShell from "../ui/AppShell";
import ConfirmDialog from "../ui/ConfirmDialog";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";

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
  const [empList] = useState(JSON.parse(localStorage.getItem('empList')) || []);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loginOwnerStatus) {
      navigate('/');
    }
  }, [loginOwnerStatus, navigate]);

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
          subtitle="Register employees, review records, and prepare salary details."
        />

        <div className="stats-grid">
          <StatCard icon={UserPlus} label="Employee registration" value="Ready" />
          <StatCard icon={ClipboardList} label="Cached employee records" value={empList.length} />
          <StatCard icon={WalletCards} label="Salary workflow" value="Available" />
        </div>

        <div className="page-card p-4">
          <h3 className="mb-2">Dashboard Overview</h3>
          <p className="text-muted mb-0">
            Use the sidebar to register employees, filter employee records, or calculate salary details for a selected month.
          </p>
        </div>
      </AppShell>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout?"
        message="You will return to the owner login page."
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default OwnerHome;
