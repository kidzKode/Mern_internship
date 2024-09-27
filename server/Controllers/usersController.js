const users = require('../models/usersSchema')
const userregisters = require('../models/userRegister')
const moment = require('moment')
const csv = require('fast-csv')
const fs = require('fs');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const { BASE_URL } = require('../../client/src/services/helper');

//Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await userregisters.findOne({ email });
        const errorMsg = 'Auth failed email or password is wrong';
        if (!existingUser) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
      
        const isPassEqual = await bcrypt.compare(password, existingUser.password)
        if(!isPassEqual){
            return res.status(403)
            .json({ message: errorMsg, success: false });

        }
        const jwtToken = jwt.sign({email: userregisters.email, _id: userregisters._id },
            process.env.JWT_SECRET,
            { expiresIn :'24'}
        )
        res.status(201)
            .json({
                message: "Login successfully",
                success: true,
                jwtToken,
                email,
                username: userregisters.username
            })
    } catch (err) {
        console.error(err);
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
}
//signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await userregisters.findOne({ email });
        if (existingUser) {
            return res.status(409)
                .json({ message: 'User is already exist, you can login', success: false });
        }
        const newUser =  new userregisters({ username, email, password });
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();
        res.status(201)
            .json({
                message: "Signup successfully",
                success: true
            })
    } catch (err) {
        console.error(err);
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
}

exports.userPost = async (req, res) => {
    const file = req.file.filename;
    const { fname, lname, email, mobile, gender, designation, course, location } = req.body;

    if (!fname || !lname || !email || !mobile || !gender|| !designation || !course || !location || !file) {
        res.status(401).json("All Inputs is required")
    }


    try {
        const preuser = await users.findOne({ email: email });

        if (preuser) {
            res.status(401).json("This user already exist in our databse")
        } else {

            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

            const userData = new users({
                fname, lname, email, mobile, gender,designation,course, location, file, datecreated
            });
            await userData.save();
            res.status(200).json(userData);
        }
    }
    catch (error) {
        res.status(500).json(error);
        console.log("catch block error")
    }

}

//user get------------------------------------------------------
exports.userget = async (req, res) => {
    const search = req.query.search || ""
    const gender = req.query.gender || "" 
    const designation = req.query.designation || ""; // New field
    const course = req.query.course || "";
    const sort = req.query.sort || ""
    const page = req.query.page || 1
    const ITEM_PER_PAGE = 4;

    // console.log(req.query)

    const query = {
        fname: { $regex: search, $options: "i" }
    }
    if (gender !== "All") {
        query.gender = gender
    }
    if (designation) {
        query.designation = designation; // Assuming designation is stored as a string
    }

    // Adding course filter
    if (course) {
        query.course = course; // Assuming course is stored as a string
    }

    try {

        const skip = (page - 1) * ITEM_PER_PAGE // 1*4=4
        //count for total data
        const count = await users.countDocuments(query);
        console.log(count)
        // console.log(req.query)
        const userData = await users.find(query).sort({ datecreated: sort == "new" ? -1 : 1 })
            //pagination
            .limit(ITEM_PER_PAGE)
            .skip(skip)

        const pageCount = Math.ceil(count / ITEM_PER_PAGE);   // 8/4=2


        res.status(200).json({
            Pagination: {
                count, pageCount
            },
            userData
        })
    }
    catch (err) {
        res.status(401).json(err)
    }

}

//single user get--------------------------
exports.singleuserget = async (req, res) => {

    const { id } = req.params;

    try {
        const userdata = await users.findOne({ _id: id });
        res.status(200).json(userdata)
    }
    catch (error) {
        res.status(401).json(error)

    }

}
//update user-------------------------------------
exports.useredit = async (req, res) => {
    const { id } = req.params;
    const { fname, lname, email, mobile, gender, location, status, user_profile } = req.body;
    const file = req.file ? req.file.filename : user_profile

    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    try {
        const updateuser = await users.findByIdAndUpdate({ _id: id }, {
            fname, lname, email, mobile, gender, location, designation, course, user_profile: file, dateUpdated
        }, {
            new: true
        });

        await updateuser.save();
        res.status(200).json(updateuser);
    } catch (error) {
        res.status(401).json(error)
    }
}

//-user delete----------------------------------------
exports.userdelete = async (req, res) => {
    const { id } = req.params;

    try {
        const delteuser = await users.findByIdAndDelete({ _id: id })
        res.status(200).json(delteuser)

    }
    catch (error) {
        res.status(401).json(error)
    }
}

//-----------------------------------------status

exports.userstatus = async (req, res) => {
    const { id } = req.params
    const { data } = req.body

    try {
        const userstastusupdate = await users.findByIdAndUpdate({ _id: id }, { status: data }, { new: true });
        res.status(200).json(userstastusupdate);
    }
    catch {
        res.status(401).json(error)

    }
}
//  Xport

exports.userExport = async (req, res) => {
    try {
        const usersdata = await users.find();

        const csvStream = csv.format({ headers: true });

        if (!fs.existsSync("public/files/export/")) {
            if (!fs.existsSync("public/files")) {
                fs.mkdirSync("public/files/");
            }
            if (!fs.existsSync("public/files/export")) {
                fs.mkdirSync("./public/files/export/");
            }
        }

        const writablestream = fs.createWriteStream(
            "public/files/export/users.csv"
        );

        csvStream.pipe(writablestream);

        writablestream.on("finish", function () {
            res.json({
                downloadUrl: `http://localhost:6010/files/export/users.csv`
            });
        });
        if (usersdata.length > 0) {
            usersdata.map((user) => {
                csvStream.write({
                    FirstName: user.fname ? user.fname : "-",
                    LastName: user.lname ? user.lname : "-",
                    Email: user.email ? user.email : "-",
                    Phone: user.mobile ? user.mobile : "-",
                    Gender: user.gender ? user.gender : "-",
                    designation: user.designation ? user.designation : "-",
                    course: user.course ? user.course : "-",
                    Profile: user.profile ? user.profile : "-",
                    Location: user.location ? user.location : "-",
                    DateCreated: user.datecreated ? user.datecreated : "-",
                    DateUpdated: user.dateUpdated ? user.dateUpdated : "-"
                })
            })
        }
        csvStream.end();
        writablestream.end();

    }
    catch (error) {
        res.status(401).json(error)

    }
}