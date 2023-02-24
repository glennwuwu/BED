// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const Rental = {
  addNewRental(filmID, rental, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const getInventoryID = `
      SELECT inventory_id
      FROM inventory
      WHERE film_id = ?`;
      dbConn.query(getInventoryID, filmID, (error, result) => {
        if (error) {
          return callback(error, null);
        }
        const {
          rental_date,
          customer_id,
          return_id,
          staff_id
        } = rental;
        const addNewRentalQuery = `
      INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id)
      VALUES(?,
        (SELECT inventory_id
        FROM inventory
        WHERE film_id = ?),
        ?, ?, ?)
      `;
        dbConn.query(addNewRentalQuery, [
          rental_date,
          result,
          customer_id,
          return_id,
          staff_id
        ], (error2, result2) => {
          if (error) {
            return callback(error, null);
          }
          return callback(null, result2);
        });
      });
    });
  }
};

module.exports = Rental;
