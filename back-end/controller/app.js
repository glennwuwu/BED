// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

// imports
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const bodyParser = require("body-parser");

const config = require("../config/config");
const Auth = require("../auth/Auth");
const Actor = require("../models/Actor");
const Film = require("../models/Film");
const Reviews = require("../models/Reviews");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
const Staff = require("../models/Staff");
const Address = require("../models/Address");
// const Store = require("../models/Store");

// const isUndefined = require("../others/is-undefined");
const isInObject = require("../others/is-in-object");
const Store = require("../models/Store");

const app = express();

app.use(cors());

// parsing body
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);// attach body-parser middleware
app.use(bodyParser.json());// parse json data into a JS object

function verifyToken(req, res, next) {
  Auth.verifyToken(req, res, (error, decoded) => {
    if (error) {
      console.log(error);
      return next({ http_status: 401, code: error.message, field: "AUTH_TOKEN" });
    }
    req.jwt_payload = decoded.payload;
    return next();
  });
}

function verifyAdmin(req, res, next) {
  Auth.verifyToken(req, res, (error, decoded) => {
    if (error) {
      console.log(error);
      return next({ http_status: 401, code: error.message, field: "AUTH_TOKEN" });
    }
    req.jwt_payload = decoded.payload;
    if (req.jwt_payload.id_type === "staff_id") {
      return next();
    }
    return next({ http_status: 401, code: "INVALID", field: "AUTH_TOKEN" });
  });
}

// Replace "secret" with a secret string of your choice
const { secret } = config;

const requiredAddressKeys = [
  "address_line1",
  "address_line2",
  "district",
  "city_id",
  "postal_code",
  "phone"
];

// MARY.SMITH@sakilacustomer.org
// MSmith123

function common_jwt_gen(res, id_type, sql_error, sql_results, next) {
  if (sql_error) {
    return res.status(500).send(sql_error);
  }
  console.log(sql_results);
  if (sql_results.length === 0) {
    // If the user is not found, return a 401 status code (Unauthorized)
    return next({ http_status: 401, code: "INVALID", field: "LOGIN" });
  }
  console.log(sql_results[0]);
  const payload = {
    email: sql_results[0].email, id: sql_results[0][id_type], id_type
  };
  // If the user is found, generate a JWT and send it back to the client
  return jwt.sign(payload, secret, { expiresIn: "24h" }, (jwtError, token) => {
    if (jwtError) {
      return res.status(500).send(jwtError);
    }
    // console.log(token);
    return res.status(200).send({ token });
  });
}

// Customer Login
app.post("/customer/login", (req, res, next) => {
  // Get the username and password from the request body
  const { email, password } = req.body;
  console.log(email, password);

  // Find the user in the array of users
  Customer.loginUser(email, password, (error, results) => common_jwt_gen(res, "customer_id", error, results, next));
});

// Staff Login

app.post("/staff/login", (req, res, next) => {
  // Get the username and password from the request body
  const { email, password } = req.body;
  console.log(email, password);

  // Find the user in the array of users
  Staff.loginStaff(email, password, (error, results) => common_jwt_gen(res, "staff_id", error, results, next));
});

// logged in status

app.get("/verify", (req, res) => {
  Auth.verifyToken(req, res, (error) => res.status(200).send({ error }));
});

// Actor

// Middleware

app.use("/actors/:actorid", verifyToken, (req, res, next) => {
  if (isNaN(req.params.actorid)) { // check if given parameter is NaN
    return next({ http_status: 400, code: "NaN", field: "actor_id" });
  }
  next();
});

// Film Category
app.get("/film/category", (req, res, next) => {
  Category.getAllCategories((error, results) => {
    if (error) {
      return next(error);
    }
    console.log(results);
    return res.status(200).send(results);
  });
});

// Film

app.get("/film/category/:category_id", (req, res, next) => {
  console.log(req);
  if (isNaN(req.params.category_id)) { // check if given parameter is NaN
    return next({ http_status: 400, code: "NaN", field: "category_id" });
  }
  Film.filmInfoByCategoryID(
    parseInt(req.params.category_id, 10),
    parseFloat(req.query.max_rental),
    (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send(results);
    }
  );
});

app.get("/film", (req, res, next) => {
  Film.allFilmsAlphabeticalOrder(parseFloat(req.query.max_rental), (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send(results);
  });
});

app.get("/film/search", (req, res, next) => {
  Film.filmInfoBySubtring(req.query.q, parseFloat(req.query.max_rental), (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send(results);
  });
});

app.get("/film/:film_id", (req, res, next) => {
  if (isNaN(req.params.film_id)) { // check if given parameter is NaN
    return next({ http_status: 400, code: "NaN", field: "category_id" });
  }
  const filmID = parseInt(req.params.film_id, 10);
  Film.filmInfoByFilmID(filmID, (error, results) => {
    if (error) {
      return next(error);
    }
    Actor.infoByFlmID(filmID, (error2, results2) => {
      if (error2) {
        return next(error2);
      }
      return res.status(200).send({ film: results, actors: results2 });
    });
  });
});

