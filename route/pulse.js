"use strict";

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express    = require("express");
const router     = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const pulse       = require("../src/pulse.js");
const sitename   = "| Project Pulse!";
const fs = require("fs");
const { parse } = require("csv-parse");
const multer = require('multer');
const upload = multer();

const bcrypt = require("bcrypt")
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

const makeEmail = require("./mail-config.js");
const crypto = require("crypto");

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )



const users = []


router.use(express.urlencoded({extended: false}))
router.use(flash())
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
router.use(passport.initialize()) 
router.use(passport.session())
router.use(methodOverride("_method"))


module.exports = router;

router.get('/login', checkNotAuthenticated, (req, res) => {
    let data = {
        title: "Login",
        error: req.flash("error") 
    };

    res.render("pulse/login.ejs", data);
});


router.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/pulse/dashboard",
    failureRedirect: "/pulse/login",
    failureFlash: true
}))


router.get("/register", async (req, res) => {
    let data = {
        title: `Register ${sitename}`,
        error: ""
    };

    res.render("pulse/register", data);
});

router.post("/register", upload.single('csvfile'), async (req, res) => {
    try {
        if (!req.file) {
            const data = {
                title: `Register ${sitename}`,
                error: "No CSV file selected",
            };

            return res.render("pulse/register", data);
        }

        const users = await readcsvcontent(req.file.buffer.toString());

        for (const user of users) {
            await pulse.createuser(user.user_id, user.username, user.email, user.adress, user.phonenumber);

            const usertoken = {
                email: user.email,
                token: crypto.randomBytes(64).toString("hex")
            }
            const resetLink = `http://localhost:1337/pulse/password?token=${usertoken.token}`
            await pulse.addtoken(usertoken.email, usertoken.token);

            await makeEmail(user.email, resetLink);
        }

        res.redirect("/pulse/users");
    }
    catch (error) {
        console.error(error);
        let errorMessage = "An error occurred while creating the user.";
        
        if (error.message.includes('User already exists')) {
            errorMessage = "A user with the provided details already exists.";
        }
        
        const errorData = {
            title: `Register ${sitename}`,
            error: errorMessage,
        };

        res.render("pulse/register", errorData);
    }
});


router.get("/changepassword", checkAuthenticated, async (req, res) => {
    const { username, credentials } = req.user;

    let data = {
        title: `Change Password ${sitename}`,
        username: username,
        credentials: credentials,
        error: ""
    };

    res.render("pulse/changepassword", data);
});


router.post("/changepassword", urlencodedParser, async (req, res) => {
    const { username, credentials, email} = req.user;

    try {
        const usertoken = {
            email: email,
            token: crypto.randomBytes(64).toString("hex")
        };
        const resetLink = `http://localhost:1337/pulse/password?token=${usertoken.token}`;
        
        await pulse.addtoken(usertoken.email, usertoken.token);
        await makeEmail(email, resetLink);

        let data = {
            title: `Change Password ${sitename}`,
            username: username,
            credentials: credentials,
            error: "An email has been sent to your email address."
        }; 

        res.render("pulse/changepassword", data);
    } catch (error) {
        console.error(error);

        let data = {
            title: `Change Password ${sitename}`,
            username: username,
            credentials: credentials,
            error: "An error occurred while sending the email."
        };

        res.render("pulse/changepassword", data);
    }
});


router.get("/password", async (req, res) => {
    const { token } = req.query;
    let data = {
        title: `Password ${sitename}`,
        error: "",
        token: token
    };

    res.render("pulse/password", data);
});

router.post("/password", urlencodedParser, async (req, res) => {

    let data = {
        title: `Password Change ${sitename}`,
        error: "",
        token: req.body.token
    };

    try {
        const { token, password } = req.body;
        const tokenResult = await pulse.verifytoken(token);
        console.log(tokenResult);

        if (!tokenResult[0] || tokenResult[0].token_count === 0) {
            data.error = "Token does not exist or has been used";
            return res.render("pulse/password", data);
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await pulse.changepassword(tokenResult[0].email, hashedPassword);
        res.redirect(`/pulse/login`);
    }
    catch (error) {
        console.error(error);
        res.render("pulse/password", data);
    }
});



router.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/pulse/login")
    })
})


router.get("/dashboard", checkAuthenticated, async (req, res) => {
    const { username, credentials } = req.user;

    let dashboardtemp = "userdashboard.ejs"
    if (credentials == "manager") {
        dashboardtemp = "managerdashboard.ejs"
    }

    let data = {
        title: `Dashboard ${sitename}`,
        username: username,
        credentials: credentials,
        error: ""
    };

    data.updates = await pulse.showupdates(username, credentials);
    data.dashboard = await pulse.showdashboard(username);

    res.render(`pulse/${dashboardtemp}`, data);
});


