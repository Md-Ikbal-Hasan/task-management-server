const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b4ceuhb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {

        const usersCollection = client.db('taskManagement').collection('users');
        const tasksCollection = client.db('taskManagement').collection('tasks');

        // create user and save to the database............
        app.post('/users', async (req, res) => {
            const user = req.body;

            const email = user.email;
            const query = { email: email };
            const registerdUser = await usersCollection.findOne(query);
            console.log("reg", registerdUser);

            if (!registerdUser) {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            }

        })

        // added task info to the database........
        app.post('/tasks', async (req, res) => {
            const taskInfo = req.body;
            console.log(taskInfo);
            const result = await tasksCollection.insertOne(taskInfo);
            res.send(result);
        })

        // get the all tasks of a specific user......
        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email, status: 'incomplete' };
            const result = await tasksCollection.find(query).toArray();
            res.send(result);
        })

        // delete a task........
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await tasksCollection.deleteOne(query);
            console.log("api called: ", id);
            console.log(result);
            res.send(result);

        })

        // update a task message.......
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            console.log("id in put: ", id);
            const filter = { _id: ObjectId(id) };
            const taskInfo = req.body;
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    taskMessage: taskInfo.taskMessage
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            console.log(result);
            res.send(result);

        })

        // get a single task.........
        app.get('/singleTask/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await tasksCollection.findOne(query);
            console.log("api called: ", id);
            console.log(result);
            res.send(result);

        })

        // update the status of a task.......
        app.put('/singleTask/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };

            const updatedDoc = {
                $set: {
                    status: 'completed'
                }
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc);
            console.log(result);
            res.send(result);

        })

        // get the completed task.........
        app.get('/completedTask', async (req, res) => {
            const query = { status: 'completed' };
            const result = await tasksCollection.find(query).toArray();
            res.send(result);
        })





    }



    finally {

    }
}

run().catch(error => console.log(error));

app.get("/", (req, res) => {
    res.send("Hello from task management server")
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})