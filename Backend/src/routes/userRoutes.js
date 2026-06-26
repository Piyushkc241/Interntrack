const express=require("express");
const router=express.Router();
const {getUsers,getUserById,postUsers}=require("../controllers/userControllers");

router.get("/",getUsers);
router.post("/",postUsers);
router.get("/:id",getUserById);

module.exports=router;