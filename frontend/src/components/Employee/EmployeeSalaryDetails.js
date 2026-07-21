import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download, FileSpreadsheet, WalletCards } from "lucide-react";
import { apiUrl, authHeaders } from "../../config/api";
import { clusterServiceCenters } from "../../constants/locationData";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";

function EmployeeSalaryDetails() {
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
      const res = await axios.post(apiUrl('/owner-api/employeesalarydetails/'), data, {
        headers: authHeaders(),
      });
      setEmpList(res.data.payload);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const exportToExcel = () => {
    const table = tableRef.current;
    if (!table) return;

    const tableClone = table.cloneNode(true);
    const rows = tableClone.querySelectorAll('tr');

    rows.forEach(row => {
      const lastCell = row.querySelector('td:last-child, th:last-child');
      if (lastCell) {
        lastCell.remove();
      }
    });

    const ws = XLSX.utils.table_to_sheet(tableClone);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "employee_data.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a2",
    });
    doc.text("Employee Details", 20, 10);

    const tableColumn = [
      "Name", "ID", "Cluster", "Service Center", "Daily Wage", "No of Days Present", "Total Wages",
      "Basic", "Others", "Gross Wages", "PF", "ESIC", "Net Wages", "PF Emper", "ESIC Emp", "Total Cost",
      "Service Charge", "Total Charges"
    ];

    const tableRows = empList.map(emp => {
      const total_wages = Math.round(emp.dailyWage * emp.daysPresent);
      const basic = Math.round((emp.basic / 30) * emp.daysPresent);
      const others = Math.round(total_wages - basic);
      const pf = Math.round((basic * 12) / 100);
      const esic = Math.round((total_wages * 0.75) / 100);
      const net_wages = Math.round(total_wages - pf - esic);
      const pf_emper = Math.round((basic * 13) / 100);
      const esic_emp = Math.round((total_wages * 3.25) / 100);
      const total_cost = Math.round(total_wages + pf_emper + esic_emp);
      const service_charge = Math.round((total_cost * 6) / 100);
      const total_charges = Math.round(total_cost + service_charge);

      return [
        emp.name, emp.id, emp.cluster, emp.serviceCenter, emp.dailyWage, emp.daysPresent, total_wages,
        basic, others, total_wages, pf, esic, net_wages, pf_emper, esic_emp, total_cost,
        service_charge, total_charges
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("employees.pdf");
  };

  return (
    <div className="content-area mx-auto">
      <PageHeader
        title="Employee Salary Details"
        subtitle="Calculate monthly wage, statutory deductions, and total charges."
        actions={
          <button className="app-button app-button--danger" onClick={() => navigate(-1)}>
            Close
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard icon={WalletCards} label="Employees in report" value={empList.length} />
        <StatCard icon={FileSpreadsheet} label="Exports" value="Excel / PDF" />
        <StatCard icon={Download} label="Report status" value={empList.length > 0 ? "Ready" : "Pending"} />
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
            <label className="form-label">Enter Year</label>
            <input
              type="number"
              className="form-control"
              {...detailsForm.register("year")}
              placeholder="Enter Year"
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Select Month</label>
            <select className="form-select" {...detailsForm.register("month")} required>
              <option value="" disabled>-- Select a Month --</option>
              {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" })).map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="app-button app-button--primary text-white mt-4">Fetch Details</button>
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
                  <th style={{ width: "150px" }}>Daily Wage</th>
                  <th style={{ width: "150px" }}>No of Days Present</th>
                  <th style={{ width: "150px" }}>Total Wages</th>
                  <th style={{ width: "150px" }}>Basic</th>
                  <th style={{ width: "150px" }}>Others</th>
                  <th style={{ width: "150px" }}>Gross Wages</th>
                  <th style={{ width: "150px" }}>PF</th>
                  <th style={{ width: "150px" }}>ESIC</th>
                  <th style={{ width: "150px" }}>Net Wages</th>
                  <th style={{ width: "150px" }}>PF Emper</th>
                  <th style={{ width: "150px" }}>ESIC Emp</th>
                  <th style={{ width: "150px" }}>Total Cost</th>
                  <th style={{ width: "150px" }}>Service Charge</th>
                  <th style={{ width: "150px" }}>Total Charges</th>
                </tr>
              </thead>

              <tbody>
                {empList.map((emp) => {
                  const total_wages = Math.round(emp.dailyWage * emp.daysPresent);
                  const basic = Math.round((emp.basic / 30) * emp.daysPresent);
                  const others = Math.round(total_wages - basic);
                  const pf = emp.pf === "yes" ? Math.round((basic * 12) / 100) : 0;
                  const esic = emp.esic === "yes" ? Math.round((total_wages * 0.75) / 100) : 0;
                  const net_wages = Math.round(total_wages - pf - esic);
                  const pf_emper = emp.pf === "yes" ? Math.round((basic * 13) / 100) : 0;
                  const esic_emp = emp.esic === "yes" ? Math.round((total_wages * 3.25) / 100) : 0;
                  const total_cost = Math.round(total_wages + pf_emper + esic_emp);
                  const service_charge = Math.round((total_cost * 6) / 100);
                  const total_charges = Math.round(total_cost + service_charge);

                  return (
                    <tr key={emp.id}>
                      <td style={{ width: "150px" }}>{emp.name}</td>
                      <td style={{ width: "150px" }}>{emp.id}</td>
                      <td style={{ width: "150px" }}>{emp.cluster}</td>
                      <td style={{ width: "150px" }}>{emp.serviceCenter}</td>
                      <td style={{ width: "150px" }}>{emp.type}</td>
                      <td style={{ width: "150px" }}>{emp.dailyWage}</td>
                      <td style={{ width: "150px" }}>{emp.daysPresent}</td>
                      <td style={{ width: "150px" }}>{total_wages}</td>
                      <td style={{ width: "150px" }}>{basic}</td>
                      <td style={{ width: "150px" }}>{others}</td>
                      <td style={{ width: "150px" }}>{total_wages}</td>
                      <td style={{ width: "150px" }}>{pf}</td>
                      <td style={{ width: "150px" }}>{esic}</td>
                      <td style={{ width: "150px" }}>{net_wages}</td>
                      <td style={{ width: "150px" }}>{pf_emper}</td>
                      <td style={{ width: "150px" }}>{esic_emp}</td>
                      <td style={{ width: "150px" }}>{total_cost}</td>
                      <td style={{ width: "150px" }}>{service_charge}</td>
                      <td style={{ width: "150px" }}>{total_charges}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-top d-flex flex-wrap gap-2">
            <button onClick={exportToExcel} className='app-button app-button--soft'>
              <FileSpreadsheet size={18} />
              Download Excel
            </button>
            <button onClick={exportToPDF} className='app-button app-button--danger'>
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No salary data loaded" message="Choose filters, year, and month to generate salary details." />
        </div>
      )}
    </div>
  )
}

export default EmployeeSalaryDetails;
