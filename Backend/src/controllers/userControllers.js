const pool=require("../config/db");

const getUsers=async (req,res)=>{
    try{
        const allUsers= await pool.query("SELECT * FROM users");
        res.status(200).json(allUsers.rows);
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"internal server error"
        });
    }
    };

const getUserById=async(req,res)=>{
        console.log(`id is ${req.params.id}`);
    };
const postUsers=async (req,res)=>{
    try{
        const {name,email,phone,password}=req.body;
        const newUser=await pool.query(
            `INSERT INTO users
            (name, email , phone, password)
            VALUES ($1,$2,$3,$4)
            Returning *`,
            [name,email,phone,password]
        );
        res.status(201).json(newUser.rows[0]);
    }catch(err){
        res.status(501).json({
            message:"Internal server error"
        });
    }

};

module.exports={getUsers,getUserById,postUsers};