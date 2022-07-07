const router = require("express").Router()
const bcrypt = require('bcrypt')
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require('../models/User')

// Register user
router.post("/register", async (req,res)=> {
    try {

        // Generate encrypted password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        // Create new user with model
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
    
        // Save user and send response
        const user = await newUser.save()
        res.status(200).json(user)

    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }
})

// Login user
router.post("/login", async (req, res)=> {
    try {

        // Find user with given email
        var user = await User.findOne({email: req.body.email})
        user = user.toObject() // Make returned JSON extensible
        !user && res.status(404).json("User not found") // Account with email not found

        // Compare password to encrypted password
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json("Wrong password") // Password incorrect

        // Generate JWT on successful login
        var token = jwt.sign({ id: user["_id"] }, process.env.JWT_SECRET, {expiresIn: 86400});
        user.accessToken = token // Add token to response JSON
    
        res.status(200).json(user)
    
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }
})

module.exports = router