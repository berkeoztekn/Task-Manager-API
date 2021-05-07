const express = require('express')

const Task = require('../models/task')

const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {

        await task.save()

        res.status(201).send(task)

    } catch (error) {

        res.status(400).send(error.message)

    }
})

router.get('/tasks', auth, async (req, res) => {

    const match = {}

    const sort = {}

    if (req.query.completed) {

        match.completed = req.query.completed === 'true'

    }

    if (req.query.sortBy) {

        const parts = req.query.sortBy.split(':')

        console.log(parts)

        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1

        console.log(sort)

    }

    try {

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)

    } catch (error) {

        res.status(400).send(error.message)

    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try {

        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)

    } catch (error) {

        if (error.kind === 'ObjectId') {
            res.status(404).send()
        }

        res.status(500).send(error.message)
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)

    const allowwedUpdates = ['description', 'completed']

    const isValidOperation = updates.every((update) => allowwedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(task)

    } catch (error) {

        if (error.kind === 'ObjectId') {
            return res.status(404).send({ error: 'Task could not be founded!' })
        }

        res.status(400).send(error.message)

    }

})

router.delete('/tasks/:id', auth, async (req, res) => {

    try {

        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)

    } catch (error) {

        res.status(500).send(error.message)

    }

})


module.exports = router