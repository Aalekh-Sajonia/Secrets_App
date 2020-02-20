let getSecrets = '';
if(location.protocol === 'https:') {
  getSecrets = 'https://infinite-shore-02990.herokuapp.com/getSecrets';
} else {
  getSecrets = 'http://infinite-shore-02990.herokuapp.com/getSecrets';
}
const insertHtml = document.querySelector("#secretSelector");

const clearHtml = () => {
  insertHtml.innerHTML = '';
}

const htmlRender = (data) => {
  data.forEach((item,index) => {
    const text = `<div class="card border-light m-3 col-lg-3 col-md-4 col-sm-6">
        <div class="card-body text-secondary">
          <h5 class="card-title">Secret ${index+1}</h5>
          <p class="card-text">${item.secret}</p>
        </div>
      </div>`
      insertHtml.insertAdjacentHTML("beforeend",text);
  });

}

function loader() {
  const text = `<div style="text-align: center; padding: 30px; color:#343a40">
    <div class="spinner-border" style="width: 10rem; height: 10rem;" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;
  insertHtml.insertAdjacentHTML('beforeend', text);
}

const getData = async () => {
  try {
    loader();
    const result = await axios({
      method: 'get',
      url: getSecrets
    });
    const resultArr = result.data;
    clearHtml();
    htmlRender(resultArr);
    console.log(resultArr);
  } catch(e) {
    console.log(e);
  }
};
getData();
