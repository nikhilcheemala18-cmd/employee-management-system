const exp=require('express')
const adminApp=exp.Router()
const bcryptjs =require('bcryptjs')
const jwt=require('jsonwebtoken')
const expressAsyncHandler= require('express-async-handler')
const requireAuth = require('../Middlewares/verifyToken')
require('dotenv').config()

const BCRYPT_ROUNDS = 10

let ownerCollection
let empCollection
let adminCollection
adminApp.use((req,res,next)=>{
    ownerCollection = req.app.get('ownerCollection')
    empCollection=req.app.get('empCollection')
    adminCollection=req.app.get('adminCollection')
    next()
})

adminApp.use(exp.json())

adminApp.post('/login',expressAsyncHandler(async(req,res)=>{
    const adminCred = req.body;

    if(typeof adminCred.id!=='string' || typeof adminCred.password!=='string'){
        return res.send({message:"Invalid admin id"})
    }

    const dbadmin = await adminCollection.findOne({id: adminCred.id})
    if(dbadmin===null){
        res.send({message:"Invalid admin id"})
    }else{
        let status = await bcryptjs.compare(adminCred.password, dbadmin.password)
        if(!status){
            res.send({message:"Invalid password"})
        }else{
            const signedToken=jwt.sign({id:dbadmin.id,role:'admin'},process.env.SECRET_KEY
                , {expiresIn:'1d'})
            const {password, ...safeAdmin} = dbadmin
            res.send({message:"Login success",token:signedToken,admin:safeAdmin})
        }
    }
}))

adminApp.post('/ownerregistration', requireAuth('admin'), expressAsyncHandler(async(req,res)=>{
    const newOwner=req.body;

    const dbowner = await ownerCollection.findOne({id :newOwner.id})

    if(dbowner!==null){
        res.send({message :" owner exists"})
    }else{
        const hashedPassword=await bcryptjs.hash(newOwner.password,BCRYPT_ROUNDS)
        newOwner.password = hashedPassword
        await ownerCollection.insertOne(newOwner)
        res.send({message :"owner created"})
    }
}))


adminApp.get('/owners', requireAuth('admin'), expressAsyncHandler(async(req,res)=>{

    const ownerList = await ownerCollection.find().project({password:0}).toArray();

    res.send({message :"All owners are", payload:ownerList})
}))

adminApp.post('/employees', requireAuth('owner','admin'), expressAsyncHandler(async (req, res) => {
    try {
        const employees = req.body;

        // Process employees using map() and Promise.all()
        const results = await Promise.all(employees.map(async (employee) => {
            const existingEmployee = await empCollection.findOne({ id: employee.id });

            if (!existingEmployee) {
                await empCollection.insertOne(employee);
                return "inserted";
            } else {
                return "ignored";
            }
        }));

        // Count inserted and ignored employees
        const insertedCount = results.filter(status => status === "inserted").length;
        const ignoredCount = results.filter(status => status === "ignored").length;

        res.status(201).send({
            message: "Employee data processed successfully ",
            inserted: insertedCount,
            ignored: ignoredCount,
        });

    } catch (error) {
        console.error("Error processing employees:", error);
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
}));


module.exports=adminApp