router.get("/profile", checkAuthenticated, async (req, res) => {
    const { username, credentials } = req.user;

    let data = {
        title: `Profile ${sitename}`,
        username: username,
        credentials: credentials,
        error: ""
    };
    data.profile = await pulse.showuserprofile(username);
    data.reports = await pulse.getuserdeadlines(username);
    console.log(data.reports);

    let profiletemp = "profile.ejs"
    if (credentials == "manager") {
        profiletemp = "managerprofile.ejs"
    }

    res.render(`pulse/${profiletemp}`, data);
});


router.get("/users", checkManager, async (req, res) => {
    const { username, credentials } = req.user;

    let data = {
        title: `Users ${sitename}`,
        username: username,
        credentials: credentials,
        error: ""
    };

    data.users = await pulse.showusers();

    res.render("pulse/users", data);
});


router.get("/createproject", checkManager, async (req, res) => {
    const { user_id } = req.user;

    let data = {
        title: `Create Project ${sitename}`,
        error: "",
        user_id: user_id
    };

    res.render("pulse/createproject", data);
});

router.post("/createproject", urlencodedParser, async (req, res) => {
    
    let reportDay = req.body.reportday;
    if (req.body.projectfrequency === "daily") {
        reportDay = null;  
    }

    await pulse.createproject(req.body.projectname, 
        req.body.projectfrequency, reportDay, req.body.reporttime,
        req.body.datetimeStart, req.body.datetimeEnd, req.body.user_id);

    await pulse.getupcomingreportswithtime();

    
    res.redirect("/pulse/dashboard");
});

router.get("/project/:projectid", checkManager, async (req, res) => {
    const { projectid } = req.params;
    const { username, credentials } = req.user;

    let data = {
        title: `Project ${sitename}`,
        username: username,
        credentials: credentials,
        error: ""
    };

    data.users = await pulse.showusersinproject(projectid);
    data.report = await pulse.showreportdashboard(projectid);
    data.project = await pulse.showdashboard(username);
    data.project = data.project.find(p => p.project_id == projectid);

    console.log(data.project);

    res.render("pulse/project", data);
});

router.get("/userproject/:projectid", checkAuthenticated, async (req, res) => {
    const { projectid } = req.params;
    const { username, credentials } = req.user;

    let data = {
        title: `Project ${sitename}`,
        username: username,
        credentials: credentials,
        error: ""
    };

    let allReports = await pulse.showreportdashboard(projectid);
    
    data.report = allReports.filter(report => report.assigned_username === username);
    data.project = await pulse.showdashboard(username);
    data.project = data.project.find(p => p.project_id == projectid);

    res.render("pulse/userproject", data);
});


router.get("/editproject/:projectid", checkManager , async (req, res) => {
    const { projectid } = req.params;
    const { username } = req.user;

    let data = {
        title: `Edit Project ${sitename}`,
        error: req.flash('addmembererror'),
        username: username,
        projectid: projectid
    };

    data.add = await pulse.showusers();
    data.users = await pulse.showusersinproject(projectid);
    data.report = await pulse.showreportdashboard(projectid);
    data.project = await pulse.showdashboard(username);
    data.project = data.project.find(p => p.project_id == projectid);

    res.render("pulse/editproject", data);
});

router.post("/editproject", urlencodedParser, async (req, res) => {

    await pulse.editproject(req.body.projectid, req.body.projectname,
        req.body.projectfrequency, req.body.reportday, req.body.reporttime, req.body.datetimeStart, req.body.datetimeEnd);
    
    res.redirect("/pulse/dashboard");
});

router.post("/addmember", urlencodedParser, async (req, res) => {
    const projectid = req.body.projectid;
    const username = req.body.username;
    const user_id = req.body.user_id; 
    
    try {
        await pulse.addusertoproject(projectid, user_id); 
        res.redirect(`/pulse/editproject/${projectid}`);
    } 
    catch (error) {
        console.error(error);
        req.flash('addmembererror', 'Member is already in the project!');
        res.redirect(`/pulse/editproject/${projectid}`);
    }
});

router.get("/createreport/:projectid", checkManager, async (req, res) => {
    const { projectid } = req.params;
    const { username, credentials } = req.user;

    let data = {
        title: `Create Report ${sitename}`,
        username: username,
        credentials: credentials,
        error: "",
        projectid: projectid
    };
    
    data.add = await pulse.showusers();
    data.users = await pulse.showusersinproject(projectid);
    console.log(data.users);
    data.report = await pulse.showreportdashboard(projectid);
    
    let projectStartDate;
    let projectEndDate;

    for (let report of data.report) {
        if (report.project_id == projectid) {
            projectStartDate = report.project_start_date;
            projectEndDate = report.project_end_date;
            break;
        }
    }

    data.project_start_date = projectStartDate;
    data.project_end_date = projectEndDate;
    res.render("pulse/createreport", data);
});

router.post("/createreport", urlencodedParser, async (req, res) => {
    const { projectid, user_id} = req.body;

    await pulse.createreport(req.body.reportname, req.body.description, 
        req.body.datetimeStart,req.body.datetimeEnd,user_id, projectid);

    res.redirect(`/pulse/project/${projectid}`);
});


