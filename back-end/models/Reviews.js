// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const Reviews = {
  reviewsByFilmID(film_id, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const query = `
      SELECT r.stars, r.text, r.last_update, c.full_name
      FROM reviews r, customer c
      WHERE r.film_id = ?
      AND c.customer_id = r.customer_id;`;
      dbConn.query(query, [film_id], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  createReview(customer_id, film_id, review, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const {
        stars,
        text
      } = review;
      const query = `
      INSERT INTO reviews (stars, text, customer_id, film_id) 
      VALUES(?, ?, ?, ?);`;
      dbConn.query(query, [stars, text, customer_id, film_id], (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  }
};

module.exports = Reviews;
