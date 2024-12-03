const express = require('express');
require('dotenv').config();

const app = express();
const cors = require('cors');

const { ObjectId } = require('mongodb');

// const router = express.Router();

// file upload
const multer = require("multer");
// const upload = multer({ dest: "uploads/" }); 

const path = require("path");
const fs = require('fs');

// const { notesCollection } = require('./db');

const stripe = require('stripe')(process.env.SECRET_KEY)




// middleware
app.use(cors());
app.use(express.json());



// to be implemented later

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));     


const {classesCollection, paymentCollection, instructorsCollection, selectedClassCollection, usersCollection, notesCollection, doubtsCollection, noticesCollection, applicationCollection, currentCollection, questionsCollection, assignmentsCollection } = require("./db");

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Set up multer for file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // File destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File name format
  },
});

const upload = multer({ storage: storage });


// assigments................................................................................................








// Routes

/**
 * 1. Instructor: Upload assignment for a course
 */
// app.post("/assignments", upload.single("file"), async (req, res) => {
//   try {
//     const { courseId, instructorId } = req.body;
//     const file = req.file;

//     if (!courseId || !instructorId || !file) {
//       return res.status(400).json({ error: "Missing required fields." });
//     }

//     const assignment = {
//       courseId,
//       instructorId,
//       filePath: `/uploads/${file.filename}`,
//       reviews: [],
//       createdAt: new Date(),
//     };

//     const result = await assignmentsCollection.insertOne(assignment);
//     res.status(201).json({ message: "Assignment uploaded successfully.", assignment: result.ops[0] });
//   } catch (error) {
//     console.error("Error uploading assignment:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });


app.post("/assignments", upload.single("file"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { courseId, instructorId } = req.body;
    const file = req.file;

    if (!courseId || !instructorId || !file) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Rest of the code...
  } catch (error) {
    console.error("Error uploading assignment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});



/**
 * 2. Get all assignments for a course (for instructors or students)
 */
app.get("/assignments/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignments = await assignmentsCollection.find({ courseId }).toArray();
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * 3. Students: Submit assignment
 */
app.post("/assignments/:assignmentId/submit", upload.single("file"), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId } = req.body;
    const file = req.file;

    if (!studentId || !file) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(assignmentId) });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    const existingSubmission = assignment.reviews.find((review) => review.studentId === studentId);
    if (existingSubmission) {
      return res.status(400).json({ error: "Assignment already submitted." });
    }

    const submission = {
      studentId,
      filePath: `/uploads/${file.filename}`,
      marks: null,
      feedback: null,
      submittedAt: new Date(),
    };

    const updatedAssignment = await assignmentsCollection.updateOne(
      { _id: new ObjectId(assignmentId) },
      { $push: { reviews: submission } }
    );

    res.status(201).json({ message: "Assignment submitted successfully." });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * 4. Instructors: Add review and marks for a student's submission
 */
app.post("/assignments/:assignmentId/review", async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, marks, feedback } = req.body;

    if (!studentId || marks == null || !feedback) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(assignmentId) });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    const updatedAssignment = await assignmentsCollection.updateOne(
      { _id: new ObjectId(assignmentId), "reviews.studentId": studentId },
      { $set: { "reviews.$.marks": marks, "reviews.$.feedback": feedback } }
    );

    res.status(200).json({ message: "Review added successfully." });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});





// assigments................................................................................................








// help section ------------------------------------------------------------------------------------------



// Routes

// 1. POST /questions - Students Post Questions
// app.post("/questions", upload.single("image"), async (req, res) => {
//   const { email, question } = req.body;
//   const image = req.file ? `/uploads/${req.file.filename}` : null;

//   if (!email || !question) {
//     return res.status(400).json({ error: "Email and question are required." });
//   }

//   try {
//     const newQuestion = { email, question, image, answer: null };
//     const result = await questionsCollection.insertOne(newQuestion);

