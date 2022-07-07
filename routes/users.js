const router = require("express").Router()
const User = require('../models/User')
const authJwt = require('../middlewares/authJwt')
const bcrypt = require('bcrypt')

// Upate user
router.put("/update", authJwt, async (req, res) => {

    // If password is updated, encrypt new one
    if (req.body.password) {
        try {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        } catch (e) {
            return res.json(err)
        }
    }

    // Update rest of account
    try {
        const user = await User.findByIdAndUpdate(req.userId,{$set:req.body})
        res.status(200).json("Account has been updated")
    } catch (e) {
        return res.json(e)
    }

})

// Delete user
router.delete("/update", authJwt, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.userId)
        res.status(200).json("Account has been deleted")
    } catch (e) {
        console.log(e)
        return res.json(e)
    }
})

// Get a user
router.get("/:id", authJwt, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const {password,updatedAt, ...other} = user._doc // Leave password and updatedAt values out from returned data
        res.status(200).json(other)
    } catch (e) {
        console.log(e)
        return res.status(500).json(err)
    }
})

// Follow user
router.put("/:id/follow", authJwt, async (req, res) => {

    // User following account other than their own
    if (req.userId !== req.params.id) {

        try {
            // Find both users in DB
            const newFollowing = await User.findById(req.params.id)
            const currentUser = await User.findById(req.userId)

            // Check if user already follows account
            if (!newFollowing.followers.includes(req.userId)) {
                await newFollowing.updateOne({$push:{followers: req.userId}})
                await currentUser.updateOne({$push:{following: req.params.id}})
                res.status(200).json("User has been followed")
            } else {
                res.status(403).json("You already follow this user")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json(err)
        }
    
    } else {
        res.status(403).json("You can't follow yourself")
    }

})

// Unfollow user
router.put("/:id/unfollow", authJwt, async (req, res) => {
    // User following account other than their own
    if (req.userId !== req.params.id) {
        try {
            // Find both users in DB
            const newFollowing = await User.findById(req.params.id)
            const currentUser = await User.findById(req.userId)

            // Check if user already follows account
            if (newFollowing.followers.includes(req.userId)) {
                await newFollowing.updateOne({$pull:{followers: req.userId}})
                await currentUser.updateOne({$pull:{following: req.params.id}})
                res.status(200).json("User has been unfollowed")
            } else {
                res.status(403).json("You do not follow this user")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can't unfollow yourself")
    }
})

module.exports = router