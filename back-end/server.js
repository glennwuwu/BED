// Name: Glenn Wu
// Class: DAAA/1B/FT/01
// Admin No.: 2214395

// imports
const app = require("./controller/app");

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server hosted at http://localhost:${PORT}`);
});
