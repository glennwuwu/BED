function catalogueMainCard(data) {
  return `
  <div class="col-md-4">
    <a class="text-decoration-none" href="catalogue-single.html?film_id=${data.film[0].film_id}">
      <div class="card mb-4 product-wap rounded-0">
        <div class="card rounded-0">
          <img class="card-img rounded-0 img-fluid" src="assets/img/jakob-owens-HuNenPCNG84-unsplash.jpg" />
          <div class="card-body fix-row-height">
            <ul class="text-left list-unstyled d-flex justify-content-start mb-1">
              <li>
                <h5>${data.film[0].title} (${data.film[0].release_year})</h5>
                <ul class="list-inline mb-2">
                  <li class="list-inline-item">
                    <h6>Rating:</h6>
                  </li>
                  <li class="list-inline-item">
                    <span class="btn-dark btn-size px-1">${data.film[0].rating}</span>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </a>
  </div>`;
}

function loadCards(searchResults, cardStyle) {
  $("#card_container").empty();
  if (searchResults.length === 0) {
    $("#card_container").append("<div class='col-md-12 text-center py-1'><h2>No results</h2></div>");
  } else {
    searchResults.forEach((film) => {
      // console.log(film);
      axios.get(`http://${hostname}:${port}/film/${film.film_id}`)
        .then((response) => {
          // console.log(response);
          $("#card_container").append(cardStyle(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}

function byCategory(category_id, max_rental, cardStyle) {
  console.log(category_id, max_rental);
  axios.get(`http://${hostname}:${port}/film/category/${parseInt(category_id, 10)}?max_rental=${max_rental}`)
    .then((response) => {
      // console.log(response);
      loadCards(response.data, cardStyle);
    })
    .catch((error) => {
      console.log(error);
    });
}

function bySearch(q, max_rental, cardStyle) {
  axios.get(`http://${hostname}:${port}/film/search?q=${q}&max_rental=${max_rental}`)
    .then((response) => {
      // console.log(response);
      loadCards(response.data, cardStyle);
    })
    .catch((error) => {
      console.log(error);
    });
}

function displaySearch(params) {
  // console.log(params.q, params.category_id, params.max_rental);
  $("#max_rental").val(params.max_rental);
  if (params.q !== "" && params.q !== null) {
    // console.log("q");
    $("#search").val(params.q);
    window.history.replaceState({}, "", `/catalogue.html?q=${params.q}&category_id=&max_rental=${params.max_rental}`);
    bySearch(params.q, params.max_rental, catalogueMainCard);
  } else if (params.category_id !== "" && params.category_id !== null) {
    // console.log("cat");
    $("#category_id").val(params.category_id);
    byCategory(params.category_id, params.max_rental, catalogueMainCard);
  } else {
    axios.get(`http://${hostname}:${port}/film?max_rental=${params.max_rental}`)
      .then((response) => {
        console.log(response);
        loadCards(response.data, catalogueMainCard);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

$(document).ready(() => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  displaySearch(params);
  axios.get(`http://${hostname}:${port}/film/category`)
    .then((response) => {
      // console.log(response);
      if (params.category_id) {
        $("#categories_list").empty();
        $("#categories_list").append("<option value='' disabled>Category</option>");
      }
      for (let i = 0; i < response.data.length; i += 1) {
        let selected = "";
        if (i + 1 === parseInt(params.category_id, 10)) {
          selected = " selected";
        }
        $("#categories_list").append(`<option value="${response.data[i].category_id}"${selected}>${response.data[i].name}</option>`);
      }
      $("#categories_list").append("<option value='' >Any</option>");
    })
    .catch((error) => {
      console.log(error);
    });
});

$("#merci_beaucoup").submit((a) => {
  a.preventDefault();
  const q = $("#search").val();
  let category_id = $("#categories_list").val();
  if (!category_id) {
    category_id = "";
  }
  const max_rental = $("#max_rental").val();
  window.history.replaceState({}, "", `/catalogue.html?q=${q}&category_id=${category_id}&max_rental=${max_rental}`);
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  displaySearch(params);
});

$("#categories_list").change(() => {
  console.log("here");
  $("#search").val(""); // empty search field since only one is relevant at a time
});

$("#search").change(() => {
  $("#categories_list").val("");
});
