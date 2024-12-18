const express =require("express");
const wrapAsync = require("../utils/wrapAsync");
const User= require("../models/user.js");
const passport = require("passport");
const router = express.Router();
const OTP = require("../models/OTP.js")
const {savedUrl}= require("../middleware.js")
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender.js");


router.get("/signup",(req,res)=>{
    res.render("./user/signup.ejs");
});

router.post("/signup", wrapAsync(async(req,res,next)=>{
    let{username,email,password}=req.body;

    //generate otp and save to the otp modal 
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false });
    await OTP.create({ email, otp });




    // sent otp on email 

    const title = "Your Otp For Expense Tracker "
    const body = `<p>Hello,</p>
                       <p>Your OTP for completing the signup process is: <strong>${otp}</strong></p>
                       <p>This OTP will expire in 5 minutes.</p>`;

    await mailSender(email, title , body)
    console.log("otp sent successfully and otp is ", otp)

    //store user data temperory in session 
    req.session.tempUserData = {username , email, password};

    req.flash("info", "an Otp has been Sent to your email for Verification..");
    res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);


    // const newUser=new User({email,username});
    // const registeredUser = await User.register(newUser,password);
    // req.login(registeredUser,(err)=>{
    //     if(err){
    //         return next(err);
    //     }
    //     req.flash("success","Your acount created succssesfully!");
    //     res.redirect("/home");
    // })


}))


//rendring otp verification page where we have to enter otp 
router.get("/verify-otp", (req, res)=>{
    const {email}= req.query || req.body || req.params;
    res.render("./user/verify-otp.ejs",{email});

})


//verify otp and comeplete sighnup 

router.post("/verify-otp", wrapAsync(async(req, res, next)=>{
    const{email, otp} = req.body;

    //find otp in the database
    const otpRecord =  await OTP.findOne({email, otp});

    if(!otpRecord){
        req.flash("error", "Invalid Or expired OTP, please Try again ");
        return res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
    }

    // if otp is valid , then delete kro database me se 
    await  OTP.deleteOne({email, otp});

    //register kro user ko data saved in the session ke sath 
    const{username, password} = req.session.tempUserData;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);

    //clera kro temperory data form session 

    // log the user in and redirect 
    req.login(registeredUser, (error)=>{
        if(error) return next(error);
        req.flash("success", "Account Created Successfully!")
        res.redirect("/home");

    })



}))

router.get("/login",(req,res)=>{
    res.render("./user/login.ejs");
});

router.post("/login",savedUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
    req.flash("success","welcome back to Expense Tracker!");
    let redirectUrl=res.locals.redirectUrl || "/home"
    res.redirect(redirectUrl);
})

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/home");
    })
})

module.exports=router;