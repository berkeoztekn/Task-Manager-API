const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationMail} = require('../emails/account')


const router = new express.Router()

router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {

        await user.save()

        sendWelcomeEmail(user.email, undefined)

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })

    } catch (error) {

        res.status(400).send(error.message)

    }

})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()

        res.send({ user, token })

    } catch (error) {

        res.status(400).send(error.message)

    }

})

router.post('/users/logout', auth, async (req, res) => {

    try {

        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)

        await req.user.save()

        res.send('Logout was successful')

    } catch (error) {
        res.status(500).send()
    }

})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {

        req.user.tokens = []

        await req.user.save()

        res.send('Logout all was successful')

    } catch (error) {
        res.status(500).send()
    }

})

router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)

})

router.get('/users/:id', async (req, res) => {

    const _id = req.params.id

    try {

        const user = await User.findById(_id)

        res.send(user)

    } catch (error) {

        if (error.kind === 'ObjectId') {
            res.status(404).send()
        }

        res.send(500).send(error.message)
    }

})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)

    const allowedUpdates = ['name', 'age', 'email', 'password']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {

        return res.status(400).send({ error: 'Invalid updates!' })

    }

    try {

        const user = req.user

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(user)

    } catch (error) {

        res.status(400).send(error.message)

    }

})

router.delete('/users/me', auth, async (req, res) => {

    try {

        await req.user.remove()

        sendCancelationMail(req.user.email, req.user.name)

        res.send(req.user)

    } catch (error) {

        res.status(500).send(error.message)

    }

})


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload an image.'))
        }

        cb(undefined, true)

    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const modifiedAvatar = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()

    req.user.avatar = modifiedAvatar

    await req.user.save()

    res.send()

}, (error, req, res, next) => {

    res.status(400).send({ error: error.message })

})

router.delete('/users/me/avatar', auth, async (req, res) => {

    req.user.avatar = undefined

    await req.user.save()

    res.send()

})


router.get('/users/:id/avatar', async (req, res) => {

    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')

        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }

})


module.exports = router