import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { resetState } from '../redux/slices/operatorSlice';
import { CalendarCheck, CalendarDays, Lock, LayoutDashboard, RefreshCw, UserCheck, Users } from "lucide-react";
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

const daysInMonth = (month, year) => new Date(Number(year), Number(month), 0).getDate();

const OperatorHome = () => {
  const { currentOperator, loginOperatorStatus } = useSelector((state) => state.operatorLoginReducer);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [empList, setEmpList] = useState(JSON.parse(localStorage.getItem('empList')) || []);
  const [selectedEmployee, setSelectedEmployee] = useState(JSON.parse(localStorage.getItem('selectedEmployee')) || null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
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

  const fetchRoster = useCallback(async () => {
    if (!currentOperator.serviceCenter) return;
    setRosterLoading(true);
    try {
      const res = await axios.get(apiUrl('/operator-api/attendance/roster'), {
        params: { serviceCenter: currentOperator.serviceCenter, month, year, day },
        headers: authHeaders(),
      });
      setRoster(res.data.payload.roster);
      setLocked(res.data.payload.locked);
    } catch (error) {
      showToast(error.response?.data?.message || "Error fetching attendance roster", "error");
    } finally {
      setRosterLoading(false);
    }
  }, [currentOperator.serviceCenter, month, year, day, showToast]);

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
    if (activeTab === 'attendance') fetchRoster();
  }, [activeTab, fetchRoster]);

  useEffect(() => {
    const maxDay = daysInMonth(month, year);
    if (Number(day) > maxDay) setDay(maxDay);
  }, [month, year, day]);

  useEffect(() => {
    localStorage.setItem('empList', JSON.stringify(empList));
  }, [empList]);

  useEffect(() => {
    localStorage.setItem('selectedEmployee', JSON.stringify(selectedEmployee));
  }, [selectedEmployee]);

  const toggleAttendance = (id) => {
    if (locked) return;
    setRoster((prev) => prev.map((emp) => (emp.id === id ? { ...emp, present: !emp.present } : emp)));
  };

  const saveRoster = async () => {
    try {
      await axios.post(apiUrl('/operator-api/attendance/roster'), {
        serviceCenter: currentOperator.serviceCenter,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        day: parseInt(day, 10),
        entries: roster.map(({ id, present }) => ({ id, present })),
      }, { headers: authHeaders() });
      showToast(`Attendance saved for ${day}/${month}/${year}.`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save attendance.", "error");
    }
  };

  const finalizeMonth = async () => {
    setFinalizing(true);
    try {
      await axios.post(apiUrl('/operator-api/attendance/finalize'), {
        serviceCenter: currentOperator.serviceCenter,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      }, { headers: authHeaders() });
      showToast(`${selectedMonthName} ${year} finalized and locked.`);
      fetchRoster();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to finalize month.", "error");
    } finally {
      setFinalizing(false);
      setShowFinalizeConfirm(false);
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

  const presentCount = roster.filter((emp) => emp.present).length;
  const absentCount = roster.length - presentCount;
  const presentRate = roster.length ? Math.round((presentCount / roster.length) * 100) : 0;
  const selectedMonthName = new Date(0, Number(month) - 1).toLocaleString("default", { month: "long" });
  const dayOptions = Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1);

  const renderDashboard = () => (
    <>
      <PageHeader
        title="Operator Dashboard"
        subtitle={`Welcome${currentOperator?.name ? `, ${currentOperator.name}` : ""}. Manage attendance for your service center.`}
      />
      <div className="stats-grid">
        <StatCard icon={Users} label="Loaded employees" value={empList.length} />
        <StatCard icon={CalendarCheck} label="Attendance date" value={`${day}/${month}/${year}`} />
        <StatCard icon={LayoutDashboard} label="Service center" value={currentOperator?.serviceCenter || "-"} />
      </div>
      <div className="page-card p-4">
        <h3 className="mb-2">Attendance Workspace</h3>
        <p className="text-muted mb-0">
          Open Employee Attendance from the sidebar to mark each employee present or absent for a given day.
        </p>
      </div>
    </>
  );

  const renderAttendance = () => (
    <>
      <PageHeader
        title="Employee Attendance"
        subtitle={`Mark present/absent for ${day} ${selectedMonthName} ${year} at ${currentOperator?.serviceCenter || "your service center"}.`}
      />

      <div className="attendance-filter-panel">
        <div className="attendance-filter-panel__heading">
          <div className="stat-card__icon"><CalendarDays size={20} /></div>
          <div><h3>Attendance date</h3><p>Choose a year, month, and day to mark attendance for.</p></div>
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

          <div className="col-md-2">
            <label className="form-label">Select Day</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="form-select">
              {dayOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <button type="button" onClick={fetchRoster} className="app-button app-button--soft w-100">
              <RefreshCw size={17} /> Refresh roster
            </button>
          </div>
        </div>
      </div>

      {locked && (
        <div className="page-card p-4 mt-3" style={{ borderLeft: "4px solid var(--warning)" }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Lock size={18} />
            <strong>{selectedMonthName} {year} is finalized and locked</strong>
          </div>
          <p className="text-muted mb-0">
            Attendance for this month has been finalized. Ask an owner or admin to unlock it before making further changes.
          </p>
        </div>
      )}

      <div className="stats-grid attendance-stats-grid">
        <StatCard icon={Users} label="Employees loaded" value={roster.length} />
        <StatCard icon={UserCheck} label="Present today" value={`${presentCount}/${roster.length}`} />
        <StatCard icon={CalendarCheck} label="Absent today" value={absentCount} />
        <StatCard icon={CalendarDays} label="Present rate" value={`${presentRate}%`} />
      </div>

      <div className="dashboard-grid dashboard-grid--employee">
        <DashboardPanel eyebrow="Attendance summary" title="Today's presence" subtitle={`Snapshot for ${day} ${selectedMonthName} ${year}.`}>
          <div className="attendance-progress">
            <div className="attendance-progress__value"><strong>{presentRate}%</strong><span>present</span></div>
            <div className="attendance-progress__track" aria-label={`${presentRate}% of employees marked present`}><span style={{ width: `${presentRate}%` }} /></div>
            <p>Unmarked employees count as present by default. Untick an employee to mark them absent for this day.</p>
          </div>
        </DashboardPanel>
        <DashboardPanel eyebrow="Daily entry snapshot" title="This day's totals" subtitle="A live summary of the values loaded for this day.">
          <div className="attendance-snapshot">
            <div><span>Present</span><strong>{presentCount}</strong></div>
            <div><span>Absent</span><strong>{absentCount}</strong></div>
            <div><span>Service center</span><strong>{currentOperator?.serviceCenter || "-"}</strong></div>
          </div>
        </DashboardPanel>
      </div>

      {rosterLoading ? (
        <div className="mt-4">
          <EmptyState title="Loading attendance..." message="Fetching the roster for the selected day." />
        </div>
      ) : roster.length === 0 ? (
        <EmptyState title="No active employees found" message="Refresh the roster, or confirm that employees are assigned to your service center." />
      ) : (
        <section className="attendance-table-shell">
          <div className="attendance-table-shell__header">
            <div><p>Employee register</p><h3>Mark present or absent</h3></div>
            <span>{day} {selectedMonthName} {year}</span>
          </div>
          <div className="table-scroll">
            <table className="table table-hover attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Present</th>
                  <th aria-label="Employee profile" />
                </tr>
              </thead>
              <tbody>
                {roster.map((emp) => (
                  <tr key={emp.id} className={emp.present ? "attendance-table__row--complete" : ""}>
                    <td><div className="attendance-employee"><span>{emp.name?.slice(0, 1) || "E"}</span><div><strong>{emp.name}</strong><small>{emp.id}</small></div></div></td>
                    <td>{empList.find((e) => e.id === emp.id)?.cluster || "Operations"}<small>{empList.find((e) => e.id === emp.id)?.serviceCenter || currentOperator?.serviceCenter}</small></td>
                    <td><span className="attendance-role">{emp.type?.toUpperCase() || "EMPLOYEE"}</span></td>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={emp.present}
                        disabled={locked}
                        onChange={() => toggleAttendance(emp.id)}
                        aria-label={`Mark ${emp.name} ${emp.present ? "present" : "absent"}`}
                      />
                    </td>
                    <td className="text-end">
                      <button className="app-button app-button--soft" onClick={() => setSelectedEmployee(empList.find((e) => e.id === emp.id) || emp)}>
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="attendance-table-shell__footer">
            <p><strong>{presentCount} present, {absentCount} absent</strong><span>Save today's attendance, or finalize the whole month once it's complete.</span></p>
            <div className="d-flex gap-2">
              <button onClick={saveRoster} className="app-button app-button--primary text-white" disabled={locked}>
                Save attendance for this day
              </button>
              <button onClick={() => setShowFinalizeConfirm(true)} className="app-button app-button--danger" disabled={locked}>
                Finalize {selectedMonthName} {year}
              </button>
            </div>
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

      <ConfirmDialog
        open={showFinalizeConfirm}
        title={`Finalize ${selectedMonthName} ${year}?`}
        message="Once finalized, daily attendance for this month is locked and can only be reopened by an owner or admin."
        confirmText={finalizing ? "Finalizing..." : "Finalize"}
        onConfirm={finalizeMonth}
        onCancel={() => setShowFinalizeConfirm(false)}
      />
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
