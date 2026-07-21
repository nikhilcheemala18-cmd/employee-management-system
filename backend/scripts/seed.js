const bcryptjs = require("bcryptjs");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const DB_NAME = "ashrmservices";
const DEFAULT_PASSWORD = "Password@123";
const ADMIN_PASSWORD = "admin@123";

const owners = [
  {
    id: "OWN-HYD-001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@ashrmservices.in",
  },
  {
    id: "OWN-HYD-002",
    name: "Priya Reddy",
    email: "priya.reddy@ashrmservices.in",
  },
];

const admin = {
  id: "admin",
  name: "System Admin",
  email: "admin@ashrmservices.in",
  role: "admin",
};

const employeeSeedData = [
  ["EMP1001", "Aarav Sharma", "Andhra Pradesh", "Visakhapatnam", "hk", 650, 15000, "yes", "yes"],
  ["EMP1002", "Vivaan Patel", "Andhra Pradesh", "Guntur", "dlv", 700, 16000, "yes", "yes"],
  ["EMP1003", "Aditya Singh", "Andhra Pradesh", "Krishna", "hk", 620, 14500, "yes", "no"],
  ["EMP1004", "Arjun Nair", "Bihar", "Patna", "dlv", 720, 16500, "yes", "yes"],
  ["EMP1005", "Sai Kumar", "Bihar", "Gaya", "hk", 600, 14000, "no", "yes"],
  ["EMP1006", "Rohan Gupta", "Bihar", "Muzaffarpur", "dlv", 710, 16200, "yes", "yes"],
  ["EMP1007", "Karthik Reddy", "Gujarat", "Ahmedabad", "hk", 640, 15000, "yes", "no"],
  ["EMP1008", "Nikhil Rao", "Gujarat", "Bharuch", "dlv", 730, 16800, "yes", "yes"],
  ["EMP1009", "Ananya Sharma", "Gujarat", "Gandhinagar", "hk", 610, 14200, "no", "yes"],
  ["EMP1010", "Diya Patel", "Karnataka", "Bengaluru Urban", "dlv", 760, 17500, "yes", "yes"],
  ["EMP1011", "Isha Verma", "Karnataka", "Belagavi", "hk", 630, 14800, "yes", "yes"],
  ["EMP1012", "Meera Nair", "Karnataka", "Bidar", "deo", 820, 22000, "yes", "yes"],
  ["EMP1013", "Kavya Rao", "Kerala", "Ernakulam", "hk", 650, 15000, "yes", "yes"],
  ["EMP1014", "Aditi Singh", "Kerala", "Kozhikode", "dlv", 735, 17000, "yes", "yes"],
  ["EMP1015", "Sneha Reddy", "Kerala", "Kollam", "hk", 615, 14300, "no", "yes"],
  ["EMP1016", "Pooja Gupta", "Madhya Pradesh", "Bhopal", "dlv", 705, 16000, "yes", "yes"],
  ["EMP1017", "Neha Sharma", "Madhya Pradesh", "Betul", "hk", 620, 14500, "yes", "no"],
  ["EMP1018", "Ritika Yadav", "Madhya Pradesh", "Bhind", "dlv", 715, 16400, "yes", "yes"],
  ["EMP1019", "Sanjay Kumar", "Maharashtra", "Ahmednagar", "hk", 660, 15300, "yes", "yes"],
  ["EMP1020", "Manoj Patil", "Maharashtra", "Akola", "dlv", 745, 17200, "yes", "yes"],
  ["EMP1021", "Vikram Joshi", "Maharashtra", "Amravati", "deo", 850, 24000, "yes", "yes"],
  ["EMP1022", "Suresh Reddy", "Telangana", "Hyderabad", "hk", 650, 15000, "yes", "yes"],
  ["EMP1023", "Mahesh Kumar", "Telangana", "Karimnagar", "dlv", 725, 16800, "yes", "yes"],
  ["EMP1024", "Ravi Teja", "Telangana", "Khammam", "hk", 610, 14200, "no", "yes"],
  ["EMP1025", "Lakshmi Devi", "Tamil Nadu", "Chennai", "dlv", 740, 17100, "yes", "yes"],
  ["EMP1026", "Divya Krishnan", "Tamil Nadu", "Coimbatore", "hk", 640, 14800, "yes", "yes"],
  ["EMP1027", "Nandini Rao", "Tamil Nadu", "Dharmapuri", "dlv", 735, 17000, "yes", "yes"],
  ["EMP1028", "Harsha Vardhan", "Uttar Pradesh", "Aligarh", "hk", 610, 14000, "no", "yes"],
  ["EMP1029", "Amit Yadav", "Uttar Pradesh", "Agra", "dlv", 700, 16000, "yes", "yes"],
  ["EMP1030", "Deepak Singh", "Uttar Pradesh", "Ayodhya", "hk", 625, 14600, "yes", "no"],
  ["EMP1031", "Prakash Mehta", "Andhra Pradesh", "Nellore", "dlv", 710, 16200, "yes", "yes"],
  ["EMP1032", "Ganesh Naidu", "Bihar", "Bhagalpur", "hk", 600, 14000, "no", "yes"],
  ["EMP1033", "Mohan Das", "Gujarat", "Jamnagar", "dlv", 720, 16500, "yes", "yes"],
  ["EMP1034", "Sunil Shetty", "Karnataka", "Chamarajanagar", "hk", 650, 15000, "yes", "yes"],
  ["EMP1035", "Joseph Mathew", "Kerala", "Kottayam", "dlv", 730, 16800, "yes", "yes"],
  ["EMP1036", "Arvind Mishra", "Madhya Pradesh", "Burhanpur", "hk", 615, 14300, "no", "yes"],
  ["EMP1037", "Yogesh Pawar", "Maharashtra", "Bhandara", "dlv", 735, 17000, "yes", "yes"],
  ["EMP1038", "Naveen Goud", "Telangana", "Jagtial", "hk", 625, 14600, "yes", "yes"],
  ["EMP1039", "Kumaravel S", "Tamil Nadu", "Erode", "dlv", 720, 16500, "yes", "yes"],
  ["EMP1040", "Rahul Tiwari", "Uttar Pradesh", "Azamgarh", "hk", 610, 14200, "no", "yes"],
  ["EMP1041", "Sowmya Reddy", "Telangana", "Hyderabad", "dlv", 730, 16800, "yes", "yes"],
  ["EMP1042", "Bhavana Rao", "Karnataka", "Bengaluru Urban", "hk", 650, 15000, "yes", "yes"],
  ["EMP1043", "Chaitanya K", "Andhra Pradesh", "Visakhapatnam", "dlv", 725, 16600, "yes", "yes"],
  ["EMP1044", "Farhan Ali", "Maharashtra", "Chandrapur", "hk", 640, 14800, "yes", "no"],
  ["EMP1045", "Imran Khan", "Gujarat", "Ahmedabad", "dlv", 730, 16800, "yes", "yes"],
  ["EMP1046", "Sahana Murthy", "Kerala", "Ernakulam", "hk", 650, 15000, "yes", "yes"],
  ["EMP1047", "Girish Kulkarni", "Madhya Pradesh", "Bhopal", "dlv", 715, 16400, "yes", "yes"],
  ["EMP1048", "Swathi Iyer", "Tamil Nadu", "Chennai", "hk", 645, 14900, "yes", "yes"],
];

