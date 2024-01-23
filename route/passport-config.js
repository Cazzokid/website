const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const pulse = require("../src/pulse.js");

const initialize = (passport, getUserByEmail, getUserById) => { 
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await pulse.userlogin(email);

            if (!user || !user[0] || !(await bcrypt.compare(password, user[0].password))) {
                return done(null, false, { message: "Invalid email or password" });
            }

            return done(null, user);
        }
        catch (error) {
            console.error(error);
            return done(error);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => {
        const userSession = {
            username: user[0].username,
            credentials: user[0].credentials,
            user_id: user[0].user_id,
            email: user[0].email,
        }
        done(null, userSession)
    })
    passport.deserializeUser((userSession, done) => {
        return done(null, userSession)
    })
};

module.exports = initialize;
