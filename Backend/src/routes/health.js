const express=require("express");
const router=express.Router();
const logger=require("../middleware/logger");

router.get("/health",logger,(req,res)=>{
    res.status(200).json({
        success:true,
        message:"heallthy"
    });
});
module.exports=router;