// customer info

app.get("/customer/info", verifyToken, (req, res, next) => {
  Customer.getCustomerInfo(parseInt(req.jwt_payload.id, 10), (error, results) => {
    if (error) {
      return next(error);
    }
    Address.getAddressInfo(results[0].address_id, (error2, results2) => {
      if (error2) {
        return next(error2);
      }
      return res.status(200).send({ user: results, address: results2 });
    });
  });
});

app.get("/customer/info/name", verifyToken, (req, res, next) => {
  console.log(req.body);
  if (req.jwt_payload.id_type !== "customer_id") {
    return next({ http_status: 401, code: "INVALID", field: "id_type" });
  }
  Customer.getCustomerName(parseInt(req.jwt_payload.id, 10), (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({ ...results, customer_id: parseInt(req.jwt_payload.id, 10) });
  });
});

app.get("/staff/info", verifyAdmin, (req, res, next) => {
  Staff.getStaffInfo(parseInt(req.jwt_payload.id, 10), (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({ staff: results });
  });
});

app.post("/actors", verifyAdmin, (req, res, next) => {
  // console.log(req.body);
  if (!("first_name" in req.body) || !("last_name" in req.body)) {
    return next({ http_status: 400, code: "MISSING_INFO", field: "body" });
  }
  Actor.addNewActor(req.body, (error, insertId) => {
    if (error) {
      return next(error);
    }
    return res.status(201).send({ actor_id: insertId });
  });
});

app.post("/customers", verifyAdmin, (req, res, next) => {
  const requiredMainKeys = [
    "store_id",
    "first_name",
    "last_name",
    "address",
    "email",
    "password"
  ];
  if (!isInObject(requiredMainKeys, req.body)) {
    return next({ http_status: 400, code: "MISSING_INFO", field: "body" });
  }
  if (!isInObject(requiredAddressKeys, req.body.address)) {
    return next({ http_status: 400, code: "MISSING_INFO", field: "body.address" });
  }
  Customer.addNewCustomer(req.body, (error, insertId) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return next({ http_status: 409, code: "DUP_ENTRY", field: "email" });
      }
      return next(error);
    }
    return res.status(200).send({ customer_id: insertId });
  });
});

// Read reviews

app.get("/reviews", (req, res, next) => {
  if (!("film_id" in req.query)) {
    return next({ http_status: 400, code: "MISSING_INFO", field: "film_id" });
  }
  Reviews.reviewsByFilmID(parseInt(req.query.film_id, 10), (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send(results);
  });
});

app.post("/reviews", verifyToken, (req, res, next) => {
  // console.log(req.body);
  if (req.jwt_payload.id_type !== "customer_id") {
    return next({ http_status: 401, code: "INVALID", field: "id_type" });
  }
  if (!("film_id" in req.query)) {
    return next({ http_status: 400, code: "MISSING_INFO", field: "film_id" });
  }
  if (!("stars" in req.body) || !("text" in req.body)) {
    return next({ http_status: 400, code: "MISSING_INFO", field: "body" });
  }
  Reviews.createReview(
    parseInt(req.jwt_payload.id, 10),
    parseInt(req.query.film_id, 10),
    req.body,
    (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send(results);
    }
  );
});

app.get("/store/address", (req, res, next) => {
  Store.getStoreAddresses((error, results) => {
    if (error) {
      return next(error);
    }
    return res.send(results);
  });
});

// // Endpoint 1
// app.get("/actors/:actorid", verifyToken, (req, res, next) => {
//   Actor.infoByID(parseInt(req.params.actorid, 10), (error, results) => {
//     if (error) {
//       return next(error);
//     }
//     if (results.length === 0) {
//       return res.status(204).send();
//     }
//     return res.status(200).send(results);
//   });
// });

// // Endpoint 2
// app.get("/actors", verifyToken, (req, res, next) => {
//   let { limit, offset } = req.query;
//   // set to default if variables are undefined
//   if (isNaN(offset) || isNaN(limit)) {
//     return next({ http_status: 400, code: "NaN", field: "query" });
//   }
//   if (isUndefined(offset)) {
//     offset = 0;
//   }
//   if (isUndefined(limit) || parseInt(limit, 10) > 20) {
//     limit = 20;
//   }
//   Actor.infoLimOffsetOrdered(parseInt(limit, 10), parseInt(offset, 10), (error, results) => {
//     if (error) {
//       return next(error);
//     }
//     return res.status(200).send(results);
//   });
// });

// Endpoint 3

// // Endpoint 4
// app.put("/actors/:actorid", verifyToken, (req, res, next) => {
//   if (!("first_name" in req.body) && !("last_name" in req.body)) {
//     return next({ http_status: 400, code: "MISSING_INFO", field: "body" });
//   }
//   Actor.updateActor(parseInt(req.params.actorid, 10), req.body, (error, results) => {
//     if (error) {
//       return next(error);
//     }
//     if (results.affectedRows === 0) {
//       return res.status(204).send();
//     }
//     return res.status(200).send({ code: "UPDATE_SUCCESSFUL" });
//   });
// });

