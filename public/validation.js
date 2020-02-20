const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const emailBlock = document.querySelector("#login");
const passwordBlock = document.querySelector("#password");
let a = 20;
emailBlock.addEventListener('click', () => {
  emailBlock.classList.remove("failed-validation");
  passwordBlock.classList.remove("failed-validation");
});

passwordBlock.addEventListener('click', () => {
  emailBlock.classList.remove("failed-validation");
  passwordBlock.classList.remove("failed-validation");
});

const validateData = () => {
  let email = document.querySelector("#login").value;
  const password = document.querySelector("#password").value;
  email = email.trim();
  if (email.length != 0 && password.length != 0) {
    if (email.match(emailReg)) {
      return true;
    } else {
      emailBlock.classList.add("failed-validation");
      return false;
    }
  } else {
    emailBlock.classList.add("failed-validation");
    passwordBlock.classList.add("failed-validation");
    return false;
  }
}
