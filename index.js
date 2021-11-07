const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let list = JSON.parse(localStorage.getItem("favoriteMovies")) || []; //先執行左邊沒有的話就右邊

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const switchIcon = document.querySelector("#switch-btn");

function listMovieModel(data) {
  let rawHTML = "";
  let btnHTML = "";

  data.forEach((item) => {
    btnHTML = list.some((movie) => movie.id === item.id)
      ? `<button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>`
      : `<button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>`;

    rawHTML += `<div class="col-md-12" id="list">
            <ul class="list-group list-group-flush">
              <li class="list-group-item text-muted">
                <div class="row movie-button">
                  <span class="col list-title">${item.title}</span>
                  <button class="btn btn-primary mr-2 btn-show-movie" data-toggle="modal" data-target="#movie-Modal" data-id="${item.id}">More</button>
                  ${btnHTML}
                </div>
              </li>
            </ul>
        </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderMovieList(data) {
  let rawHTML = "";
  let btnHTML = "";

  // procssing
  data.forEach((item) => {
    // title ,image
    btnHTML = list.some((movie) => movie.id === item.id)
      ? `<button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>`
      : `<button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>`;
    rawHTML += `<div class="col-sm-3 " id="card">
          <div class="mb-2">
            <div class="card">
              <img src="${
                POSTER_URL + item.image
              }" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-Modal" data-id="${
                  item.id
                }">More</button>
                ${btnHTML}
              </div>
            </div>
          </div>
        </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  //  80 / 12 = 6 ... 8 = 7page
  // Math.ceil無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", (event) => {
  if (event.target.tagName !== "A") return;
  const page = +event.target.dataset.page;
  let viewPage = dataPanel.firstElementChild.id;

  if (viewPage.includes("list")) {
    listMovieModel(getMoviesByPage(page));
  } else if (viewPage.includes("card")) {
    renderMovieList(getMoviesByPage(page));
  }
});

// page -> 電影資料
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;

  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    removeFavorite(id);
    return;
  } else {
    list.push(movie);
    localStorage.setItem("favoriteMovies", JSON.stringify(list));
  }
}

function removeFavorite(id) {
  const movieIndex = list.findIndex((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    list.splice(movieIndex, 1);
    localStorage.setItem("favoriteMovies", JSON.stringify(list));
    return alert("已移除");
  }
  console.log(list);
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target;
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(+target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    target.classList.remove("btn-info", "btn-add-favorite");
    target.classList.add("btn-danger", "btn-remove-favorite");
    target.textContent = "x";
    addToFavorite(+target.dataset.id);
  } else if (target.matches(".btn-remove-favorite")) {
    target.classList.remove("btn-danger", "btn-remove-favorite");
    target.classList.add("btn-info", "btn-add-favorite");
    target.textContent = "+";
    removeFavorite(+target.dataset.id);
  }
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  // map, filter, reduce 陣列三寶
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  // console.log(filteredMovies);

  if (filteredMovies.length === 0) {
    return alert("Cannot find movie with keyword: " + keyword);
  }

  let viewPage = dataPanel.firstElementChild.id;

  if (viewPage.includes("list")) {
    renderPaginator(filteredMovies.length);
    listMovieModel(getMoviesByPage(1));
  } else if (viewPage.includes("card")) {
    renderPaginator(filteredMovies.length);
    renderMovieList(getMoviesByPage(1));
  }
});

switchIcon.addEventListener("click", (event) => {
  targetId = event.target.dataset.id;
  if (targetId === "card") {
    filteredMovies.length
      ? renderPaginator(filteredMovies.length)
      : renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  } else if (targetId === "list") {
    console.log(filteredMovies.length);
    filteredMovies.length
      ? renderPaginator(filteredMovies.length)
      : renderPaginator(movies.length);
    listMovieModel(getMoviesByPage(1));
  }
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);

    renderMovieList(getMoviesByPage(1));

    filteredMovies.length
      ? renderPaginator(filteredMovies)
      : renderPaginator(movies);
    renderPaginator(movies.length);
  })
  .catch((err) => console.log(err));
