// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const Customer = {
  paymentDetailByDate(customer_id, startDate, endDate, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const paymentDetailByDateQuery = `
      SELECT f.title, p.amount, p.payment_date
      FROM payment p, film f, rental r, inventory i
      WHERE payment_date BETWEEN ? AND ?
      AND p.rental_id = r.rental_id
      AND r.inventory_id = i.inventory_id
      AND i.film_id = f.film_id
      AND p.customer_id = ?;`;
      dbConn.query(
        paymentDetailByDateQuery,
        [
          startDate,
          endDate,
          customer_id
        ],
        (error, results) => {
          dbConn.end();
          if (error) {
            return callback(error, null);
          }
          return callback(null, results);
        }
      );
    });
  },

  checkIfCustomerExists(email, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const selectCustomerQuery = `
      SELECT *
      FROM customer
      WHERE email = ?;`;
      dbConn.query(selectCustomerQuery, [email], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  addNewCustomer(customer, callback) {
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
      } = customer.address;
      const {
        store_id,
        first_name,
        last_name,
        email,
        password
      } = customer;
      const insertCustomerQuery = `
      BEGIN;
      INSERT INTO address (address, address2, district, city_id, postal_code, phone) 
      VALUES (?, ?, ?, ?, ?, ?);
      INSERT INTO customer (store_id, first_name, last_name, email, address_id, password)
      VALUES (?, ?, ?, ?, LAST_INSERT_ID(), ?);
      COMMIT;`;
      dbConn.query(insertCustomerQuery, [
        address_line1,
        address_line2,
        district,
        city_id,
        postal_code,
        phone,
        store_id,
        first_name,
        last_name,
        email,
        password
      ], (error, results) => {
        if (error) {
          dbConn.end();
          return callback(error, null);
        }
        return callback(null, results[2].insertId);
      });
    });
  },

  editCustomerAddress(customer_id, address, callback) {
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
      } = address;
      const editAddressQuery = `
        UPDATE address
        SET address = ?, address2 = ?, district = ?, city_id = ?, postal_code = ?, phone = ?
        WHERE address_id = (
          SELECT address_id
          FROM customer
          WHERE customer_id = ?
          );`;
      dbConn.query(editAddressQuery, [
        address_line1,
        address_line2,
        district,
        city_id,
        postal_code,
        phone,
        customer_id
      ], (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  loginUser(email, password, callback) {
    const conn = db.getConnection();
    conn.connect((err) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      const query = "select * from customer where email=? and password=?";
      conn.query(query, [email, password], (error, results) => {
        conn.end();
        if (error) {
          console.log(error);
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  getCustomerInfo(customer_id, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((err) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      const query = `
      SELECT full_name, email, address_id
      FROM customer
      WHERE customer_id = ?;`;
      dbConn.query(query, [customer_id], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  getCustomerName(customer_id, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((err) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      const query = `
      SELECT full_name
      FROM customer
      WHERE customer_id = ?;`;
      dbConn.query(query, [customer_id], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  }
};

module.exports = Customer;