router.get("/reports/:reportid", checkAuthenticated, async (req, res) => {
    const { reportid } = req.params;
    const { username, credentials } = req.user;

    let data = {
        title: `Reports ${sitename}`,
        username: username,
        credentials: credentials,
        reportid: reportid,
        error: ""
    };

    data.report = await pulse.reportinformation(reportid);
    data.content = await pulse.showcontent(reportid);

    if (data.content.length === 0) {
        data.content = [{content: ""}];
    }

    console.log(data.content);
    res.render("pulse/reports", data);
});


router.get("/editreport/:reportid", checkManager, async (req, res) => {
    const { reportid } = req.params;
    let data = {
        title: `Edit Report ${sitename}`,
        error: ""
    };

    data.report = await pulse.reportinformation(reportid);

    data.project_start_date = data.report[0].project_start_date;
    data.project_end_date = data.report[0].project_end_date;
    res.render("pulse/editreport", data);
});

router.post("/editreport", urlencodedParser, async (req, res) => {
    const { reportid } = req.body;

    await pulse.editreport(reportid, req.body.reportname,req.body.description, 
        req.body.datetimeStart,req.body.datetimeEnd);
        
        res.redirect(`/pulse/reports/${reportid}`);
});

router.get("/userreport/:reportid", checkAuthenticated, async (req, res) => {
    const { reportid } = req.params;
    const { username, credentials } = req.user;

    let data = {
        title: `Reports ${sitename}`,
        username: username,
        credentials: credentials,
        reportid: reportid,
        error: ""
    };

    data.report = await pulse.reportinformation(reportid);
    data.content = await pulse.showcontent(reportid);
    console.log(data.content);

    if (data.content.length === 0) {
        data.content = [{report_comments: ""}];
    }

    console.log(data.content);

    /* I now have a procedure in my database that will return the next submission time for a report
    - but I was not able to get it working for submissions in time for deadline so 
    I will leave my "temporary" solution in place for now */

    let lastSubmissionTime = null;
    if (data.content && data.content.length > 0) {
        data.content.sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time));
        lastSubmissionTime = data.content[0].submission_time;
    }

    let isSubmittable = true;
    if (lastSubmissionTime) {
        const currentTime = new Date();
        isSubmittable = currentTime >= getNextSubmissionTime(lastSubmissionTime, data.report[0].report_frequency, data.report[0].report_day, data.report[0].reporting_time);
    }
 
    data.isSubmittable = isSubmittable;
    data.getNextSubmissionTime = getNextSubmissionTime(lastSubmissionTime, data.report[0].report_frequency, data.report[0].report_day, data.report[0].reporting_time);

    console.log(lastSubmissionTime);
    console.log(data.getNextSubmissionTime);

    res.render("pulse/userreport", data);
});

router.post("/updatereport", urlencodedParser, async (req, res) => {
    const { reportid, content , status} = req.body;

    await pulse.updatereport(req.body.contentid, reportid, content, status);
        
        res.redirect(`/pulse/userreport/${reportid}`);
});

router.post("/updatereportmanager", urlencodedParser, async (req, res) => {
    const { reportid, feedback , status} = req.body;

    await pulse.updatereport(req.body.contentid, reportid, feedback, 'read');
        
        res.redirect(`/pulse/reports/${reportid}`);
});

router.post("/readreport", urlencodedParser, async (req, res) => {
    const { reportid, contentid} = req.body;

    await pulse.updatereport(contentid, reportid, null , 'read');

    res.redirect(`/pulse/reports/${reportid}`);
});

  
function checkManager(req, res, next){
    if(req.isAuthenticated() && req.user.credentials == "manager"){
        return next()
    }
    res.redirect("/pulse/dashboard")
}

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/pulse/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/pulse/login")
    }
    next()
}


async function readcsvcontent(content) {
    return new Promise((resolve, reject) => {

        const data = [];
        parse(content, {
            delimiter: ",",
            columns: true,
            ltrim: true,
        })
        .on("data", function (row) {
            data.push(row);
        })
        .on("error", function (error) {
            console.log(error.message);
            reject(error);
        })
        .on("end", function () {
            console.log(data);
            resolve(data);
        });
    });
}

function getNextSubmissionTime(lastSubmissionTime, report_frequency, report_day, reporting_time) {
    const nextTime = new Date(lastSubmissionTime);
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    switch (report_frequency) {
        case "daily":
            nextTime.setDate(nextTime.getDate() + 1);
            
            // If next day is Saturday or Sunday, skip to Monday
            while (nextTime.getDay() === 0 || nextTime.getDay() === 6) {
                nextTime.setDate(nextTime.getDate() + 1);
            }
            
            break;
        case "weekly":
            do {
                nextTime.setDate(nextTime.getDate() + 1);
            } while (daysOfWeek[nextTime.getDay()] !== report_day.toLowerCase());
            
            break;
        case "monthly":
            nextTime.setMonth(nextTime.getMonth() + 1);
            break;
        case "fortnight":
            nextTime.setDate(nextTime.getDate() + 14);
            break;
    }

    const [hours, minutes] = reporting_time.split(":");
    nextTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextTime;
}
