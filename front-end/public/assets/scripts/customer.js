$(document).ready(() => {
  axios.get(`http://${hostname}:${port}/staff/info`, JSON.parse(localStorage.getItem("config")))
    .then((response) => {
      $("#post-customer").css("display", "block");
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
  $("#post-customer").submit((a) => {
    a.preventDefault();
    console.log();
    const store_id = $("#store_id").val();
    const first_name = $("#first_name").val().toUpperCase();
    const last_name = $("#last_name").val().toUpperCase();
    const email = $("#email").val();
    const password = $("#password").val();
    const address_line1 = $("#address_line1").val();
    const address_line2 = $("#address_line2").val();
    const district = $("#district").val();
    const city_id = $("#city_id").val();
    const postal_code = $("#postal_code").val();
    const phone = $("#phone").val();
    axios.post(`http://${hostname}:${port}/customers`, {
      store_id,
      first_name,
      last_name,
      email,
      password,
      address: {
        address_line1,
        address_line2,
        district,
        city_id,
        postal_code,
        phone
      }
    }, JSON.parse(localStorage.getItem("config")))
      .then((response) => {
        console.log(response);
        alert(`Customer with First Name: ${first_name} Last Name: ${last_name} inserted at ID: ${response.data.customer_id}`);
        $("#post-customer").trigger("reset");
      })
      .catch((error) => {
        alert(error.request.response);
        // console.log(error.request.response);
      });
  });
});
