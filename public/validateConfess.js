console.log("Hii validation");
const secretBlock = document.querySelector("#secret");

secretBlock.addEventListener('click', () => {
  secretBlock.classList.remove("failed-validation");
});

const validateData = () => {
  const secretField = document.querySelector("#secret").value;
  console.log(secretField);
  if(secretField.trim().length == 0)
  {
    secretBlock.classList.add("failed-validation");
    return false;
  }
  return true;
}

const count_down = (obj) => {
  const ele = document.querySelector('#count1');

  ele.innerHTML = 140 - obj.value.length;
}
