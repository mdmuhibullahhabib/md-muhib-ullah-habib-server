const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')



// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w5eri.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        const appointmentCollection = client.db('hashi').collection('appointment')
        const reviewsCollection = client.db('hashi').collection('reviews')

        // Jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1hr'
            })
            res.send({ token })
        })

        // middleware
        const verifyToken = (req, res, next) => {
            // console.log('inside token', req.headers.authorization)
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'forbidded access' })
            }
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'forbidden access' })
                }
                req.decoded = decoded
                next()
            })
        }

        // reviews related api
        app.post('/message', async (req, res) => {
            const story = req.body
            const result = await reviewsCollection.insertOne(story)
            res.send(result)
        })

        app.get('/message', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result)
        })

        app.delete('/message/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await appointmentCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        )
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Muhib in running...')
})

app.listen(port, () => {
    console.log(`Muhib is running on port ${port}`)
})