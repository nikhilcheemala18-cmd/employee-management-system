
import './App.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { apiUrl } from './config/api';
import RootLayout from './components/rootlayout/RootLayout'
import OwnerLogin from './components/owner/OwnerLogin'
import OperatorLogin from './components/operator/OperatorLogin';
import OperatorRegister from './components/operator/OperatorRegister';
import OperatorHome from './components/operator/OperatorHome';
import AdminLogin from './components/admin/Admin'
import AdminHome from './components/admin/AdminHome';
import OwnerHome from './components/owner/OwnerHome'
import EmployeeProfile from './components/Employee/EmployeeProfile';
import EmployeeRegistration from './components/Employee/EmployeeRegistration';
import EmployeeDetails from './components/Employee/EmployeeDetails';
import EmployeeSalaryDetails from './components/Employee/EmployeeSalaryDetails';
import Header from './components/rootlayout/Header';
import Footer from './components/rootlayout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const [warming, setWarming] = useState(true);

  useEffect(() => {
    let isMounted = true;

    axios.get(apiUrl('/health'))
      .catch(() => {})
      .finally(() => {
        if (isMounted) setWarming(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      <Header/>
      {warming && (
        <div className="warmup-banner" role="status">
          Setting things up... first load can take up to a minute.
        </div>
      )}
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="ownerLogin" element={<OwnerLogin />} />
          <Route path="operatorLogin" element={<OperatorLogin />} />
          <Route path="operatorRegister" element={<OperatorRegister />} />
          <Route path="adminLogin" element={<AdminLogin/>}/>
          </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="adminHome" element={<AdminHome/>} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["owner", "admin"]} />}>
          <Route path="ownerHome" element={<OwnerHome/>} />
          <Route path="employeeRegistration" element={<EmployeeRegistration/>} />
          <Route path="employeeSalaryDetails" element={<EmployeeSalaryDetails/>} />
          <Route path="employeeDetails" element={<EmployeeDetails/>} />
          <Route path="employee/:id" element={<EmployeeProfile/>}/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["operator"]} />}>
          <Route path="operatorHome" element={<OperatorHome/>}/>
        </Route>
        
      </Routes>
    </Router>
    <Footer/>
    </div>
  );
}

export default App;
