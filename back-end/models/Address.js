// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const Address = {
  getAddressInfo(customer_id, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((err) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      const query = `
      SELECT a.address, a.address2, co.country, ci.city, a.district, a.postal_code, a.phone
      FROM address a, city ci, country co
      WHERE a.address_id = ?
      AND ci.city_id = a.city_id
      AND co.country_id = ci.country_id;`;
      dbConn.query(query, [customer_id], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  }
};

module.exports = Address;
