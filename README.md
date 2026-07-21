# AS HRM Services Employee Management System

## Database Seeding

The backend includes an idempotent seed script for MongoDB. It safely upserts default users, employees, and attendance records without creating duplicate records.

### Setup

Create `backend/.env` with:

```env
PORT=4000
DB_URL=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
SECRET_KEY=replace_with_a_secure_jwt_secret
```

Then run:

```bash
cd backend
npm run seed
```

### Seeded Data

- 1 admin user in `AdminCollection`
- 2 owners in `OwnerCollection`
- 2 operators as `deo` employees in `EmpCollection`
- 48 employees with realistic Indian names and payroll details
- Attendance records for the current month and previous month in `EmployeeAttendance`

The script creates unique indexes for user IDs and attendance `{ id, month, year }`.

### Default Login Credentials

| Role | ID | Password |
| --- | --- | --- |
| Admin | `admin` | `admin@123` |
| Owner | `OWN-HYD-001` | `Password@123` |
| Owner | `OWN-HYD-002` | `Password@123` |
| Operator | `EMP1012` | `Password@123` |
| Operator | `EMP1021` | `Password@123` |

Note: the current admin frontend login uses hardcoded credentials. The seed script also stores the admin user in `AdminCollection` for future backend-backed admin authentication.
