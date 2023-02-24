// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const db = require("../config/databaseConfig");

const rental_rate_query_str = "f.rental_rate <= ?";

const Film = {
  allFilmsAlphabeticalOrder(max_rental, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      let query = `
      SELECT f.film_id
      FROM film f
      `;
      const queryVars = [];
      console.log(max_rental);
      if (max_rental) {
        query += ` WHERE ${rental_rate_query_str}`;
        queryVars.push(max_rental);
      }
      query += `
      ORDER BY title
      LIMIT 30;
      `;
      dbConn.query(query, queryVars, (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  filmInfoByCategoryID(category_id, max_rental, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      let filmInfoByCategoryIDQuery = `
      SELECT f.film_id, f.title
      FROM film f, film_category fc, category c
      WHERE fc.category_id = ?
      AND f.film_id = fc.film_id
      AND fc.category_id = c.category_id`;
      const queryVars = [category_id];
      if (max_rental) {
        filmInfoByCategoryIDQuery += ` AND ${rental_rate_query_str}`;
        queryVars.push(max_rental);
      }
      dbConn.query(filmInfoByCategoryIDQuery, queryVars, (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  filmInfoByFilmID(filmID, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const filmInfoByCategoryIDQuery = `
      SELECT f.film_id, f.title, c.name category, fc.category_id, f.release_year, f.description, f.rating, f.rental_rate cost, f.rental_duration, f.length duration
      FROM film f, film_category fc, category c
      WHERE f.film_id = ?
      AND f.film_id = fc.film_id
      AND fc.category_id = c.category_id;
      `;
      dbConn.query(filmInfoByCategoryIDQuery, [filmID, filmID], (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  filmInfoBySubtring(substr, max_rental, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      let query = `
      SELECT f.film_id, f.title
      FROM film f
      WHERE LOCATE(?, title)<>0`;
      const queryVars = [substr];
      if (max_rental) {
        query += ` AND ${rental_rate_query_str}`;
        queryVars.push(max_rental);
      }
      dbConn.query(query, queryVars, (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  }
};

module.exports = Film;
