import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Copy,
  FileSpreadsheet,
  Github,
  Linkedin,
  LockKeyhole,
  MonitorSmartphone,
  PieChart,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import StatusBadge from "../ui/StatusBadge";
import Toast from "../ui/Toast";
import adminDashboardSlide from "../../assets/hero-slides/admin-dashboard.jpg";
import ownerDashboardSlide from "../../assets/hero-slides/owner-dashboard.jpg";
import employeeCardsSlide from "../../assets/hero-slides/employee-cards.jpg";
import employeeRegistrationSlide from "../../assets/hero-slides/employee-registration.jpg";
import attendanceTableSlide from "../../assets/hero-slides/attendance-table.jpg";

const highlights = [
  {
    title: "Employee Management",
    icon: Users,
    items: ["Employee Registration", "Employee Profiles", "Bulk Excel Upload"],
  },
  {
    title: "Attendance Management",
    icon: CalendarCheck,
    items: ["Monthly Attendance", "Attendance Tracking", "Attendance Summary"],
  },
  {
    title: "Payroll",
    icon: WalletCards,
    items: ["Salary Calculation", "PDF Reports", "Excel Reports"],
  },
  {
    title: "Role-Based Access",
    icon: LockKeyhole,
    items: ["Admin", "Owner", "Operator", "JWT Authentication"],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    items: ["Dashboard", "Employee Statistics", "Attendance Overview"],
  },
  {
    title: "Responsive",
    icon: MonitorSmartphone,
    items: ["Mobile Friendly", "Modern UI", "Fast Navigation"],
  },
];

const credentials = [
  { role: "Admin", username: "admin", password: "admin@123" },
  { role: "Owner", username: "OWN-HYD-001", password: "Password@123" },
  { role: "Operator", username: "EMP1012", password: "Password@123" },
];

const quickStart = [
  "Login using a demo account.",
  "Explore the Dashboard.",
  "Register Employees.",
  "View Employee Cards.",
  "Manage Attendance.",
  "Generate Salary Reports.",
];

const techStack = [
  "React",
  "Redux",
  "Node.js",
  "Express.js",
  "MongoDB",
  "JWT",
  "Excel Import",
  "PDF Export",
  "Docker (Coming Soon)",
];

const heroSlides = [
  {
    title: "Admin Dashboard",
    image: adminDashboardSlide,
  },
  {
    title: "Owner Dashboard",
    image: ownerDashboardSlide,
  },
  {
    title: "Employee Directory",
    image: employeeCardsSlide,
  },
  {
    title: "Employee Registration",
    image: employeeRegistrationSlide,
  },
  {
    title: "Attendance Workflow",
    image: attendanceTableSlide,
  },
];

const previews = [
  { title: "Owner Dashboard", icon: UserCog },
  { title: "Operator Dashboard", icon: CalendarCheck },
  { title: "Admin Dashboard", icon: LockKeyhole },
  { title: "Employee Management", icon: Users },
  { title: "Attendance", icon: ClipboardList },
  { title: "Payroll", icon: WalletCards },
  { title: "Analytics", icon: PieChart },
];

function LandingPage() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch (error) {
      showToast("Copy failed", "error");
    }
  };

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero__content">
          <StatusBadge status="Active" />
          <h1>HR Management & Payroll System</h1>
          <p>
            A full-stack Employee Management System built with React, Express.js, MongoDB, and JWT Authentication for managing employees, attendance, payroll, and reporting.
          </p>
          <div className="landing-hero__actions">
            <Link className="app-button app-button--primary text-white" to="/ownerLogin">Owner Portal</Link>
            <Link className="app-button app-button--soft" to="/operatorLogin">Operator Portal</Link>
            <Link className="app-button" to="/adminLogin">Admin Portal</Link>
          </div>
        </div>

        <div className="landing-illustration" aria-label="Project screen slideshow">
          <div className="landing-illustration__top">
            <span />
            <span />
            <span />
          </div>
          <div className="landing-slideshow">
            {heroSlides.map((slide, index) => (
              <div
                className="landing-slide"
                key={slide.title}
                style={{ animationDelay: `${index * 5}s` }}
              >
                <img src={slide.image} alt={`${slide.title} screen`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <PageHeader title="Project Highlights" subtitle="Core HRMS workflows grouped into focused, recruiter-friendly modules." />
        <div className="feature-grid">
          {highlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card" key={feature.title}>
                <div className="stat-card__icon"><Icon size={20} /></div>
                <h3>{feature.title}</h3>
                <ul>
                  {feature.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-section landing-demo-grid">
        <div>
          <PageHeader title="Demo Login" subtitle="These are demonstration accounts created using the project seed script." />
          <div className="credential-grid">
            {credentials.map((credential) => (
              <article className="credential-card" key={credential.role}>
                <h3>{credential.role}</h3>
                <div className="credential-field">
                  <span>Username</span>
                  <div className="credential-row">
                    <strong title={credential.username}>{credential.username}</strong>
                    <button className="app-button app-button--soft" type="button" onClick={() => copyText(credential.username)}>
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>
                <div className="credential-field">
                  <span>Password</span>
                  <div className="credential-row">
                    <strong title={credential.password}>{credential.password}</strong>
                    <button className="app-button app-button--soft" type="button" onClick={() => copyText(credential.password)}>
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>
                <Link className="app-button app-button--primary text-white credential-login" to={credential.role === "Admin" ? "/adminLogin" : credential.role === "Owner" ? "/ownerLogin" : "/operatorLogin"}>
                  Login
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="quick-start-card">
          <PageHeader title="Try the Demo" subtitle="A short path through the application." />
          <ol className="quick-start-list">
            {quickStart.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-section">
        <PageHeader title="Technology Stack" subtitle="Built with a practical MERN stack and reporting utilities." />
        <div className="tech-stack">
          {techStack.map((tech) => <span key={tech}>{tech}</span>)}
        </div>
      </section>

      <section className="landing-section">
        <div className="stats-grid">
          <StatCard icon={Users} label="Demo Employees" value="228" />
          <StatCard icon={UserCog} label="Owners" value="2" />
          <StatCard icon={CalendarCheck} label="Operators" value="2" />
        </div>
        <div className="metric-strip">
          <span>Role-Based Access</span>
          <span>Attendance Management</span>
          <span>Payroll Generation</span>
          <span>Responsive Design</span>
        </div>
      </section>

      <section className="landing-section">
        <PageHeader title="Screen Preview" subtitle="Preview placeholders for the major HRMS workspaces." />
        <div className="preview-grid">
          {previews.map((preview) => {
            const Icon = preview.icon;
            return (
              <article className="screen-preview-card" key={preview.title}>
                <Icon size={24} />
                <h3>{preview.title}</h3>
                <div className="screen-preview-card__mock">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-section why-project">
        <PageHeader title="Why This Project" />
        <p>
          This project demonstrates full stack MERN development with authentication, MongoDB data modeling, role based access, attendance workflows, payroll management, Excel import/export, PDF reporting, and a responsive React UI suitable for real business operations.
        </p>
      </section>

      <footer className="landing-footer">
        <div>
          <h3>HR Management & Payroll System</h3>
          <p>Built with React + Express + MongoDB</p>
        </div>
        <div className="landing-footer__links">
          <a className="app-button" href="https://github.com/" target="_blank" rel="noreferrer"><Github size={17} /> GitHub Repository</a>
          <a className="app-button" href="https://linkedin.com/" target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a>
          <a className="app-button" href="/" onClick={(event) => event.preventDefault()}><FileSpreadsheet size={17} /> Portfolio</a>
        </div>
      </footer>
      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default LandingPage;
