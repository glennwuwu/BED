$(document).ready(() => {
  axios.get(`http://${hostname}:${port}/staff/info`, JSON.parse(localStorage.getItem("config")))
    .then((response) => {
      $("#post-actor").css("display", "block");
    })
    .catch(
      (error) => {
        if (error.response.status === 401) {
          window.location.href = "/index.html";
        }
        console.log(error);
      }
    );
  axios.get(`http://${hostname}:${port}/store/address`)
    .then((response) => {
      console.log(response);
      response.data.forEach((store) => {
        $("#store_id").append(`<option value="${store.store_id}">${store.address}, ${store.district}</option>`);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  $("#post-actor").submit((a) => {
    a.preventDefault();
    console.log();
    const first_name = $("#first_name").val().toUpperCase();
    const last_name = $("#last_name").val().toUpperCase();
    axios.post(`http://${hostname}:${port}/actors`, { first_name, last_name }, JSON.parse(localStorage.getItem("config")))
      .then((response) => {
        console.log(response);
        alert(`Actor with First Name: ${first_name} Last Name: ${last_name} inserted at ID: ${response.data.actor_id}`);
        $("#post-actor").trigger("reset");
      })
      .catch((error) => {
        alert(error.request.response);
      });
  });
});
