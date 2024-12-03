const { MongoClient, ServerApiVersion } = require('mongodb');

// Function to create and return the MongoDB client
function createClient() {
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
        console.error('Error creating MongoDB client:', error);
        return null;
    }
}

const client = createClient();

if (client === null) {
    process.exit(1);
}

// Export collections from MongoDB for use in other files
const db = client.db('apjecDB');

module.exports.instructorsCollection = db.collection('instructors');
module.exports.classesCollection = db.collection('classes');
module.exports.selectedClassCollection = db.collection('selected-classes');
module.exports.usersCollection = db.collection('users');
module.exports.paymentCollection = db.collection('payments');
module.exports.notesCollection = db.collection('notes');
module.exports.doubtsCollection = db.collection('doubts');
module.exports.noticesCollection = db.collection('notices');
module.exports.currentCollection = db.collection('current-affairs');
module.exports.questionsCollection = db.collection('questions');
module.exports.applicationCollection = db.collection('applications');
module.exports.assignmentsCollection = db.collection('assignments');
// module.exports.purchasedCollection = db.collection('purchases');







