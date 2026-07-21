import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { resetState } from '../redux/slices/operatorSlice';
import { CalendarCheck, LayoutDashboard, Users } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import AppShell from "../ui/AppShell";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import Toast from "../ui/Toast";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Employee Attendance", icon: CalendarCheck },
];

const OperatorHome = () => {
  const { currentOperator, loginOperatorStatus } = useSelector((state) => state.operatorLoginReducer);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [empList, setEmpList] = useState(JSON.parse(localStorage.getItem('empList')) || []);
  const [attendance, setAttendance] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(JSON.parse(localStorage.getItem('selectedEmployee')) || null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axios.get(apiUrl(`/operator-api/employeedetails/${currentOperator.serviceCenter}`), {
        headers: authHeaders(),
      });
      setEmpList(res.data.payload);
    } catch (error) {
      showToast("Error fetching employee data", "error");
    }
  }, [currentOperator.serviceCenter, showToast]);

  useEffect(() => {
    if (!loginOperatorStatus) {
      navigate('/');
    }
  }, [loginOperatorStatus, navigate]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    if (activeTab === 'attendance' && empList.length === 0) {
      fetchEmployees();
    }
  }, [activeTab, empList.length, fetchEmployees]);

  useEffect(() => {
    localStorage.setItem('empList', JSON.stringify(empList));
  }, [empList]);

  useEffect(() => {
    localStorage.setItem('selectedEmployee', JSON.stringify(selectedEmployee));
  }, [selectedEmployee]);

  const handleAttendanceChange = (id, value) => {
    setAttendance({ ...attendance, [id]: value });
  };

  const submitAttendance = () => {
    const attendanceData = Object.keys(attendance).map((id) => ({
      id: id,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      noOfPresentDays: attendance[id],
    }));

    axios.post(apiUrl('/operator-api/employeeAttendance'), attendanceData).then((res) => {
      showToast(res.data.message);
      window.location.reload();
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('empList');
    localStorage.removeItem('selectedEmployee')
    dispatch(resetState());
    navigate('/operatorLogin');
  };

  const renderDashboard = () => (
    <>
      <PageHeader
        title="Operator Dashboard"
        subtitle={`Welcome${currentOperator?.name ? `, ${currentOperator.name}` : ""}. Manage attendance for your service center.`}
      />
      <div className="stats-grid">
        <StatCard icon={Users} label="Loaded employees" value={empList.length} />
        <StatCard icon={CalendarCheck} label="Attendance entries" value={Object.keys(attendance).length} />
        <StatCard icon={LayoutDashboard} label="Service center" value={currentOperator?.serviceCenter || "-"} />
      </div>
      <div className="page-card p-4">
        <h3 className="mb-2">Attendance Workspace</h3>
        <p className="text-muted mb-0">
          Open Employee Attendance from the sidebar to enter present days for the selected month and year.
        </p>
      </div>
    </>
  );

  const renderAttendance = () => (
    <>
      <PageHeader
        title="Employee Attendance"
        subtitle="Enter monthly present days for active employees in your service center."
      />

      <div className="form-panel mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Select Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Select Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="form-select">
              {[...Array(12)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(0, index).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <button type="button" onClick={fetchEmployees} className="app-button app-button--soft w-100">
              Refresh Employees
            </button>
          </div>
        </div>
      </div>

      {empList.length === 0 ? (
        <EmptyState title="No employees loaded" message="Refresh employees or check the assigned service center." />
      ) : (
        <div className="table-shell">
          <div className="table-scroll">
            <table className="table table-hover text-center">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Attendance</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {empList.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.id}</td>
                    <td>{emp.type}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control m-auto"
                        min="0"
                        value={attendance[emp.id] || ""}
                        onChange={(e) => handleAttendanceChange(emp.id, e.target.value)}
                        placeholder="Enter attendance"
                        style={{ width: "180px" }}
                      />
                    </td>
                    <td>
                      <button className="app-button app-button--soft" onClick={() => setSelectedEmployee(emp)}>
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-top">
            <button onClick={submitAttendance} className="app-button app-button--primary text-white">
              Submit Attendance
            </button>
          </div>
        </div>
      )}

      {selectedEmployee && (
        <div className='page-card mt-4 p-4'>
          <PageHeader
            title="Employee Details"
            actions={<button className='app-button' onClick={() => setSelectedEmployee(null)}>Close</button>}
          />
          <div className="profile-grid">
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>ID:</strong> {selectedEmployee.id}</p>
            <p><strong>Email:</strong> {selectedEmployee.email}</p>
            <p><strong>Cluster:</strong> {selectedEmployee.cluster}</p>
            <p><strong>Service Center:</strong> {selectedEmployee.serviceCenter}</p>
            <p><strong>Type:</strong> {selectedEmployee.type}</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <AppShell
        title="Operator Workspace"
        subtitle={currentOperator?.serviceCenter || "Attendance operations"}
        navItems={navItems}
        activeItem={activeTab}
        onNavItemClick={(item) => setActiveTab(item.id)}
        onLogout={() => setShowLogoutConfirm(true)}
      >
        {activeTab === "attendance" ? renderAttendance() : renderDashboard()}
      </AppShell>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout?"
        message="You will return to the operator login page."
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <Toast message={toast?.message} type={toast?.type} />
    </>
  );
};

export default OperatorHome;
