const express = require("express");
const db = require("./db");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(
  expressSession({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true,
  })
);
//user
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig.js")(passport);
app.use(cookieParser("mySecretKey"));

app.get("/", (req, res) => {  
  res.send("Hello World!");
  //   const query = "SELECT * FROM tbAsset";

  //   db.query(query, (err, result) => {
  //     if (err) {
  //       throw err;
  //     } else {
  //       res.send(result);
  //     }
  //   });
});
app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.send("No user found");
    }
    if (user) {
      req.login(user, (err) => {
        if (err) {
          throw err;
        }
        res.send(req.user);
        // console.log(req.user);
      });
    }
  })(req, res, next);
});

app.get("/getUser", (req, res) => {
  if (!req.user) {
    throw Error("Not logged in");
  }
  res.send(req.user);
});

app.get("/getalluser", (req, res) => {
  const query = "SELECT * FROM tbStudent";
  db.query(query, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

app.post("/addborrow", (req, res) => {
  const values = {
    fdStuId: req.user.fdStuId,
    fdAssetId: req.body.fdAssetId,
    fdBorrowDate: req.body.fdBorrowDate,
    fdReturnDate: req.body.fdReturnDate,
    fdReason: req.body.fdReason,
  };
  // console.log([values])
  const query = `INSERT INTO tbBorrow (fdStuId, fdAssetId, fdBorrowDate, fdReturnDate, fdReason) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    query,
    [
      values.fdStuId,
      values.fdAssetId,
      values.fdBorrowDate,
      values.fdReturnDate,
      values.fdReason,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send({
          error: "An error occurred while inserting data into tbBorrow.",
        });
      } else {
        const query_editAsset = `UPDATE tbAsset SET fdStatus = 1, fdCount = fdCount + 1 WHERE fdAssetId = ?`;
        db.query(query_editAsset, [values.fdAssetId], (err, result) => {
          if (err) {
            res.status(500).send({
              error: "An error occurred while updating data in tbAsset.",
            });
          } else {
            res
              .status(200)
              .send({ success: true, message: "Borrow added successfully." });
          }
        });
      }
    }
  );
});

app.get("/getreturn", (req, res) => {
  const values = req.user.fdStuId;
  const query = `select b.fdId, b.fdStuId, s.fdFname, s.fdLname, b.fdAssetId, a.fdAssetName, b.fdBorrowDate, b.fdReturnDate, b.fdReason
                  from tbBorrow b
                  join tbStudent s on b.fdStuId = s.fdStuId
                  join tbAsset a on b.fdAssetId = a.fdAssetId
                  where b.fdStuId = ?`
  db.query(query, [values], (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
});

app.post("/deleteborrow", (req, res) => {
  const values = {
    fdAssetId: req.body.fdAssetId
  };
  const query = `delete from tbBorrow where fdAssetId = ?;`
  db.query(query, [values.fdAssetId], (err, result) => {
    if (err) {
      throw err;
    } else {
      const query_editAsset = `UPDATE tbAsset SET fdStatus = 2 WHERE fdAssetId = ?`;
      db.query(query_editAsset, [values.fdAssetId], (err, result) => {
        if (err) {
          res.status(500).send({
            error: "An error occurred while updating data in tbAsset.",
          });
        } else {
          res
            .status(200)
            .send({ success: true, message: "Borrow delete successfully." });
        }
      });
    }
  })
});

app.post("/editasset", (req, res) => {
  const values = req.user.fdStuId;
  const query = `delete from tbBorrow where fdStuId = ?;`
  db.query(query, [values], (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
})

app.put("/updateAsset", (req, res) => {
  const values = {
    fdStatus:req.body.fdStatus,
    fdAssetId: req.body.fdAssetId
  };
  const query = `UPDATE tbAsset SET fdStatus = ? WHERE fdAssetId = ?;`;
  db.query(query, [values.fdStatus, values.fdAssetId], (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  })
})

app.post("/addhistory", (req, res) => {
  const values = {
    fdStuId: req.user.fdStuId,
    fdAssetId: req.body.fdAssetId,
    fdAssetName: req.body.fdAssetName,
    fdBorrowDate: req.body.fdBorrowDate,
    fdReturnDate: req.body.fdReturnDate,
  };

  const query_history = `INSERT INTO tbHistory (fdStuId, fdAssetId, fdAssetName, fdBorrowDate, fdReturnDate) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    query_history,
    [
      values.fdStuId,
      values.fdAssetId,
      values.fdAssetName,
      values.fdBorrowDate,
      values.fdReturnDate,
    ],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/gethistory", (req, res) => {
  const values = req.user;
  const query = `select h.fdId,h.fdAssetId, h.fdStuId, h.fdBorrowDate, h.fdReturnDate, h.fdAssetName, a.fdFname 
                  from tbHistory h left join tbAdmin a 
                  on h.fdAdmin = a.fdEmail WHERE fdStuId = ?`;
  // const query = "select * from tbHistory WHERE fdStuId = ?";
  db.query(query, values.fdStuId, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

app.get("/getAsset", (req, res) => {
  const query = "SELECT * FROM tbAsset";
  db.query(query, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
