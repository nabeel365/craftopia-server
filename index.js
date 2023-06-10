const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// mongodb 

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster369.swbratv.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // databases 

        const instructorsCollection = client.db('instructorsDB').collection('instructors');
        
        const classesCollection = client.db('classesDB').collection('classes'); 

        const selectedClassCollection = client.db('selectedClassesDB').collection('selected-classes');
        


// instructors
        app.get('/instructors', async (req, res) => {
            const result = await instructorsCollection.find().toArray();
            res.send(result);
        });


        
// classes
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        });




// post selected classes 

app.post('/selected-classes',  async (req, res) => {
    const selectedClass = req.body;
    console.log(selectedClass);
    const result = await selectedClassCollection.insertOne(selectedClass)
    res.send(result);
  })



//   get selected classes 

app.get('/selected-classes', async (req, res) => {
    const result = await selectedClassCollection.find().toArray();
    res.send(result);
});
 


// Delete selected classes 








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Craftopia is Drawing');
});



app.listen(port, () => {
    console.log(`Craftopia Art School is running on port ${port}`);
});


