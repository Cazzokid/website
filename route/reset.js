// This is just a file I run when I have reset my database.
// It's for the passwords for my users that are in the project. 
// I hash them here and then copy them into my database.

const pulse       = require("../src/pulse.js");
const bcrypt = require("bcrypt")

const password1 = "123";
const password2 = "abc";
const password3 = "hej";

async function main() {
    const hashedPassword = await bcrypt.hash(password1, 10);
    const hashedPassword2 = await bcrypt.hash(password2, 10);
    const hashedPassword3 = await bcrypt.hash(password3, 10);

    await pulse.changepassword('Cassofluhr@hotmail.com', hashedPassword);
    await pulse.changepassword('pulse@projekt.com', hashedPassword2);
    await pulse.changepassword('cafl22@student.bth.se', hashedPassword3);
}

main();