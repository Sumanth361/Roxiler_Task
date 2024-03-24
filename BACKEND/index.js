const URI = "mongodb+srv://sumanth0836:Sum0836@cluster0.8weh0pb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
import express from "express";
import mongoose from "mongoose";
import cors from 'cors';

import {adminRouter} from './routes.js'

const app = express();

app.use(cors({
  origin:["http://localhost:5173"],
  methods:['GET','POST','PUT','DELETE'],
  credentials:true
}))
app.use(express.json());
app.use('/',adminRouter);


mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});