import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { resetState } from '../redux/slices/operatorSlice';
import { CalendarCheck, CalendarDays, Clock3, LayoutDashboard, RefreshCw, UserCheck, Users } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import AppShell from "../ui/AppShell";
import ConfirmDialog from "../ui/ConfirmDialog";
import DashboardPanel from "../ui/DashboardPanel";
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

  const submitAttendance = async () => {
    const attendanceData = Object.keys(attendance).map((id) => ({
      id: id,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      noOfPresentDays: attendance[id],
    }));

    if (!attendanceData.length) {
      showToast("Please enter at least one attendance value before submitting.", "error");
      return;
    }

    try {
      const res = await axios.post(apiUrl('/operator-api/employeeAttendance'), attendanceData, {
        headers: authHeaders(),
      });
      showToast(res.data.message || "Attendance submitted successfully.");
      setAttendance({});
      fetchEmployees();
    } catch (error) {
      showToast(error.response?.data?.message || "Attendance submission failed.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('empList');
    localStorage.removeItem('selectedEmployee')
    dispatch(resetState());
    navigate('/operatorLogin');
  };

  const attendanceEntries = Object.entries(attendance).filter(([, value]) => value !== "" && value !== undefined);
  const completedEntries = attendanceEntries.length;
  const totalPresentDays = attendanceEntries.reduce((total, [, value]) => total + (Number(value) || 0), 0);
  const averagePresentDays = completedEntries ? (totalPresentDays / completedEntries).toFixed(1) : "0";
  const completionRate = empList.length ? Math.round((completedEntries / empList.length) * 100) : 0;
  const selectedMonthName = new Date(0, Number(month) - 1).toLocaleString("default", { month: "long" });

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
        subtitle={`Record and review present days for ${selectedMonthName} ${year} at ${currentOperator?.serviceCenter || "your service center"}.`}
      />

      <div className="attendance-filter-panel">
        <div className="attendance-filter-panel__heading">
          <div className="stat-card__icon"><CalendarDays size={20} /></div>
          <div><h3>Attendance period</h3><p>Choose a month, then enter present days for each employee.</p></div>
        </div>
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
              <RefreshCw size={17} /> Refresh employees
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid attendance-stats-grid">
        <StatCard icon={Users} label="Employees loaded" value={empList.length} />
        <StatCard icon={UserCheck} label="Entries completed" value={`${completedEntries}/${empList.length}`} />
        <StatCard icon={CalendarCheck} label="Present days entered" value={totalPresentDays} />
        <StatCard icon={Clock3} label="Average present days" value={averagePresentDays} />
      </div>

      <div className="dashboard-grid dashboard-grid--employee">
        <DashboardPanel eyebrow="Attendance summary" title="Monthly completion" subtitle={`Progress for ${selectedMonthName} ${year}.`}>
          <div className="attendance-progress">
            <div className="attendance-progress__value"><strong>{completionRate}%</strong><span>completed</span></div>
            <div className="attendance-progress__track" aria-label={`${completionRate}% attendance entries completed`}><span style={{ width: `${completionRate}%` }} /></div>
            <p>{completedEntries ? `${completedEntries} employee record${completedEntries === 1 ? " has" : "s have"} been updated for this period.` : "Start entering present days to build this month's attendance summary."}</p>
          </div>
        </DashboardPanel>
        <DashboardPanel eyebrow="Daily entry snapshot" title="Today's input summary" subtitle="A live summary of the values entered in this session.">
          <div className="attendance-snapshot">
            <div><span>Updated employees</span><strong>{completedEntries}</strong></div>
            <div><span>Pending entries</span><strong>{Math.max(empList.length - completedEntries, 0)}</strong></div>
            <div><span>Service center</span><strong>{currentOperator?.serviceCenter || "-"}</strong></div>
          </div>
        </DashboardPanel>
      </div>

      {empList.length === 0 ? (
        <EmptyState title="No active employees found" message="Refresh the directory, or confirm that employees are assigned to your service center." />
      ) : (
        <section className="attendance-table-shell">
          <div className="attendance-table-shell__header">
            <div><p>Employee register</p><h3>Enter monthly present days</h3></div>
            <span>{selectedMonthName} {year}</span>
          </div>
          <div className="table-scroll">
            <table className="table table-hover attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Present days</th>
                  <th>Entry status</th>
                  <th aria-label="Employee profile" />
                </tr>
              </thead>
              <tbody>
                {empList.map((emp) => {
                  const hasEntry = attendance[emp.id] !== "" && attendance[emp.id] !== undefined;
                  return (
                  <tr key={emp.id} className={hasEntry ? "attendance-table__row--complete" : ""}>
                    <td><div className="attendance-employee"><span>{emp.name?.slice(0, 1) || "E"}</span><div><strong>{emp.name}</strong><small>{emp.id}</small></div></div></td>
                    <td>{emp.cluster || "Operations"}<small>{emp.serviceCenter || "Not assigned"}</small></td>
                    <td><span className="attendance-role">{emp.type?.toUpperCase() || "EMPLOYEE"}</span></td>
                    <td>
                      <input
                        type="number"
                        className="form-control attendance-input"
                        min="0"
                        max="31"
                        value={attendance[emp.id] ?? ""}
                        onChange={(e) => handleAttendanceChange(emp.id, e.target.value)}
                        placeholder="0"
                        aria-label={`Present days for ${emp.name}`}
                      />
                    </td>
                    <td><span className={`attendance-entry-status ${hasEntry ? "attendance-entry-status--complete" : ""}`}>{hasEntry ? "Recorded" : "Pending"}</span></td>
                    <td className="text-end">
                      <button className="app-button app-button--soft" onClick={() => setSelectedEmployee(emp)}>
                        Profile
                      </button>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
          <div className="attendance-table-shell__footer">
            <p><strong>{completedEntries} entries ready</strong><span>Submit the attendance values currently entered for this period.</span></p>
            <button onClick={submitAttendance} className="app-button app-button--primary text-white" disabled={!completedEntries}>
              Submit attendance
            </button>
          </div>
        </section>
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
