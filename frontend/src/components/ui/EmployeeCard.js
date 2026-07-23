import { Building2, Mail, MapPin, UserRound } from "lucide-react";
import StatusBadge from "./StatusBadge";

const positionLabels = {
  deo: "Data Entry Operator",
  dlv: "Delivery Associate",
  hk: "Housekeeping Associate",
};

const initialsFor = (name = "Employee") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function EmployeeCard({ employee, onViewProfile }) {
  const department = employee.department || employee.cluster || "Operations";
  const position = employee.position || positionLabels[employee.type] || "Team Member";

  return (
    <article className="employee-card">
      <div className="employee-card__topline">
        <div className="employee-card__avatar" aria-hidden="true">{initialsFor(employee.name)}</div>
        <div className="employee-card__identity">
          <h3>{employee.name || "Unnamed employee"}</h3>
          <p>{employee.id || "Employee ID unavailable"}</p>
        </div>
        <StatusBadge status={employee.status} />
      </div>

      <div className="employee-card__role">
        <UserRound size={17} />
        <div><span>Position</span><strong>{position}</strong></div>
      </div>

      <dl className="employee-card__details">
        <div><dt><Building2 size={16} /> Department</dt><dd>{department}</dd></div>
        <div><dt><MapPin size={16} /> Location</dt><dd>{employee.serviceCenter || "Not assigned"}</dd></div>
        <div className="employee-card__contact"><dt><Mail size={16} /> Contact</dt><dd title={employee.email}>{employee.email || "Email unavailable"}</dd></div>
      </dl>

      <div className="employee-card__footer">
        <span>{employee.type ? employee.type.toUpperCase() : "EMPLOYEE"}</span>
        <button type="button" className="app-button app-button--soft" onClick={() => onViewProfile(employee)}>
          View profile
        </button>
      </div>
    </article>
  );
}

export default EmployeeCard;
