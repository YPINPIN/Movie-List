const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const viewSwitcher = document.querySelector('#view-switcher')
// movie data
const movies = []
// 關鍵字搜尋的列表
let filteredMovies = []
// 一頁顯示的數量
const MOVIES_PER_PAGE = 12
// 當前頁面
let curPage = 1
// 顯示模式
const CARD_VIEW = 'CARD_VIEW'
const LIST_VIEW = 'LIST_VIEW'
let viewType = CARD_VIEW

// 列表初始化
function initMovieList(data) {
  // ES6 展開運算子spread operator
  movies.push(...data)
  viewType = CARD_VIEW
  curPage = 1
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(curPage), viewType)
}

// 列表顯示 傳入參數 data(顯示資料)、type(指定顯示模式)
function renderMovieList(data, type = CARD_VIEW) {
  let rawHTML = ''
  switch (type) {
    case CARD_VIEW:
      rawHTML = getHtmlForCard(data)
      break
    case LIST_VIEW:
      rawHTML = getHtmlForList(data)
      break
    default:
      break
  }
  dataPanel.innerHTML = rawHTML
  viewType = type
}

// Card 顯示的html
function getHtmlForCard(data) {
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
              <button class="btn btn-info btn-add-favorite" data-id=${
                item.id
              }>+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  return rawHTML
}

// List 顯示的html
function getHtmlForList(data) {
  let rawHTML = `
    <div class="col-12 mb-2">
      <ul class="list-group">
  `
  data.forEach((item) => {
    rawHTML += `
        <li
          class="
            list-group-item
            border-right-0 border-left-0
            d-flex
            justify-content-between
            align-items-center
            font-weight-bold
          "
        >
          ${item.title}
          <div class="list-action mr-5">
            <button
              class="btn btn-primary btn-show-movie"
              data-toggle="modal"
              data-target="#movie-modal"
              data-id=${item.id}
            >
              More
            </button>
            <button class="btn btn-info btn-add-favorite" data-id=${item.id}>
              +
            </button>
          </div>
        </li>
    `
  })
  rawHTML += `
      </ul>
    </div>
  `
  return rawHTML
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  // 是否有搜尋資料
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
}

function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  curPage = 1
  renderMovieList(getMoviesByPage(curPage), viewType)
}

function onPaginatorClicked(event) {
  console.log(event)
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  curPage = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(curPage), viewType)
}

// 顯示模式切換
function onViewSwitcherClicked(event) {
  if (event.target.matches('.btn-view-card')) {
    renderMovieList(getMoviesByPage(curPage), CARD_VIEW)
  } else if (event.target.matches('.btn-view-list')) {
    renderMovieList(getMoviesByPage(curPage), LIST_VIEW)
  }
}

// 註冊監聽
function registerEventListener() {
  dataPanel.addEventListener('click', onPanelClicked)
  searchForm.addEventListener('submit', onSearchFormSubmitted)
  paginator.addEventListener('click', onPaginatorClicked)
  viewSwitcher.addEventListener('click', onViewSwitcherClicked)
}

axios
  .get(INDEX_URL)
  .then((response) => {
    registerEventListener()
    initMovieList(response.data.results)
  })
  .catch((error) => {
    console.log(error)
  })
