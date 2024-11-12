
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');






function createClient(){

    try {
        
   
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster369.swbratv.mongodb.net/?retryWrites=true&w=majority`;


    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
return new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

} catch (error) {
    console.log(error);
    return null;
        
}
}

const client = createClient();
if (client === null){
process.exit(1);
}

module.exports.instructorsCollection = client.db('instructorsDB').collection('instructors');

module.exports.classesCollection = client.db('classesDB').collection('classes');

module.exports.selectedClassCollection = client.db('selectedClassesDB').collection('selected-classes');

module.exports.usersCollection = client.db('Craftopia').collection('users');

module.exports.paymentCollection = client.db("Craftopia").collection("payments");

