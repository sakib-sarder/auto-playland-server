const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AutoPlayland is Running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gttryf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const toyCollection = client.db("AutoPlayland").collection("toysCollection");

async function run() {
  try {
    // await client.connect();

    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    app.get("/all-toys", async (req, res) => {
      const type = req.query.type === "acending";
      const value = req.query.value;
      const sortObj = {};
      sortObj[value] = type ? 1 : -1;
      const result = await toyCollection
        .find({})
        .sort(sortObj)
        .collation({locale: "en_US", numericOrdering: true})
        .limit(20)
        .toArray();
      res.send(result);
    });

    app.get("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toys/:email", async (req, res) => {
      const email = req.params.email;
      const result = await toyCollection.find({ sellerEmail: email }).toArray();
      res.send(result);
    });

    const indexKeys = { name: 1 };
    const indexOption = { name: "title" };

    const result = await toyCollection.createIndex(indexKeys, indexOption);

    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          name: { $regex: searchText, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    app.delete("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/my-toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const toy = req.body;
      const option = { upsert: true };
      const updatedToy = {
        $set: {
          price: toy.price,
          availableQuantity: toy.availableQuantity,
          details: toy.details,
        },
      };
      const result = await toyCollection.updateOne(filter, updatedToy, option);
      res.send(result);
      console.log(toy);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`AutoPlayland is running on Port : ${port}`);
});
