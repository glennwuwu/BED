$(document).ready(() => {
  $("#goto-profile").click(() => {
    if (localStorage.getItem("config") === "") {
      window.location.href = "/login.html?#"; // change to profile page
    } else {
      axios.get(`http://${hostname}:${port}/verify`, JSON.parse(localStorage.getItem("config")))
        .then((response) => {
          console.log(localStorage.getItem("user_type"));
          if (response.data.error) {
            window.location.href = "/login.html?#";
          } else if (localStorage.getItem("user_type") === "staff") {
            window.location.href = "/admin.html"; // change to staff profile page
          } else if (localStorage.getItem("user_type") === "customer") {
            window.location.href = "/profile.html"; // change to customer profile page
          } else {
            window.location.href = "/login.html?#"; // change to profile page
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
  if (["/admin.html", "/profile.html"].includes(window.location.pathname)) {
    const fields = [".full_name", ".email", "#ph_num", "#address_1", "#address_2", "#postal_code", "#district"];
    fields.forEach((field) => { $(`${field}_field`).empty(); });
    if (localStorage.getItem("config") !== "") {
      axios.get(`http://${hostname}:${port}/${localStorage.getItem("user_type")}/info`, JSON.parse(localStorage.getItem("config")))
        .then((response) => {
          if (localStorage.getItem("user_type") === "staff") {
            const { staff } = response.data;
            $("#full_name_field").prepend(staff[0].username);
            $("#email_field").append(staff[0].email);
          } else {
            const { user, address } = response.data;
            $(".full_name_field").append(user[0].full_name);
            $(".email_field").append(user[0].email);
            $("#ph_num_field").append(address[0].phone);
            $("#address_1_field").append(address[0].address);
            $("#address_2_field").append(address[0].address2);
            $("#postal_code_field").append(address[0].postal_code);
            $("#district_field").append(`${address[0].district}, ${address[0].city}, ${address[0].country}`);
          }
        })
        .catch((error) => {
          window.location.href = "/index.html"; // change to customer profile page
          console.log(error);
        });
    }
  }
  $("#sign_out").click(() => {
    localStorage.clear();
    window.location.href = "/index.html";
  });
});
