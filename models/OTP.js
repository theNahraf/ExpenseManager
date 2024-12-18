const mongoose = require("mongoose");
// const mailSender  = require("../utils/mailSender");
const mailSender = require("../utils/mailSender");



const OTPschema  = new mongoose.Schema({
    email : {
        type : String,
        required:true
    },
    otp : {
        type : String,
        required:true
    },
    createAt :{
        type : Date,
        default : Date.now(),
        expires : 5*60
    }
})


//otp ko mail me send krrha hu

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email From ExpenseXTracker", otp);
        console.log("Email sent Successfully" , mailResponse);

    }catch(error){
    
        console.log("Error occurs during mail Send ", error);

    }
}

//otp  bhejna hai save krne se pehle

OTPschema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP" , OTPschema);