const operatorIds = new Set(["EMP1012", "EMP1021"]);

const bankNames = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Canara Bank", "Union Bank of India"];

const panForIndex = (index) => `ABCDE${String(1000 + index).slice(-4)}${String.fromCharCode(65 + (index % 26))}`;
const aadharForIndex = (index) => `9${String(10000000000 + index * 7919).slice(-11)}`;
const accountForIndex = (index) => String(500000000000 + index * 3137);
const ifscForIndex = (index) => `${["SBIN", "HDFC", "ICIC", "UTIB", "CNRB", "UBIN"][index % 6]}000${String(1000 + index).slice(-4)}`;

const buildEmployees = (operatorPasswordHash) =>
  employeeSeedData.map(([id, name, cluster, serviceCenter, type, dailyWage, basic, pf, esic], index) => {
    const employee = {
      id,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@ashrmservices.in`,
      dateOfJoining: `2024-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 24) + 1).padStart(2, "0")}`,
      aadhar: aadharForIndex(index + 1),
      pan: panForIndex(index + 1),
      accountNumber: accountForIndex(index + 1),
      bankName: bankNames[index % bankNames.length],
      ifsc: ifscForIndex(index + 1),
      cluster,
      serviceCenter,
      type,
      dailyWage: String(dailyWage),
      basic: String(basic),
      pf,
      esic,
      status: index % 17 === 0 ? "Inactive" : "Active",
    };

    if (operatorIds.has(id)) {
      employee.password = operatorPasswordHash;
      employee.status = "Active";
    }

    return employee;
  });

const getSeedMonths = () => {
  const now = new Date();
  const current = { month: now.getMonth() + 1, year: now.getFullYear() };
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previous = { month: previousDate.getMonth() + 1, year: previousDate.getFullYear() };

  return [previous, current];
};

const attendanceFor = (employee, monthIndex, employeeIndex) => ({
  id: employee.id,
  month: monthIndex.month,
  year: monthIndex.year,
  noOfPresentDays: String(employee.status === "Inactive" ? 0 : 20 + ((employeeIndex + monthIndex.month) % 7)),
});

const upsertManyById = async (collection, docs) => {
  if (!docs.length) return { upsertedCount: 0, modifiedCount: 0 };

  const result = await collection.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $set: doc },
        upsert: true,
      },
    }))
  );

  return result;
};

const runSeed = async () => {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL is required. Add it to backend/.env before running npm run seed.");
  }

  const client = new MongoClient(process.env.DB_URL);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const ownerCollection = db.collection("OwnerCollection");
    const empCollection = db.collection("EmpCollection");
    const employeeAttendance = db.collection("EmployeeAttendance");
    const adminCollection = db.collection("AdminCollection");

    await employeeAttendance.createIndex({ id: 1, month: 1, year: 1 }, { unique: true });
    await ownerCollection.createIndex({ id: 1 }, { unique: true });
    await empCollection.createIndex({ id: 1 }, { unique: true });
    await adminCollection.createIndex({ id: 1 }, { unique: true });

    const ownerPasswordHash = await bcryptjs.hash(DEFAULT_PASSWORD, 6);
    const operatorPasswordHash = await bcryptjs.hash(DEFAULT_PASSWORD, 6);
    const adminPasswordHash = await bcryptjs.hash(ADMIN_PASSWORD, 6);

    const ownerDocs = owners.map((owner) => ({ ...owner, password: ownerPasswordHash }));
    const adminDoc = { ...admin, password: adminPasswordHash };
    const employeeDocs = buildEmployees(operatorPasswordHash);
    const attendanceDocs = getSeedMonths().flatMap((monthIndex) =>
      employeeDocs.map((employee, employeeIndex) => attendanceFor(employee, monthIndex, employeeIndex))
    );

    const ownerResult = await upsertManyById(ownerCollection, ownerDocs);
    const employeeResult = await upsertManyById(empCollection, employeeDocs);
    const attendanceResult = await employeeAttendance.bulkWrite(
      attendanceDocs.map((record) => ({
        updateOne: {
          filter: { id: record.id, month: record.month, year: record.year },
          update: { $set: record },
          upsert: true,
        },
      }))
    );
    await adminCollection.updateOne({ id: adminDoc.id }, { $set: adminDoc }, { upsert: true });

    console.log("Seed completed successfully.");
    console.log(`Admin users: 1`);
    console.log(`Owners upserted/updated: ${ownerResult.upsertedCount + ownerResult.modifiedCount}`);
    console.log(`Employees upserted/updated: ${employeeResult.upsertedCount + employeeResult.modifiedCount}`);
    console.log(`Attendance records upserted/updated: ${attendanceResult.upsertedCount + attendanceResult.modifiedCount}`);
    console.log("");
    console.log("Default credentials:");
    console.log(`Admin: admin / ${ADMIN_PASSWORD}`);
    console.log(`Owners: OWN-HYD-001 or OWN-HYD-002 / ${DEFAULT_PASSWORD}`);
    console.log(`Operators: EMP1012 or EMP1021 / ${DEFAULT_PASSWORD}`);
  } finally {
    await client.close();
  }
};

runSeed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
