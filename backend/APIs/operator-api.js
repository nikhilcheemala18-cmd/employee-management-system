
const exp = require('express')
const operatorApp = exp.Router()
const expressAsyncHandler= require('express-async-handler')
const bcryptjs = require('bcryptjs')
const jwt=require('jsonwebtoken')
const requireAuth = require('../Middlewares/verifyToken')

const BCRYPT_ROUNDS = 10

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
}

let empCollection
let ownerCollection
let employeeAttendance
operatorApp.use((req,res,next)=>{
    empCollection = req.app.get('empCollection')
    ownerCollection = req.app.get('ownerCollection')
    employeeAttendance = req.app.get('employeeAttendance')
    next()
})

operatorApp.use(exp.json())

operatorApp.post('/register',expressAsyncHandler(async(req,res)=>{
    const operatorCred=req.body;

    if(typeof operatorCred.id!=='string' || typeof operatorCred.password!=='string'){
        return res.send({message:"Id is incorrect"})
    }

    if(operatorCred.password!==operatorCred.confirmPassword){
        res.send({message:"Password and confirm password should be same"})
    }else{
        let opUser=await empCollection.findOne({id:operatorCred.id})
        if(opUser===null){
            res.send({messaage:"Id is incorrect"})
        }else{
            if(opUser.type==="deo"){
                const hashedPassword=await bcryptjs.hash(operatorCred.password,BCRYPT_ROUNDS)
                opUser.password=hashedPassword
                let result= await empCollection.updateOne({id:operatorCred.id},{$set:{password:hashedPassword}})
                res.send({message:"register success"})
            }else{
                res.send({message:"no access to register"})
            }
        }
    }
    }
))

operatorApp.post('/login',async(req,res)=>{
    const user=req.body;

    if(typeof user.id!=='string' || typeof user.password!=='string'){
        return res.send({message:"Invalid id"})
    }

    const opUser=await empCollection.findOne({id:user.id})

    if(opUser===null){
        res.send({message:"Invalid id"})
    }else{
        if(opUser.type!=='deo'){
            res.send({message:"No access for login"})
        }else{
            let status=await bcryptjs.compare(user.password,opUser.password)
            if(!status){
                res.send({message:"Invalid Password"})
            }else{
                const signedToken=jwt.sign({id:opUser.id,role:'operator'},process.env.SECRET_KEY
                                , {expiresIn:'1d'})
                const {password, ...safeOperator} = opUser
                res.send({message:"login success",token:signedToken,operator:safeOperator})
            }
        }
    }
})

operatorApp.post('/employeeAttendance', requireAuth('operator','owner','admin'), async(req,res)=>{
    const attendanceData=req.body;
    try{
    await Promise.all(attendanceData.map(async(emp)=>{

       let result=await employeeAttendance.updateOne(
        { id: emp.id, month: emp.month ,year: emp.year}, // Match condition
        { $set: { noOfPresentDays: emp.noOfPresentDays } }, // Fields to update or set
        { upsert: true } // Insert if no match is found
      );
    }))
    res.send({message:'Attendance recorded successfully!'})
    }catch(err){
        res.status(500).send({message:err.message})
    }

})


operatorApp.get('/attendance/roster', requireAuth('operator','owner','admin'), async (req, res) => {
    const serviceCenter = req.query.serviceCenter
    const month = parseInt(req.query.month, 10)
    const year = parseInt(req.query.year, 10)
    const day = parseInt(req.query.day, 10)

    if (!serviceCenter || !month || !year || !day) {
        return res.status(400).send({ message: "serviceCenter, month, year and day are required" })
    }

    const employees = await empCollection.find({ serviceCenter, status: "Active" }).project({ password: 0 }).toArray()
    const empIds = employees.map(emp => emp.id)
    const records = await employeeAttendance.find({ id: { $in: empIds }, month, year }).toArray()
    const recordMap = new Map(records.map(rec => [rec.id, rec]))

    const locked = records.some(rec => rec.locked)
    const roster = employees.map(emp => {
        const rec = recordMap.get(emp.id)
        const absentDays = rec?.absentDays || []
        return {
            id: emp.id,
            name: emp.name,
            type: emp.type,
            present: !absentDays.includes(day)
        }
    })

    res.send({ message: "roster", payload: { roster, locked, daysInMonth: daysInMonth(month, year) } })
})

