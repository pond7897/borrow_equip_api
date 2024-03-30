const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
})

app.get("/", (req, res) => {
  const query = "SELECT * FROM tbAsset";

  db.query(query, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
});

app.get("/getuser", (req,res) => {
  const stuId = req.query.stuId
  if (!stuId) {
    res.status(400).send("ไม่พบเลขนักศึกษา")
  }

  const values = [stuId]

  const query = "SELECT * FROM tbStudent WHERE fdStuId = ?";
  db.query(query, values, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
})

app.get("/getuser", (req,res) => {
  const query = "SELECT * FROM tbStudent";
  db.query(query, values, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
      
    }
  })
})

app.post('/addborrow', (req, res) => {
  const values = [req.body.stuId, req.body.assetId, req.body.borrowDate, req.body.returnDate]
  const query = "INSERT INTO tbBorrow (fdStuId, fdAssetId, fdBorrowDate, fdReturnDate) VALUES ?";
  db.query(query, [values], (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
}
)

app.get('/getasset', (req,res) => {
  const query = "SELECT * FROM tbAsset";
  db.query(query, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
})

const port = 3002;
app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
