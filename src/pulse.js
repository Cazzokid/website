"use strict";

const mysql  = require("promise-mysql");
const config = require("../config/db/pulse.json");

let db;

(async function() {
    db = await mysql.createConnection(config);

    process.on("exit", () => {
        db.end();
    });
})();


async function userlogin(email) {
    let sql = `CALL userlogin(?);`;
    let res;

    res = await db.query(sql, [email]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function changepassword(email, password) {
    let sql = `CALL changepassword(?, ?);`;
    let res;

    res = await db.query(sql, [email, password]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function addtoken(email, token) {
    let sql = `CALL addtoken(?, ?);`;
    let res;

    res = await db.query(sql, [email, token]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function verifytoken(token) {
    let sql = `CALL verifytoken(?);`;
    let res;

    res = await db.query(sql, [token]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function showdashboard(username) {
    let sql = `CALL showprojectdashboard(?);`;
    let res;

    res = await db.query(sql, [username]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function showupdates(username, credentials) {
    let sql = `CALL showupdates(?, ?);`;
    let res;

    res = await db.query(sql, [username, credentials]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}


async function showreportdashboard(username) {
    let sql = `CALL showreportdashboard(?);`;
    let res;

    res = await db.query(sql, [username]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}


async function showusers() {
    let sql = `CALL showusers();`;
    let res;

    res = await db.query(sql);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function showusersinproject(projectid) {
    let sql = `CALL showusersinproject(?);`;
    let res;

    res = await db.query(sql, [projectid]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function showuserprofile(username) {
    let sql = `CALL showuserprofile(?);`;
    let res;

    res = await db.query(sql, [username]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function createproject(projectname, projectfrequency, reportday, reporttime, datetimeStart, datetimeEnd, userid) {
    let sql = `CALL createproject(?, ?, ?, ?, ?, ?, ?);`;
    let res;

    res = await db.query(sql, [projectname, projectfrequency, reportday,reporttime, datetimeStart, datetimeEnd, userid]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}


async function editproject(projectid, projectname, projectfrequency,reportday, reporttime, startdate, enddate) {
    let sql = `CALL editproject(?, ?, ?, ?, ?, ?, ?);`;
    let res;

    res = await db.query(sql, [projectid, projectname, projectfrequency, reportday, reporttime, startdate, enddate]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function addusertoproject(projectid, userid) {
    let sql = `CALL addusertoproject(?, ?);`;
    let res;

    res = await db.query(sql, [projectid, userid]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function createuser(user_id, username, email, adress, phonenumber) {
    let sql = `CALL createuser(?, ?, ?, ?, ?);`;
    let res;

    res = await db.query(sql, [user_id, username, email, adress, phonenumber]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function createreport(reportname, description, startdate, enddate, userid, projectid) {
    let sql = `CALL createreport(?, ?, ?, ?, ?, ?);`;
    let res;

    res = await db.query(sql, [reportname, description, startdate, enddate, userid, projectid]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function reportinformation(reportid) {
    let sql = `CALL reportinformation(?);`;
    let res;

    res = await db.query(sql, [reportid]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function editreport(reportid, reportname, description, startdate, enddate) {
    let sql = `CALL editreport(?, ?, ?, ? , ?);`;
    let res;

    res = await db.query(sql, [reportid, reportname, description, startdate, enddate]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);

    return res[0];
}

async function updatereport(contentid, reportid, content, status) {
    let sql = `CALL updatereport(?, ?, ?, ?);`;
    let res;

    res = await db.query(sql, [contentid, reportid, content, status]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function showcontent(reportid) {
    let sql = `CALL showcontent(?);`;
    let res;

    res = await db.query(sql, [reportid]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function getreports() {
    let sql = `CALL getreports();`;
    let res;

    res = await db.query(sql);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[0];
}

async function getuserdeadlines(username) {
    let sql = `CALL getuserdeadlines(?);`;
    let res;

    res = await db.query(sql, [username]);

    console.info(`SQL: ${sql} got ${res.length} rows.`);
    return res[2];
}



module.exports = {
    userlogin: userlogin,
    changepassword: changepassword,
    addtoken: addtoken,
    verifytoken: verifytoken,
    showdashboard: showdashboard,
    showupdates: showupdates,
    showreportdashboard: showreportdashboard,
    showusers: showusers,
    showusersinproject: showusersinproject,
    showuserprofile: showuserprofile,
    createproject: createproject,
    editproject: editproject,
    addusertoproject: addusertoproject,
    createuser: createuser,
    createreport: createreport,
    reportinformation: reportinformation,
    editreport: editreport,
    updatereport: updatereport,
    showcontent: showcontent,
    getreports: getreports,
    getuserdeadlines: getuserdeadlines

};
