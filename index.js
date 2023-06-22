const cors = require("cors");
const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//BKASH ROUTER
const bkashRouter = require("./routes/bkashRouter");

app.use(cors());
app.use(express.json());
app.use("/uploads/images", express.static(__dirname + "/public/upload/images"));
app.use("/api/bkash", bkashRouter);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljthuii.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("rr_payment");
    const productsCollection = database.collection("PaymentResponse");
    app.locals.database = database;

    app.get("/payment/status", async (req, res) => {
      const cursor = productsCollection.find({});
      const payment = await cursor.toArray();
      res.json(payment);
    });

    app.delete("/payment/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await productsCollection.deleteOne({
          _id: ObjectId(id),
        });
        console.log(result);

        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Payment deleted successfully" });
        } else {
          res.status(404).json({ message: "Payment not found!" });
        }
      } catch (error) {
        console.error("Failed to delete item:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("E-commerce Server process!");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
