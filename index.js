const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;


// stripe 

const stripe = require('stripe')(process.env.SECRET_KEY)


// middleware
app.use(cors());
app.use(express.json());


// mongodb 
// const { ObjectId } = require('mongodb');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const usersCollection = client.db('Craftopia').collection('users');

    const paymentCollection = client.db("Craftopia").collection("payments");



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


    // price --   TOD0 LATER

    // app.get('/classes/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const result = await classesCollection.findOne({_id: new ObjectId(id)});
    //   console.log(result);

    //   res.send(result);
    // });

// Todo later
    
    // app.get('/selected-classes', async (req, res) => {
    //   const result = await classesCollection.find({ id: req.query._id }).toArray();
    //   res.send(result);
    // });



    // instructor added classes    

    app.post('/classes', async (req, res) => {
      const addedClass = req.body;
      const result = await classesCollection.insertOne(addedClass)
      res.send(result);
    })





    // post selected classes 

    app.post('/selected-classes', async (req, res) => {
      const selectedClass = req.body;
      // console.log(selectedClass);
      const result = await selectedClassCollection.insertOne(selectedClass)
      res.send(result);
    })



    //   get selected classes 

    app.get('/selected-classes', async (req, res) => {
      const result = await selectedClassCollection.find({ email: req.query.email }).toArray();
      res.send(result);
    });




    // Update class status ...................
    app.patch('/classes/:id', async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const { feedback } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { status, feedback } };
      const result = await classesCollection.updateOne(query, update);
      res.send(result);
    });

// app.patch('/classesApprove/:id', async (req, res) => {
//       const id = req.params.id;
//       const { status } = req.body;
//       const { feedback } = req.body;
//       const query = { _id: new ObjectId(id) };
//       const update = { $set: { status, feedback } };
//       const result = await classesCollection.updateOne(query, update);
//       res.send(result);
//     });






    // Delete selected classes 

    app.delete('/selected-classes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    })



    //  post users 
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.send(result);
    })


    //   get users 

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });


    // fetch users as instructors
    app.get('/users/instructor', async (req, res) => {
      const query = {role: "instructor"}
      const result = await usersCollection.find(query).toArray();

      res.send(result);
    });


    // Update user role ............................
    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { role } };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' };
      res.send(result)
    })



    app.get('/users/instructor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === 'instructor' };
      res.send(result)
    })




    // 
    // Update user role
    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { role } };
      const result = await usersCollection.updateOne(query, update);

      if (result.modifiedCount === 1) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    });



    // post payment
    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    })


    // get payment


    // payments 

    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card'],
        // status : "succeeded"
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })


   

    
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