//     res.status(201).json(result.ops[0]); // Return the inserted document
//   } catch (error) {
//     console.error("Error saving question:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

app.post("/questions", upload.single("image"), async (req, res) => {
  const { email, question } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  // Validate input
  if (!email || !question) {
    return res.status(400).json({ error: "Email and question are required." });
  }

  try {
    const newQuestion = {
      email,
      question,
      image,
      answer: null,
      createdAt: new Date(), // Optional: Add a timestamp
    };

    const result = await questionsCollection.insertOne(newQuestion);

    // Fetch the inserted document
    const insertedQuestion = await questionsCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json(insertedQuestion); // Return the full document
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// 2. GET /questions/:email - Fetch Questions for a Student
app.get("/questions/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const userQuestions = await questionsCollection.find({ email }).toArray();
    res.json(userQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. GET /questions - Fetch All Questions for Admin
app.get("/questions", async (req, res) => {
  try {
    const allQuestions = await questionsCollection.find().toArray();
    res.json(allQuestions);
  } catch (error) {
    console.error("Error fetching all questions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. POST /questions/:id/answer - Admin Answers a Question
app.post("/questions/:id/answer", async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  try {
    const ObjectId = require("mongodb").ObjectId;
    const result = await questionsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { answer } });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "Answer updated successfully." });
  } catch (error) {
    console.error("Error updating answer:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




// help section ------------------------------------------------------------------------------------------




// notes ---------------------------------------------------------------------------------------------------


// Route to upload notes
app.post('/notes', upload.single('file'), async (req, res) => {
  try {
      const { title, subject } = req.body;
      const file = req.file;

      if (!file) {
          return res.status(400).json({ message: 'No file uploaded' });
      }

      const newNote = {
          title: title,
          subject: subject,
          fileUrl: `/uploads/${file.filename}`, // File URL to be saved in the DB
      };

      await notesCollection.insertOne(newNote);

      res.status(200).json({ message: 'Note uploaded successfully!' });
  } catch (error) {
      console.error('Error uploading note:', error);
      res.status(500).json({ message: 'Error uploading note' });
  }
});

// Route to fetch all notes
app.get('/notes', async (req, res) => {
  try {
      const notes = await notesCollection.find().toArray();
      res.status(200).json(notes);
  } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Route to update a note
app.patch('/notes/:id', async (req, res) => {
  try {
      const noteId = req.params.id;
      const { title, subject } = req.body;

      const updatedNote = { $set: { title, subject } };

      const result = await notesCollection.updateOne(
          { _id: new mongodb.ObjectID(noteId) },
          updatedNote
      );

      if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'Note not found or no changes made' });
      }

      res.status(200).json({ message: 'Note updated successfully!' });
  } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ message: 'Error updating note' });
  }
});



// DELETE route for deleting a note
app.delete('/notes/:id', async (req, res) => {
  const noteId = req.params.id;

  try {
    // Find the note in the database
    const note = await notesCollection.findOne({ _id: new ObjectId(noteId) });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete the associated file
    if (note.fileUrl) {
      const filePath = path.join(__dirname, note.fileUrl);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting file:', err);
          return res.status(500).json({ error: 'Failed to delete associated file' });
        }
      });
    }

    // Delete the note from the database
    const result = await notesCollection.deleteOne({ _id: new ObjectId(noteId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// // Route to delete a note
// app.delete('/notes/:id', async (req, res) => {
//   try {
//       const noteId = req.params.id;

//       const result = await notesCollection.deleteOne({
//           _id: new mongodb.ObjectID(noteId),
//       });

//       if (result.deletedCount === 0) {
//           return res.status(404).json({ message: 'Note not found' });
//       }

//       res.status(200).json({ message: 'Note deleted successfully!' });
//   } catch (error) {
//       console.error('Error deleting note:', error);
//       res.status(500).json({ message: 'Error deleting note' });
//   }
// });





// Serve static files (uploaded notes)
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// notes ---------------------------------------------------------------------------------------------------


// current affairs ------------------------------------------------------------------------------------------


// Get All Current Affairs
app.get("/current-affairs", async (req, res) => {
  try {
    // Convert the cursor to an array
    const affairs = await currentCollection.find().toArray();
    res.json(affairs); // Send the array as a JSON response
  } catch (error) {
    console.error("Error fetching current affairs:", error);
    res.status(500).json({ error: "Failed to fetch current affairs" });
  }
});


// Add Current Affair
// app.post("/current-affairs", upload.single("pdf"), async (req, res) => {
//   try {
//     const { title, description, date } = req.body;
//     const newAffair = {
//       title,
//       description,
//       date: new Date(date), // Ensure date is stored as a Date object
//       pdfPath: req.file ? req.file.path : null,
//     };

//     // Insert the new affair into the collection
//     const result = await currentCollection.insertOne(newAffair);

//     if (result.insertedCount === 1) {
//       res.status(201).json({ message: 'Current affair added successfully', data: newAffair });
//     } else {
//       res.status(500).json({ error: 'Failed to add current affair' });
//     }
//   } catch (error) {
//     console.error("Error in POST /current-affairs:", error.message);
//     res.status(500).json({ error: "Failed to add current affair", details: error.message });
//   }
// });

// POST endpoint for adding a new current affair
// app.post("/current-affairs", upload.single("pdf"), async (req, res) => {
//   try {
//     const { title, description, date } = req.body;

//     // Validate request data
//     if (!title || !description || !date) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Insert the data into MongoDB
//     const newAffair = {
//       title,
//       description,
//       date,
//       pdfPath: req.file ? req.file.path : null,
//     };

//     // const collection = db.collection("currentAffairs");
//     const result = await currentCollection.insertOne(newAffair);

//     res.status(201).json(result.ops[0]);
//   } catch (error) {
//     console.error("Error in POST /current-affairs:", error.message);
//     res.status(500).json({ error: "Failed to add current affair", details: error.message });
//   }
// });

// POST endpoint for adding a new current affair
app.post("/current-affairs", upload.single("pdf"), async (req, res) => {

  
  try {
    const { title, description, date } = req.body;

    // Validate request data
    if (!title || !description || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert the data into MongoDB
    const newAffair = {
      title,
      description,
      date,
      pdfPath: req.file ? req.file.path : null,
    };

    // const collection = db.collection("currentAffairs");
    const result = await currentCollection.insertOne(newAffair);

    res.status(201).json({ message: "Current affair added successfully!", data: result.ops[0] });
  } catch (error) {
    console.error("Error in POST /current-affairs:", error.message);
    res.status(500).json({ error: " ", details: error.message });    //Failed to add current affair    - getting posted but still this error message is showing
  }
});



// Update Current Affair
app.patch("/current-affairs/:id", async (req, res) => {
  try {
    const updatedAffair = await currentCollection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedAffair);
  } catch (error) {
    res.status(500).json({ error: "Failed to update current affair" });
  }
});

// Delete Current Affair
app.delete("/current-affairs/:id", async (req, res) => {
  try {
    await currentCollection.findByIdAndDelete(req.params.id);
    res.json({ message: "Current affair deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete current affair" });
  }
});



// current afffairs ----------------------------------------------------------------------------------------


// submisssion form ---------------------------------------------------------------------------------------------------


// POST route for form submissions
// app.post('/applications', upload.fields([{ name: 'idProof' }, { name: 'photo' }]), async (req, res) => {
//   try {
//       const { name, fatherName, phone, email, address, classId } = req.body;
//       const idProof = req.files.idProof[0].path;
//       const photo = req.files.photo[0].path;

//       const application = {
//           name,
//           fatherName,
//           phone,
//           email,
//           address,
//           classId,
//           idProof,
//           photo,
//       };

//       const result = await applicationCollection.insertOne(application);
//       res.status(200).json({ message: 'Application submitted successfully', data: result });
//   } catch (error) {
//       console.error('Error submitting application:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// POST route for form submissions
app.post('/applications', upload.fields([{ name: 'idProof' }, { name: 'photo' }]), async (req, res) => {
  try {
    const { name, fatherName, phone, email, address, classId } = req.body;
    const idProof = `http://localhost:5000/uploads/${req.files.idProof[0].filename}`; // Use relative path
    const photo = `http://localhost:5000/uploads/${req.files.photo[0].filename}`; // Use relative path

    const application = {
      name,
      fatherName,
      phone,
      email,
      address,
      classId,
      idProof,
      photo,
    };

    const result = await applicationCollection.insertOne(application);
    res.status(200).json({ message: 'Application submitted successfully', data: result });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// get form submission details


// Route to fetch applications
app.get('/applications', async (req, res) => {
  try {
    const applications = await applicationCollection.find().toArray(); // Convert cursor to array
    res.status(200).json(applications); // Send applications array as JSON response
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});




// submission form ---------------------------------------------------------------------------




// doubts -----------------------------------------------------


// Add a new doubt
app.post('/doubts', async (req, res) => {
  const { question } = req.body;
  try {
    const result = await doubtsCollection.insertOne({ question, answer: null });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding doubt:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get all doubts
app.get('/doubts', async (req, res) => {
  try {
    const doubts = await doubtsCollection.find({}).toArray();
    res.json(doubts);
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update a doubt with an answer
app.patch('/doubts/:id', async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  try {
    const result = await doubtsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { answer } }
    );
    res.json(result);
  } catch (error) {
    console.error('Error updating doubt:', error);
    res.status(500).send('Internal Server Error');
  }
});

// module.exports = router;

// doubts -----------------------------------------------------



// notice ----------------------------------------------------------------------

app.post('/notices/add', async (req, res) => {
  const { title, description, date } = req.body;

  if (!title || !description || !date) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    const newNotice = { title, description, date: new Date(date) };
    const result = await noticesCollection.insertOne(newNotice);
    res.status(201).send({ message: 'Notice added successfully', result });
  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



app.put('/notices/update/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, date } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid Notice ID' });
  }

  try {
    const updatedNotice = { title, description, date: new Date(date) };
    const result = await noticesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedNotice }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: 'Notice not found' });
    }

    res.send({ message: 'Notice updated successfully' });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



app.delete('/notices/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid Notice ID' });
  }

  try {
    const result = await noticesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Notice not found' });
    }

    res.send({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



app.get('/notices', async (req, res) => {
  try {
    const notices = await noticesCollection.find().sort({ date: -1 }).toArray();
    res.send(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


app.get('/notices/latest', async (req, res) => {
  try {
    const latestNotice = await noticesCollection.find().sort({ date: -1 }).limit(1).toArray();

    if (latestNotice.length === 0) {
      return res.status(404).send({ message: 'No notices found' });
    }

    res.send(latestNotice[0]);
  } catch (error) {
    console.error('Error fetching latest notice:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


// notice ----------------------------------------------------------------------








// stripe 




// mongodb 
// const { ObjectId } = require('mongodb');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // databases 

    

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

// .......................................   .....




    // Delete selected classes 

    app.delete('/selected-classes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    })


// users
    app.post("/users", async (req, res) => {
      const { name, email } = req.body;
      try {
        const existingUser = await usersCollection.findOne({ email });
    
        if (existingUser) {
          console.log("User already exists:", existingUser);
          return res.status(409).send({ message: "User already exists." });
        }
    
        const user = { email, role: "student", name };
        const result = await usersCollection.insertOne(user);
    
        console.log("New user added:", user);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ message: "Internal server error." });
      }
    });


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
run().catch(console.log);


app.get('/', (req, res) => {
  res.send('APJEC is Running');
});



app.listen(port, () => {
  console.log(`APJEC is running on port ${port}`);
});















