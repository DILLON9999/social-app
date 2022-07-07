const router = require("express").Router()
const Post = require('../models/Post')
const User = require('../models/User')
const authJwt = require('../middlewares/authJwt')

// Create post
router.post('/', authJwt, async(req, res)=> {
    const newPost = new Post(req.body)
    newPost["userId"] = req.userId

    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (e) {
        res.status(500).json(e)
    }
})

// Update post
router.put('/:id', authJwt, async(req, res)=> {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.userId) {
            await post.updateOne({$set: req.body})
            res.status(200).json("Post has been updated")
        } else {
            res.status(403).json("You can not update this post")
        }    
    } catch (e) {
        res.status(500).json(e)
    }
})

// Delete post
router.delete('/:id', authJwt, async(req, res)=> {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.userId) {
            await post.deleteOne()
            res.status(200).json("Post has been deleted")
        } else {
            res.status(403).json("You can not delete this post")
        }    
    } catch (e) {
        res.status(500).json(e)
    }
})

// Like post
router.put('/:id/like', authJwt, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        // Dislike if post is already liked
        if (!post.likes.includes(req.userId)) {
            await post.updateOne({$push:{likes: req.userId}})
            res.status(200).json("Post has been liked")
        } else {
            await post.updateOne({$pull:{likes: req.userId}})
            res.status(200).json("Post has been disliked")
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

// Get post
router.get('/:id', authJwt, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (e) {
        res.status(500).json(e)
    }
})

// Get timeline posts
router.get('/timeline/all', authJwt, async (req, res) => {

    try {
        const currentUser = await User.findById(req.userId)
        const userPosts = await Post.find({userId: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.following.map(friendId=>{
                return Post.find({userId: friendId})
            })
        )
        res.json(userPosts.concat(...friendPosts))
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }
})

module.exports = router