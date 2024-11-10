const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors"); // Import cors

const app = express();
app.use(express.json());

// Configure CORS to allow requests from localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this frontend origin
    methods: ["GET", "POST"], // Allow specific HTTP methods
    credentials: true, // Allow credentials to be included in requests
  })
);

// MySQL Database connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lostandfound",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// API endpoint to handle user registration
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, contact, password } = req.body;
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO userinfo (id, firstName, lastName, email, contact, password, is_admin) VALUES (?, ?, ?, ?, ?, ?, false)`;

  db.query(
    sql,
    [userId, firstName, lastName, email, contact, hashedPassword],
    (error, results) => {
      if (error) {
        console.error("Error inserting user:", error);
        res.status(500).json({ message: "Error registering user" });
      } else {
        res.status(201).json({ message: "Account created successfully!" });
      }
    }
  );
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Query the database for the user by email
  db.query(
    "SELECT * FROM userinfo WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // Check if user exists
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });

      const user = results[0];

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch)
        return res.status(401).json({ error: "Invalid password" });

      // Send user data without password
      const { id, firstName, lastName, email, contact, is_admin } = user;
      res.json({ id, firstName, lastName, email, contact, is_admin });
    }
  );
});
app.post("/api/report-lost-item", async (req, res) => {
  const {
    category,
    brand,
    color,
    objectName,
    datelost,
    timelost,
    locationlost,
    imageUrl,
    holderid,
  } = req.body;

  try {
    // Step 1: Validate if the holderid exists in the userinfo table
    const checkUserQuery = `
        SELECT id FROM userinfo WHERE id = ?;
      `;
    db.query(checkUserQuery, [holderid], (err, results) => {
      if (err) {
        console.error("Error checking holder ID:", err);
        return res.status(500).json({ message: "Error validating user" });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid holder ID" });
      }

      // Step 2: Generate unique ID for the report
      const reportId = uuidv4();

      // Step 3: Insert into 'item_reports2' table (main table)
      const insertReportQuery = `
          INSERT INTO item_reports2 (
            id, category, brand, color, objectname, imageurl, holderid, createdat, type, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Lost', 'pending');
        `;
      db.query(
        insertReportQuery,
        [
          reportId,
          category,
          brand,
          color,
          objectName,
          imageUrl || null,
          holderid,
        ],
        (err2, results2) => {
          if (err2) {
            console.error("Error inserting report:", err2);
            return res
              .status(500)
              .json({ message: "Error saving lost item report" });
          }

          console.log("Report inserted successfully with ID:", reportId);

          // Step 4: Insert into 'lost_item_details' table (date, time, and location)
          const insertDetailQuery = `
              INSERT INTO lost_item_details (datelost, timelost, locationlost, item_report_id)
              VALUES (?, ?, ?, ?);
            `;
          db.query(
            insertDetailQuery,
            [datelost, timelost, locationlost, reportId],
            (err3, results3) => {
              if (err3) {
                console.error("Error inserting item details:", err3);
                return res
                  .status(500)
                  .json({ message: "Error saving item details" });
              }

              console.log(
                "Item details inserted successfully for report ID:",
                reportId
              );

              // Successfully saved both item report and details
              res
                .status(201)
                .json({ message: "Lost item reported successfully!" });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Server error while saving lost item" });
  }
});

app.post("/api/report-found-item", async (req, res) => {
  const {
    code,
    confirmed,
    createdat,
    holderid,
    category,
    brand,
    color,
    datefound,
    timefound,
    locationfound,
    objectname,
    imageurl,
    type,
    status,
  } = req.body;
  const reportId = uuidv4();

  // First, check if holderid exists in the referenced table (e.g., users)
  const checkHolderSql = "SELECT id FROM userinfo WHERE id = ?";
  db.query(checkHolderSql, [holderid], (err, result) => {
    if (err) {
      console.error("Error checking holderid:", err.message);
      return res.status(500).json({ error: "Error checking holderid" });
    }
    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid holderid" });
    }

    // Insert into item_reports2 table
    const sql = `INSERT INTO item_reports2 
      (id, code, confirmed, createdat, holderid, category, brand, color, objectname, imageurl, type, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        reportId,
        code,
        confirmed,
        createdat,
        holderid,
        category,
        brand,
        color,

        objectname,
        imageurl,
        type,
        status,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting item report:", err.message);
          return res.status(500).json({ error: "Failed to save item report" });
        }

        const itemReportId = result.insertId;

        // Now insert the details into found_item_details table
        const detailsSql = `INSERT INTO found_item_details 
          (datefound, timefound, locationfound, item_report_id) 
          VALUES (?, ?, ?, ?)`;

        db.query(
          detailsSql,
          [datefound, timefound, locationfound, reportId],
          (err, result) => {
            if (err) {
              console.error("Error inserting found item details:", err.message);
              return res
                .status(500)
                .json({ error: "Failed to save found item details" });
            }

            res.status(200).json({ id: itemReportId });
          }
        );
      }
    );
  });
});

app.get("/api/code-confirmation/:id", (req, res) => {
  const reportId = req.params.id;

  const sql = `SELECT confirmed FROM item_reports2 WHERE id = ?`;
  db.query(sql, [reportId], (err, result) => {
    if (err) {
      console.error("Error fetching confirmation:", err.message);
      return res.status(500).json({ error: "Error checking confirmation" });
    }
    if (result.length === 0)
      return res.status(404).json({ error: "Report not found" });
    res.status(200).json(result[0]);
  });
});

app.delete("/api/code-expiration/:id", (req, res) => {
  const reportId = req.params.id;

  const sql = `DELETE FROM item_reports2 WHERE id = ? AND confirmed = false`;
  db.query(sql, [reportId], (err, result) => {
    if (err) {
      console.error("Error expiring code:", err.message);
      return res.status(500).json({ error: "Error expiring code" });
    }
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Report not found or already confirmed" });
    res.status(200).json({ message: "Code expired and report deleted" });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
