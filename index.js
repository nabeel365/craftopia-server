const express = require('express');
require('dotenv').config();

const app = express();
const cors = require('cors');


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


    // update class ...
// .................




// ...

// Update class status and seats
// app.patch('/classes/:id', async (req, res) => {
//   const id = req.params.id;
//   const { status } = req.body;
//   const { feedback } = req.body;
//   const query = { _id: new ObjectId(id) };
//   const update = { $set: { status, feedback } };
  
//   try {
//     // Update the class status
//     const result = await selectedClassCollection.updateOne(query, update);
    
//     // Fetch the course ID associated with the selected class
//     const selectedClass = await selectedClassCollection.findOne(query);
//     const courseId = selectedClass.courseId;
    
//     // Update the available seats and enrolled count for the course
//     const courseQuery = { _id: new ObjectId(courseId) };
//     console.log(courseQuery, selectedClass, "97");
//     const courseUpdate = {
//       $inc: { available_seats: selectedClass.available_seats - 1, enroled: selectedClass.enroled + 1 }
//     };
//     await classesCollection.updateOne(courseQuery, courseUpdate);
    
//     res.send(result);
//   } catch (error) {
//     console.error('Error updating class and seats:', error);
//     res.status(500).send('Internal Server Error');

//   }
// });

// ...












    // ........................

    app.get('/instructorclasses', async (req, res) => {
      const email = req.query.email;
      const result = await classesCollection.find({email: email}).toArray();
      res.send(result);
    });

     // instructor added classes    

     app.post('/classes', async (req, res) => {
      const addedClass = req.body;
      const result = await classesCollection.insertOne(addedClass)
      res.send(result);
    })


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


// ......................... uncommet later

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

// .......................................




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
      const payment = req.body.payment;
      const result = await paymentCollection.insertOne(payment);
      console.log(payment);
      res.send(result);
    })


    // get payment
    // app.get('/payments', async (req, res) => {
    //   const result = await paymentCollection.find().toArray();
    //   res.send(result);
    // })

    // get payment by email 
    // app.get('/payments', async (req, res) => {
    //   const email = req.query.email;       
    //   const result = await paymentCollection.find({ email: email }).toArray();      
    //   res.send(result);
    // })
    
    app.get('/payments', async (req, res) => {
      const email = req.query.email;
      const result = await paymentCollection.find({ email: email }).sort({ date: -1 }).toArray();
      res.send(result);
    });

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
    // await client.db("admin").command({ ping: 1 });
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















