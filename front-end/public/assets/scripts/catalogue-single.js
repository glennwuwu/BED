const starIds = ["#star-1", "#star-2", "#star-3", "#star-4", "#star-5"];
const ratingNames = ["terrible", "poor", "average", "good", "excellent"];
function getStars(stars) {
  localStorage.setItem("stars", stars);
  for (let i = 0; i < starIds.length; i += 1) {
    if (i + 1 <= stars) {
      $(starIds[i]).removeClass("star-inactive");
      $(starIds[i]).addClass("star-active");
    } else {
      $(starIds[i]).removeClass("star-active");
      $(starIds[i]).addClass("star-inactive");
    }
  }
}

function setStars(stars) {
  let output = "";
  for (let i = 0; i < starIds.length; i += 1) {
    if (i + 1 <= Math.round(stars)) {
      output += "<span class='fa fa-star star-active mx-1'></span>";
    } else {
      output += "<span class='fa fa-star star-inactive mx-1'></span>";
    }
  }
  return output;
}

const dateOptions = {
  year: "numeric",
  month: "short",
  day: "numeric"
};

function reviewCard(review) {
  return `<div class="col-md-5">
  <div class="card">
    <div class="row d-flex">
      <div class="">
        <img
          class="profile-pic"
          src="https://i.imgur.com/V3ICjlm.jpg"
          alt="profile picture"
        />
      </div>
      <div class="ml-auto">
        <p class="text-muted my-2">${new Date(review.last_update).toLocaleDateString("en-SG", dateOptions)}</p>
      </div>
      <div class="d-flex flex-column">
        <h3 class="mt-0 mb-0">${review.full_name}</h3>
        <div>
          <p class="mb-0">
          ${setStars(review.stars)}
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <p class="content">${review.text}</p>
    </div>
  </div>
</div>`;
}

function troll() {
  alert("Website under maintenance. \nPlease return in 24-48 hours and try again. \nThank you for your understanding!");
}

$(document).ready(() => {
  getStars(5);
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
  axios.get(`http://${hostname}:${port}/film/${parseInt(params.film_id, 10)}`)
    .then((response) => {
      // console.log(response);
      const { film, actors } = response.data;
      $("#title").append(`${film[0].title} (${film[0].release_year})`);
      $("#category").append(film[0].category);
      $("#price strong").append(`$${film[0].cost}/${film[0].rental_duration} days`);
      $("#description").append(film[0].description);
      actors.forEach((actor) => {
        $("#actors").append(`<li>${actor.full_name}</li>`);
      });
      $("#rating").append(film[0].rating);
    })
    .catch((error) => {
      console.log(error);
    });
  axios.get(`http://${hostname}:${port}/customer/info/name`, JSON.parse(localStorage.getItem("config")))
    .then((response) => {
      // console.log(response);
      // $("#user-review").css("display", "block");
      $("#user-name").append(response.data[0].full_name);
    })
    .catch((error) => {
      // console.log(error);
      $("#user-review").remove();
    });
  axios.get(`http://${hostname}:${port}/reviews?film_id=${parseInt(params.film_id, 10)}`)
    .then((response) => {
      console.log(response);
      let mean_stars = 0;
      const different_stars = [0, 0, 0, 0, 0];
      let output = "";
      for (let i = 0; i < response.data.length; i += 1) {
        mean_stars += response.data[i].stars;
        different_stars[response.data[i].stars - 1] += 1;
        output = reviewCard(response.data[i]) + output;
      }
      $("#review-section").append(output);
      mean_stars /= response.data.length;
      for (let i = 0; i < ratingNames.length; i += 1) {
        console.log(parseInt((different_stars[i] * 100) / response.data.length, 10));
        $(`#${ratingNames[i]}-bar`).css("width", `${parseInt((different_stars[i] * 100) / Math.max(...different_stars), 10)}%`);
        $(`#${ratingNames[i]}-count`).append(different_stars[i]);
      }
      $("#disp-star").append(setStars(mean_stars));
      $("#disp-star-text").append(isNaN(mean_stars) ? "No ratings yet" : mean_stars.toFixed(1));
    })
    .catch((error) => {
      console.log(error);
    });
  $("#star-1").click(() => getStars(1));
  $("#star-2").click(() => getStars(2));
  $("#star-3").click(() => getStars(3));
  $("#star-4").click(() => getStars(4));
  $("#star-5").click(() => getStars(5));

  $("#user-review form").submit((a) => {
    a.preventDefault();
    axios.post(`http://${hostname}:${port}/reviews?film_id=${parseInt(params.film_id, 10)}`, { stars: localStorage.getItem("stars"), text: $("#review-text").val() }, JSON.parse(localStorage.getItem("config")))
      .then((response) => {
        // console.log(response);
        $("#user-review form").trigger("reset");
        location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  });
  $("#buy").click(() => {
    troll();
  });
  $("#addtocart").click(() => {
    troll();
  });
});
