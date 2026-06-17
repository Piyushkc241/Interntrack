const express=require("express");
const cors=require("cors");
const health=require("./routes/health");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("InternTrack API running");
});
app.use("/",health);

module.exports=app;