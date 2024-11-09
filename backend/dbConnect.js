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
    // Step 1: Validate if holder ID exists in userinfo table
    const checkUserQuery = `SELECT id FROM userinfo WHERE id = ?`;
    db.query(checkUserQuery, [holderid], (err, results) => {
      if (err) {
        console.error("Error checking holder ID:", err);
        return res.status(500).json({ message: "Error validating user" });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid holder ID" });
      }

      // Step 2: Generate unique ID for the report and a unique code
      const reportId = uuidv4();
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Step 3: Insert into main report table
      const insertReportQuery = `
          INSERT INTO item_reports2 (id, code, category, brand, color, objectname, imageurl, holderid, createdat, type, status, confirmed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Found', 'pending', false);
        `;
      db.query(
        insertReportQuery,
        [
          reportId,
          code,
          category,
          brand,
          color,
          objectName,
          imageUrl || null,
          holderid,
        ],
        (err2) => {
          if (err2) {
            console.error("Error inserting report:", err2);
            return res
              .status(500)
              .json({ message: "Error saving item report" });
          }

          console.log("Report inserted successfully with ID:", reportId);

          // Step 4: Insert details (date, time, location)
          const insertDetailQuery = `
              INSERT INTO lost_item_details (datefound, timefound, locationfound, item_report_id)
              VALUES (?, ?, ?, ?);
            `;
          db.query(
            insertDetailQuery,
            [datelost, timelost, locationlost, reportId],
            (err3) => {
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

              // Step 5: Check code confirmation with interval
              const checkConfirmation = () => {
                const confirmQuery = `SELECT confirmed FROM item_reports2 WHERE id = ?`;
                db.query(confirmQuery, [reportId], (err, result) => {
                  if (err) {
                    console.error("Error checking confirmation:", err);
                    return;
                  }

                  if (result[0]?.confirmed) {
                    clearInterval(intervalId);
                    res
                      .status(201)
                      .json({ message: "Lost item reported and confirmed!" });
                  }
                });
              };

              // Run check every second, expire code if unconfirmed
              const intervalId = setInterval(checkConfirmation, 1000);
              setTimeout(() => clearInterval(intervalId), 30000);
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

app.post("/api/getItemData", (req, res) => {
  const { itemId } = req.body;

  // Fetch item data from the database
  db.query(
    "SELECT * FROM found_items WHERE id = ?",
    [itemId],
    (err, results) => {
      if (err) {
        console.error("Error fetching item data:", err);
        return res.status(500).send("Database error");
      }
      if (results.length === 0) {
        return res.status(404).send("Item not found");
      }
      res.json(results[0]); // Send back the first result since itemId is unique
    }
  );
});

// API Route: Get User Data (Owner Data)
app.post("/api/getUserData", (req, res) => {
  const { holderId } = req.body;

  // Fetch user data from the database
  db.query("SELECT * FROM users WHERE id = ?", [holderId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).send("Database error");
    }
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }
    res.json(results[0]); // Send back the first result
  });
});

// API Route: Update Item Notification
app.post("/api/updateItemNotification", (req, res) => {
  const { itemId, message } = req.body;

  // Update the item to mark it as notified with a message
  const updateFields = {
    notified: true,
    message,
    notifdate: new Date(),
  };

  let query = "UPDATE found_items SET ? WHERE id = ?";
  db.query(query, [updateFields, itemId], (err, result) => {
    if (err) {
      console.error("Error updating item notification:", err);
      return res.status(500).send("Database error");
    }
    res.json({ message: "Item notification updated successfully" });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
