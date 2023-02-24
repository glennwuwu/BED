// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

const mysql = require("mysql");

const dbConnect = {
  getConnection() {
    const connection = mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "bed_dvd_root",
      password: "pa$$woRD123",
      database: "bed_dvd_db",
      dateStrings: true,
      multipleStatements: true
    });

    return connection;
  }
};

// put this at the end of the file
module.exports = dbConnect;
