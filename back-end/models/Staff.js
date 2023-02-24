// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const Staff = {
  addNewStaff(staff, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const {
        address_line1,
        address_line2,
        district,
        city_id,
        postal_code,
        phone
      } = staff.address;
      const {
        first_name,
        last_name,
        email,
        store_id,
        active,
        username,
        password
      } = staff;
      const insertStaffQuery = `
      BEGIN;
      INSERT INTO address (address, address2, district, city_id, postal_code, phone) 
      VALUES (?, ?, ?, ?, ?, ?);
      INSERT INTO staff (first_name, last_name,  address_id, email, store_id, active, username, password)
      VALUES (?,?, LAST_INSERT_ID(), ?, ?, ?, ?, ?);
      COMMIT;`;
      dbConn.query(
        insertStaffQuery,
        [
          address_line1,
          address_line2,
          district,
          city_id,
          postal_code,
          phone,
          first_name,
          last_name,
          email,
          store_id,
          active,
          username,
          password
        ],
        (error, results) => {
          if (error) {
            return callback(error, null);
          }
          return callback(null, results[2].insertId);
        }
      );
    });
  },

  updateStaffStoreId(staff_id, store_id, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const updateQuery = `
      UPDATE staff
      SET store_id = ?
      WHERE staff_id = ?;
      `;
      dbConn.query(updateQuery, [store_id, staff_id], (error) => {
        if (error) {
          return callback(error);
        }
        return callback(null);
      });
    });
  },

  loginStaff(email, password, callback) {
    const conn = db.getConnection();
    conn.connect((err) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      const sql = "select * from staff where email=? and password=?";
      conn.query(sql, [email, password], (error, results) => {
        conn.end();
        if (error) {
          console.log(error);
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  getStaffInfo(staff_id, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const query = `
      SELECT username, email
      FROM staff
      WHERE staff_id = ?`;
      dbConn.query(query, [staff_id], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  }
};

module.exports = Staff;
