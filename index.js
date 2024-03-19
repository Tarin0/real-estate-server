const express = require('express')
const app = express()
require('dotenv').config()
// const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const cors = require('cors')
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// const jwt = require('jsonwebtoken')
// const morgan = require('morgan')
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())
// app.use(cookieParser())
// app.use(morgan('dev'))




// const uri = "mongodb+srv://<username>:<password>@cluster0.pjjm5f6.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjjm5f6.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const userCollection = client.db("realEstateDb").collection("users");
    const addPropertyCollection = client.db("realEstateDb").collection("addProperty");
    const reviewsCollection = client.db("realEstateDb").collection("reviews");
    const wishlistCollection = client.db("realEstateDb").collection("wishlist");
    const wishlistOfferCollection = client.db("realEstateDb").collection("wishlistOffer");


    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const updatedUser = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      if ('role' in updatedUser && Object.keys(updatedUser).length === 1) {
         // If the 'role' field is present, update the user's role
          const updateRole = { $set: { role: updatedUser.role } };
          const result = await userCollection.updateOne(filter, updateRole, options);
          return res.send(result);
      } 
      
      else if ('status' in updatedUser && Object.keys(updatedUser).length === 1) {
      
          // If the 'role' field is present, update the user's role
          const updateStatus = { $set: { status: updatedUser.role } };
          const result = await userCollection.updateOne(filter, updateStatus, options);
          return res.send(result);
      } 
      
      else {
          // If the 'role' field is not present, update user details with timestamp
          const isExist = await userCollection.findOne(filter);
          if (isExist) {
              const updateAgent = {
                  $set: {
                      photoURL : updatedUser.photoURL,
                      name: updatedUser.name,
                      role: updatedUser.role
                  }
              };
              const result = await userCollection.updateOne(filter, updateAgent, options);
              return res.send(result);
          } else {
              const updateUser = {
                  $set: { ...updatedUser, timestamp: Date.now() }
              };
              const result = await userCollection.updateOne(filter, updateUser, options);
              return res.send(result);
          }
      }
  });
  


    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      // const query = { _id: new ObjectId(id) }
      const result = await userCollection.findOne({ email });
      res.send(result);
    })

    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/add-property', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await addPropertyCollection.insertOne(user);
      res.send(result);
    })
    app.post('/reviews', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await reviewsCollection.insertOne(user);
      res.send(result);
    })
    app.post('/wishlist', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await wishlistCollection.insertOne(user);
      res.send(result);
    })

    app.get('/wishlist', async (req, res) => {
      const cursor = wishlistCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post('/wishlist-offer', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await wishlistOfferCollection.insertOne(user);
      res.send(result);
    })

    app.get('/wishlist-offer', async (req, res) => {
      const cursor = wishlistOfferCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.put('/wishlist-offer/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
          
      if ('status' in updatedUser && Object.keys(updatedUser).length === 1) {
         // If the 'role' field is present, update the user's role
          const updateStatus = { $set: { status: updatedUser.status } };
          const result = await wishlistOfferCollection.updateOne(filter, updateStatus, options);
          return res.send(result);
      } 
     
  });
    


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
  res.send("server is running...");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`)
})