operatorApp.post('/attendance/roster', requireAuth('operator','owner','admin'), async (req, res) => {
    const { serviceCenter, month, year, day, entries } = req.body

    if (!serviceCenter || !month || !year || !day || !Array.isArray(entries) || !entries.length) {
        return res.status(400).send({ message: "Invalid attendance payload" })
    }

    const totalDays = daysInMonth(month, year)
    const ids = entries.map(entry => entry.id)
    const existingRecords = await employeeAttendance.find({ id: { $in: ids }, month, year }).toArray()
    const recordMap = new Map(existingRecords.map(rec => [rec.id, rec]))

    if (existingRecords.some(rec => rec.locked)) {
        return res.status(423).send({ message: `${month}/${year} attendance is finalized and locked` })
    }

    try {
        await Promise.all(entries.map(async (entry) => {
            const existing = recordMap.get(entry.id)
            let absentDays = (existing?.absentDays || []).filter(d => d !== day)
            if (!entry.present) absentDays.push(day)
            const noOfPresentDays = totalDays - absentDays.length

            await employeeAttendance.updateOne(
                { id: entry.id, month, year },
                { $set: { absentDays, noOfPresentDays: String(noOfPresentDays) } },
                { upsert: true }
            )
        }))

        res.send({ message: "Attendance saved for the day" })
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

operatorApp.post('/attendance/finalize', requireAuth('operator','owner','admin'), async (req, res) => {
    const { serviceCenter, month, year } = req.body
    if (!serviceCenter || !month || !year) {
        return res.status(400).send({ message: "serviceCenter, month and year are required" })
    }

    const totalDays = daysInMonth(month, year)
    const employees = await empCollection.find({ serviceCenter, status: "Active" }).toArray()

    await Promise.all(employees.map(async (emp) => {
        const existing = await employeeAttendance.findOne({ id: emp.id, month, year })
        const absentDays = existing?.absentDays || []
        const noOfPresentDays = totalDays - absentDays.length
        await employeeAttendance.updateOne(
            { id: emp.id, month, year },
            { $set: { absentDays, noOfPresentDays: String(noOfPresentDays), locked: true } },
            { upsert: true }
        )
    }))

    res.send({ message: "Attendance finalized" })
})

operatorApp.post('/attendance/unlock', requireAuth('owner','admin'), async (req, res) => {
    const { serviceCenter, month, year } = req.body
    if (!serviceCenter || !month || !year) {
        return res.status(400).send({ message: "serviceCenter, month and year are required" })
    }

    const employees = await empCollection.find({ serviceCenter }).project({ password: 0 }).toArray()
    await employeeAttendance.updateMany(
        { id: { $in: employees.map(e => e.id) }, month, year },
        { $set: { locked: false } }
    )

    res.send({ message: "Attendance unlocked" })
})

operatorApp.get('/employeedetails/:serviceCenter', requireAuth('operator','owner','admin'), async(req,res)=>{
    const serviceCenter = req.params.serviceCenter
    const empList = await empCollection.find({serviceCenter:serviceCenter , status:"Active"}).project({password:0}).toArray();

    res.send({message : "All the employees ",payload : empList})

})

operatorApp.post('/fetchattendance', requireAuth('operator','owner','admin'), async (req, res) => {
    const month = req.body.month; // Given month (1-12)
    const year = req.body.year;   // Given year (e.g., 2025)
    const empList = req.body.empList;

    try {
        // Use Promise.all to ensure all async operations are completed
        const AttedanceInfo = await Promise.all(empList.map(async (employee) => {
            // Format the start and end date as strings "YYYY-MM-DD"
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;  // Start of the month
            const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;  // Start of the next month

            const records = await employeeAttendance.find({
                id: employee.id,
                date: { 
                    $gte: startDate,  // Match the string format for start of the month
                    $lt: endDate      // Match the string format for start of the next month
                }
            }).toArray();
            if(records.length!==0)
                  return records; // Return the records for each employee
        }));

        res.send(AttedanceInfo); // Send the array of attendance records to the client
    } catch (error) {
        res.status(500).send({ error: 'Error fetching attendance data' });
    }
});



module.exports = operatorApp