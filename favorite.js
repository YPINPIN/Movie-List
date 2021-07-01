const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const favorites = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="Movie Poster"
            />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-movie"
                data-toggle="modal"
                data-target="#movie-modal"
                data-id=${item.id}
              >
                More
              </button>
              <button class="btn btn-danger btn-remove-favorite" data-id=${
                item.id
              }>X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.src = POSTER_URL + data.image
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function removeFromFavorite(id) {
  if (!favorites) {
    // 收藏清單是空的
    return
  }
  //透過 id 找到要刪除電影的 index
  const movieIndex = favorites.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) {
    // 傳入的 id 在收藏清單中不存在
    return
  }
  //刪除該筆電影
  favorites.splice(movieIndex, 1)
  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(favorites))
  //更新頁面
  renderMovieList(favorites)
}

function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
}

dataPanel.addEventListener('click', onPanelClicked)

renderMovieList(favorites)
