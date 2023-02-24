function common_login(user_type) {
  $("#incorrect-login").empty();
  axios.post(`http://${hostname}:${port}/${user_type}/login`, {
    email: $("#email").val(),
    password: $("#password").val()
  }, {})
    .then((response) => {
      const config = {
        headers: {
          authorization: `Bearer ${response.data.token}`,
          user_type
        }
      };
      localStorage.setItem("user_type", user_type);
      localStorage.setItem("config", JSON.stringify(config));
      if (user_type === "staff") {
        window.location.href = "/admin.html"; // direct to admin
      } else {
        window.location.href = "/profile.html"; // direct to a profile page
      }
    })
    .catch((error) => {
      $("#incorrect-login").append("Your login information was incorrect.");
      console.log(error);
    });
}

$(document).ready(() => {
  $("#login").click(() => {
    common_login("customer");
  });
  $("#admin-login").click(() => {
    common_login("staff");
  });
});