// // Endpoint 5
// app.delete("/actors/:actorid", verifyToken, (req, res, next) => {
//   Actor.removeActor(parseInt(req.params.actorid, 10), (error, results, results2) => {
//     if (error) {
//       return next(error);
//     }
//     if (results2.affectedRows === 0) {
//       return res.status(204).send();
//     }
//     return res.status(200).send({ code: "DELETION_SUCCESSFUL" });
//   });
// });

// // Film

// // Endpoint 6
// app.get("/film_categories/:categoryid/films", verifyToken, (req, res, next) => {
//   if (isNaN(req.params.categoryid)) {
//     return next({ http_status: 400, error: "NaN", field: "category_id" });
//   }
//   Film.filmInfoByCatergoryID(parseInt(req.params.categoryid, 10), (error, results) => {
//     if (error) {
//       return next(error);
//     }
//     return res.status(200).send(results);
//   });
// });

// // Customer

// // Endpoint 7
// app.get("/customer/:customerid/payment", verifyToken, (req, res, next) => {
//   if (
// !("start_date" in req.query)
// || !("end_date" in req.query)) { // check if inputs are undefined
//     return next({ http_status: 400, code: "MISSING_INFO", field: "query" });
//   }
//   let { start_date, end_date } = req.query;
//   start_date = new Date(start_date);
//   end_date = new Date(end_date);
//   if (!((start_date instanceof Date && isFinite(start_date.getTime()))
//     || (end_date instanceof Date && isFinite(end_date.getTime())))) { // validate date inputs
//     return next({ http_status: 400, code: "INVALID_DATE", field: "query" });
//   }
//   Customer.paymentDetailByDate(
//     parseInt(req.params.customerid, 10),
//     start_date,
//     end_date,
//     (error, results) => {
//       if (error) {
//         return next(error);
//       }
//       let total_payment = 0;
//       for (let i = 0; i < results.length; i += 1) {
//         total_payment += results[i].amount;
//       }
//       return res.status(200).send({
// rental: results,
// total: parseFloat(total_payment.toFixed(2)) });
//     }
//   );
// });

// Endpoint 8

// // Additional Endpoints

// // Endpoint 9

// app.put("/customer/:customerid/address", verifyToken, (req, res, next) => {
//   if (isNaN(req.params.customerid)) {
//     return next({ http_status: 400, code: "NaN", field: "customer_id" });
//   }
//   if (!isInObject(requiredAddressKeys, req.body)) {
//     return next({ http_status: 400, code: "MISSING_INFO", field: "body" });
//   }
//   Customer.editCustomerAddress(parseInt(req.params.customerid, 10),
// req.body, (error, results) => {
//     if (error) {
//       return next(error);
//     }
//     if (results.affectedRows === 0) {
//       return res.status(204).send();
//     }
//     return res.status(200).send({ code: "UPDATE_SUCCESSFUL" });
//   });
// });

// // Endpoint 10

// app.post("/store", verifyToken, (req, res, next) => {
//   if (!isInObject(requiredAddressKeys, req.body.address)) {
//     return next({ http_status: 400, code: "MISSING_INFO", field: "body.address" });
//   }
//   const requiredStaffKeys = [
//     "first_name",
//     "last_name",
//     "address",
//     "email",
//     "username",
//     "active",
//     "password"
//   ];
//   if (!isInObject(requiredStaffKeys, req.body.manager_staff)) {
//     return next({ http_status: 400, code: "MISSING_INFO", field: "body.manager_staff" });
//   }
//   if (!isInObject(requiredAddressKeys, req.body.manager_staff.address)) {
//     return next({ http_status: 400, code: "MISSING_INFO", field: "body.manager_staff.address" });
//   }
//   // have to use a work-around to initially create the manager staff with a "default" store_id,
//   // since the new store (which requires a manager staff id) hasn't been created yet
//   // basically a chicken-egg problem
//   Staff.addNewStaff({ ...req.body.manager_staff, store_id: 1 }, (error, result) => {
//     if (error) {
//       return next(error);
//     }
//     // "..." spread operator
//     Store.addNewStore({ ...req.body, manager_staff_id: result }, (error2, result2) => {
//       if (error2) {
//         return next(error2);
//       }
//       // set store_id to the actual id.
//       Staff.updateStaffStoreId(result, result2, (error3) => {
//         if (error3) {
//           return next(error3);
//         }
//         return res.status(201).send({ store_id: result2 });
//       });
//     });
//   });
// });

// error handling

app.use((error, req, res, next) => {
  console.error(error);
  if ("sqlMessage" in error) {
    return res.status(500).send({ sql_code: error.code });
  }
  if (!("http_status" in error)) {
    return res.status(500).send(error);
  }
  return res.status(error.http_status).send({ error: `${error.code} in ${error.field}` });
});

module.exports = app;
