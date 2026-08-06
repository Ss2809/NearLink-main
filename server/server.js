require("dotenv").config();
const express = require("express");
const app = express();
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const cors = require("cors");
const connectDB = require("./config/db");
const businessRoutes = require("./routes/business");

app.use(express.json());


app.use(cors());
connectDB();
app.get('/', (req,res)=>{
  res.json('server is runing ...');
})
app.use("/api/auth", registerRoutes);
app.use("/api/auth",loginRoutes);
app.use("/api/business", businessRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log('server runing ');
})