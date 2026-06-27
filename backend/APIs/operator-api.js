
const exp = require('express')
const operatorApp = exp.Router()
const expressAsyncHandler= require('express-async-handler')
const bcryptjs = require('bcryptjs')
const jwt=require('jsonwebtoken')

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

    if(operatorCred.password!==operatorCred.confirmPassword){
        res.send({message:"Password and confirm password should be same"})
    }else{
        let opUser=await empCollection.findOne({id:operatorCred.id})
        if(opUser===null){
            res.send({messaage:"Id is incorrect"})
        }else{
            if(opUser.type==="deo"){
                const hashedPassword=await bcryptjs.hash(operatorCred.password,6)
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
                const signedToken=jwt.sign({id:opUser.id},process.env.SECRET_KEY
                                , {expiresIn:'1d'})
                res.send({message:"login success",token:signedToken,operator:opUser})
            }
        }
    }
})

operatorApp.post('/employeeAttendance',async(req,res)=>{
    const attendanceData=req.body;
    try{
    attendanceData.map(async(emp)=>{

       let result=await employeeAttendance.updateOne(
        { id: emp.id, month: emp.month ,year: emp.year}, // Match condition
        { $set: { noOfPresentDays: emp.noOfPresentDays } }, // Fields to update or set
        { upsert: true } // Insert if no match is found
      );
    })
    res.send({message:'Attendance recorded successfully!'})
    }catch(err){
        res.send({message:err})
    }

})


operatorApp.get('/employeedetails/:serviceCenter', async(req,res)=>{
    const serviceCenter = req.params.serviceCenter
    const empList = await empCollection.find({serviceCenter:serviceCenter , status:"Active"}).toArray();

    res.send({message : "All the employees ",payload : empList})
    
})

operatorApp.post('/fetchattendance', async (req, res) => {
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
            if(records.lenght!==0)
                  return records; // Return the records for each employee
        }));

        res.send(AttedanceInfo); // Send the array of attendance records to the client
    } catch (error) {
        res.status(500).send({ error: 'Error fetching attendance data' });
    }
});



module.exports = operatorApp