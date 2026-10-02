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

// Telangana gets full district coverage (10 service centers); every other state gets
// just its one primary service center. Districts must match frontend/src/constants/locationData.js
// so the Employee Registration cluster/service-center dropdowns stay in sync with seeded data.
const TELANGANA_DISTRICTS = [
  "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon",
  "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam",
];

// operator: fixed id/name so EMP1012 (Bidar) and EMP1021 (Amravati) keep working as the
// demo operator logins referenced by LandingPage.js and frontend/scripts/capture-screenshots.js.
const OTHER_STATE_CENTERS = [
  { cluster: "Andhra Pradesh", serviceCenter: "Visakhapatnam" },
  { cluster: "Bihar", serviceCenter: "Patna" },
  { cluster: "Gujarat", serviceCenter: "Ahmedabad" },
  { cluster: "Karnataka", serviceCenter: "Bidar", operator: { id: "EMP1012", name: "Meera Nair" } },
  { cluster: "Kerala", serviceCenter: "Ernakulam" },
  { cluster: "Madhya Pradesh", serviceCenter: "Bhopal" },
  { cluster: "Maharashtra", serviceCenter: "Amravati", operator: { id: "EMP1021", name: "Vikram Joshi" } },
  { cluster: "Tamil Nadu", serviceCenter: "Chennai" },
  { cluster: "Uttar Pradesh", serviceCenter: "Agra" },
];

const EMPLOYEES_PER_CENTER = 12;

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Rohan", "Karthik", "Nikhil", "Ananya", "Diya",
  "Isha", "Meera", "Kavya", "Aditi", "Sneha", "Pooja", "Neha", "Ritika", "Sanjay", "Manoj",
  "Vikram", "Suresh", "Mahesh", "Ravi", "Lakshmi", "Divya", "Nandini", "Harsha", "Amit", "Deepak",
  "Prakash", "Ganesh", "Mohan", "Sunil", "Joseph", "Arvind", "Yogesh", "Naveen", "Kumaravel", "Rahul",
  "Sowmya", "Bhavana", "Chaitanya", "Farhan", "Imran", "Sahana", "Girish", "Swathi", "Priya", "Rajesh",
  "Anitha", "Srinivas", "Venkatesh", "Padma", "Kiran", "Shalini", "Rakesh", "Vinod", "Geetha", "Sunita",
];

const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Nair", "Kumar", "Gupta", "Reddy", "Rao", "Patil", "Joshi",
  "Iyer", "Krishnan", "Yadav", "Mishra", "Pawar", "Goud", "Mathew", "Shetty", "Naidu", "Das",
  "Mehta", "Verma", "Devi", "Vardhan", "Tiwari", "Murthy", "Kulkarni", "Ali", "Khan", "Teja",
];

const nameForSeq = (seq) =>
  `${FIRST_NAMES[seq % FIRST_NAMES.length]} ${LAST_NAMES[(seq * 7 + 3) % LAST_NAMES.length]}`;

const generateEmployeeSeedData = () => {
  const centers = [
    ...TELANGANA_DISTRICTS.map((serviceCenter) => ({ cluster: "Telangana", serviceCenter })),
    ...OTHER_STATE_CENTERS,
  ];
  const reservedIds = new Set(centers.filter((c) => c.operator).map((c) => c.operator.id));

  let seq = 1;
  const nextId = () => {
    let id = `EMP${1000 + seq}`;
    while (reservedIds.has(id)) {
      seq++;
      id = `EMP${1000 + seq}`;
    }
    seq++;
    return id;
  };

  const rows = [];
  centers.forEach((center) => {
    const regularCount = EMPLOYEES_PER_CENTER - (center.operator ? 1 : 0);

    for (let i = 0; i < regularCount; i++) {
      const id = nextId();
      const n = Number(id.slice(3));
      const type = i % 2 === 0 ? "hk" : "dlv";
      const dailyWage = type === "hk" ? 600 + ((n * 7) % 70) : 700 + ((n * 7) % 70);
      const basic = type === "hk" ? 14000 + ((n * 53) % 1500) : 16000 + ((n * 53) % 1800);
      const pf = n % 6 === 0 ? "no" : "yes";
      const esic = n % 9 === 0 ? "no" : "yes";

      rows.push([id, nameForSeq(n), center.cluster, center.serviceCenter, type, dailyWage, basic, pf, esic]);
    }

    if (center.operator) {
      rows.push([
        center.operator.id, center.operator.name, center.cluster, center.serviceCenter,
        "deo", 830, 23000, "yes", "yes",
      ]);
    }
  });

  return rows;
};

const employeeSeedData = generateEmployeeSeedData();

const operatorIds = new Set(
  OTHER_STATE_CENTERS.filter((c) => c.operator).map((c) => c.operator.id)
);

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

    const ownerPasswordHash = await bcryptjs.hash(DEFAULT_PASSWORD, 10);
    const operatorPasswordHash = await bcryptjs.hash(DEFAULT_PASSWORD, 10);
    const adminPasswordHash = await bcryptjs.hash(ADMIN_PASSWORD, 10);

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
