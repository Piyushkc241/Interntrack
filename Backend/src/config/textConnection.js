require("dotenv").config({
    path: "../../.env"
});

const pool=require("./db");
async function text() {
    try{
        const result=await pool.query("SELECT NOW()");
        console.log("database connection");
        console.log(result.rows[0]);

    }
    catch(err){
        console.log(err);
    }
};
text();