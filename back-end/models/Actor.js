// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const isUndefined = require("../others/is-undefined");
const db = require("../config/databaseConfig");

const Actor = {
  infoByFlmID(filmID, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const infoByIDQuery = `
      SELECT a.actor_id, a.full_name
      FROM film_actor fa, actor a
      WHERE fa.film_id = ?
      AND a.actor_id = fa.actor_id;`;
      dbConn.query(infoByIDQuery, [filmID], (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
      // dbConn.query(infoByIDQuery, actorID)
      //   .then((result)=>{})
      //   .catch((error)=>{});
    });
  },

  infoByID(actorID, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const infoByIDQuery = `
      SELECT actor_id, first_name, last_name
      FROM actor 
      WHERE actor_id = ?;`;
      dbConn.query(infoByIDQuery, actorID, (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
      // dbConn.query(infoByIDQuery, actorID)
      //   .then((result)=>{})
      //   .catch((error)=>{});
    });
  },

  infoLimOffsetOrdered(limit, offset, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const infoLimOffsetOrderedQuery = `
      SELECT actor_id, first_name, last_name
      FROM actor 
      ORDER BY first_name ASC
      LIMIT ?
      OFFSET ?;`;
      dbConn.query(infoLimOffsetOrderedQuery, [limit, offset], (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  addNewActor(actor, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const actorInsertQuery = `
      INSERT INTO actor (first_name, last_name) 
      VALUES(?, ?);`;
      dbConn.query(actorInsertQuery, [actor.first_name, actor.last_name], (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results.insertId);
      });
    });
  },

  updateActor(actorID, actor, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const queryArr = [];
      let editQuery = "UPDATE actor SET ";
      if (!isUndefined(actor.first_name) && !isUndefined(actor.last_name)) {
        editQuery += "first_name = ?, last_name = ?";
        queryArr.push(actor.first_name, actor.last_name);
      } else if (!isUndefined(actor.first_name)) {
        editQuery += "first_name = ?";
        queryArr.push(actor.first_name);
      } else {
        editQuery += "last_name = ?";
        queryArr.push(actor.last_name);
      }
      queryArr.push(actorID);
      editQuery += "WHERE actor_id = ?";
      dbConn.query(editQuery, queryArr, (error, results) => {
        dbConn.end();
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      });
    });
  },

  removeActor(actorID, callback) {
    const dbConn = db.getConnection();
    dbConn.connect((dbConnErr) => {
      if (dbConnErr) {
        console.log(dbConnErr);
        return callback(dbConnErr, null);
      }
      const removeDependenciesQuery = `
      DELETE FROM film_actor
      WHERE actor_id = ?`;
      dbConn.query(removeDependenciesQuery, actorID, (error, results) => {
        if (error) {
          return callback(error, null, null);
        }
        const removeQuery = `
        DELETE FROM actor 
        WHERE actor_id = ?`;
        dbConn.query(removeQuery, actorID, (error2, results2) => {
          dbConn.end();
          if (error) {
            return callback(error2, null, null);
          }
          return callback(null, results, results2);
        });
      });
    });
  }
};

module.exports = Actor;
