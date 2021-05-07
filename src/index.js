const express = require('express')

require('./db/mongoose')

const userRouter = require('./routers/user')

const taskRouter = require('./routers/task')


const port = process.env.PORT

const app = express()


const multer = require('multer')

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.endsWith('.pdf')) {
            return cb(new Error('You should upload a PDF file.'))
        }

        cb(undefined, true)

    }
})


app.post('/upload', upload.single('upload'), (req, res) => {

    res.send('c')

})



app.use(express.json())

app.use(userRouter)

app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on ' + port)
})

