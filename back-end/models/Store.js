// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const Store = {
  addNewStore(store, callback) {
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
      } = store.address;
      const insertStoreQuery = `
      BEGIN;
      INSERT INTO address (address, address2, district, city_id, postal_code, phone) 
      VALUES (?, ?, ?, ?, ?, ?);
      INSERT INTO store (manager_staff_id, address_id)
      VALUES (?, LAST_INSERT_ID());
      COMMIT;`;
      dbConn.query(
        insertStoreQuery,
        [
          address_line1,
          address_line2,
          district,
          city_id,
          postal_code,
          phone,
          store.manager_staff_id
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

  getStoreAddresses(callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const query = `
      SELECT s.store_id, a.address, a.district
      FROM store s, address a
      WHERE s.address_id = a.address_id;`;
      dbConn.query(query, [], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  }
};

module.exports = Store;
