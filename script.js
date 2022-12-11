const formContainerId = "#formCantainer";
const formContainer = document.querySelector(formContainerId);
const showBtn = document.querySelector("#addReason");
const form = document.querySelector(".form");
const formSubmitBtn = document.querySelector("#submitBtn");
const formCloseBtn = document.querySelector("#closeBtn");
const vendorDelayIssue = document.querySelector(".vendorDelay");
const customerIssueList = document.getElementById("issues");
const expressDelayIssue = document.querySelector(".expressDelay");
const expressStatus = document.getElementById("expressStatus");
const notAckOption = document.querySelector("#vendorSend");
const orderStatus = document.querySelector("#orderStatus");
const answerStatus = document.getElementsByName("callCustomer");
const customerAsk = document.querySelector(".customerAskVendor");
let customerID = document.querySelector("#customerID");

showBtn.addEventListener("click", () => {
  document.getElementById("mainMsg").innerHTML = "";
  if (customerID.value === "") {
    document.getElementById("mainMsg").innerHTML =
      "لطفا شناسه مشتری را وارد کنید";
    return;
  }
  setTimeout(() => {
    if (!formContainer.classList.contains("show")) {
      formContainer.classList.add("show");
    }
  }, 150);
});

document.addEventListener("click", (element) => {
  const isClosest = element.target.closest(formContainerId);

  if (!isClosest && formContainer.classList.contains("show")) {
    form.reset();
    expressStatusRemover();
    customerIssueRemover();
    formContainer.classList.remove("show");
    document.getElementById("mainMsg").innerHTML = "";
  }
});

function customerIssueRemover() {
  vendorDelayIssue.classList.remove("show");
  expressDelayIssue.classList.remove("show");
}
customerIssueList.addEventListener("change", () => {
  customerIssueRemover();
  switch (customerIssueList.value) {
    case "vendorDelay":
      vendorDelayIssue.classList.add("show");
      break;
    case "expressDelay":
      expressDelayIssue.classList.add("show");
      break;
  }
});
function expressStatusRemover() {
  notAckOption.classList.remove("show");
  orderStatus.classList.remove("show");
}
expressStatus.addEventListener("change", () => {
  expressStatusRemover();
  switch (expressStatus.value) {
    case "request":
    case "assign":
    case "noExpress":
      notAckOption.classList.add("show");
      break;
    case "deliver":
      orderStatus.classList.add("show");
      break;
  }
});

function answerFunction() {
  customerAsk.classList.add("show");
}
function noAnswerFunction() {
  customerAsk.classList.remove("show");
}

const vendorSendNotif = document.querySelector(".vendorSendNotif");

function exVendorSend() {
  vendorSendNotif.classList.add("show");
}
function exVendorNotSend() {
  vendorSendNotif.classList.remove("show");
}

const answeredCustomer = document.querySelector(".answeredCustomer");
const answeredWait = document.querySelector("#exCancel");
const answeredCancel = document.querySelector("#exWait");
function exCustomerAnswer() {
  answeredCustomer.classList.add("show");
}
function exCustomerNoAnswer() {
  answeredWait.checked = false;
  answeredCancel.checked = false;
  answeredCustomer.classList.remove("show");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const submitTime = Date.now() / 1000;
  formValidation(submitTime);
});

let validationMsg = document.querySelector("#validationMsg");

let formValidation = (timeStamp) => {
  if (customerIssueList.value == "default") {
    validationMsg.innerHTML = "لطفا مشکل مشتری را مشخص کنید!";
    console.log("failure!");
    setTimeout(() => {
      validationMsg.innerHTML = "";
    }, 1200);
  } else {
    validationMsg.innerHTML = "";
    console.log("Success!");

    acceptData(customerID.value, timeStamp);

    expressStatusRemover();
    customerIssueRemover();
    formContainer.classList.remove("show");
    document.getElementById("mainMsg").innerHTML = "";
    customerID.value = "";
  }
};
let data = [];
let acceptData = (inputCID, timeStamp) => {
  let formData = { customerId: inputCID, submitTime: timeStamp };
  let allData = document.querySelectorAll("#form input, #form select");
  for (let item of allData) {
    if (item.type == "select-one" && item.value !== "default") {
      formData[item.name] = item.value;
    }
    if (item.type == "radio" && item.checked) {
      formData[item.name] = item.value;
    }
  }
  data.push(formData);
  localStorage.setItem("data", JSON.stringify(data));
  reportData(inputCID);

  console.log(data);
};

let reportPlace = document.getElementById("reportPlace");
let reportData = (inputCID) => {
  reportPlace.innerHTML = "";
  let customerReport = JSON.parse(localStorage.getItem("data"))
    .filter((item) => {
      return item.customerId == inputCID;
    })
    .sort((a, b) => {
      return b.submitTime - a.submitTime;
    });
  if (customerReport.length === 0) {
    reportPlace.innerHTML = "گزارشی جهت نمایش موجود نیست";
  } else {
    reportPlace.innerHTML = `
    <table class="reportTable" id="reportTable">
      <tr>
        <th class="idCol tableHeader">شناسه مشتری</th>
        <th class="reasonCol tableHeader">شرح مشکل</th>
        <th class="descriptionCol tableHeader">شرح پیگیری</th>
      </tr>
    </table>`;
    customerReport.forEach((item) => {
      reportPlace.innerHTML += `
      <table class="reportTable" id="reportTable">
          <tr>
            <td class="idCol">${item.customerId}</td>
            <td class="reasonCol">${
              item.issues === "expressDelay" ? "تاخیر اکسپرس" : "تاخیر وندور"
            }</td>
            <td class="descriptionCol">
              ${description(item)}
            </td>
          </tr>
        </table>
      `;
    });
  }
  form.reset();
};
function description(inputItem) {
  let temp = Object.assign({}, inputItem);
  delete temp.customerId;
  delete temp.issues;
  delete temp.submitTime;

  console.log(temp);
  let resultString = "";
  for (let prop in temp) {
    switch (prop) {
      case "vendorDelayReport":
        resultString += `نحوه اعلام تاخیر: `;
        temp[prop] === "incoming"
          ? (resultString += "تماس ورودی")
          : (resultString += "تیکت");
        break;
      case "delayRepeat":
        resultString += ` - - تکرار تاخیر: `;
        if (temp[prop] === "firstDelay") {
          resultString += `تاخیر اول  `;
        } else if (temp[prop] === "secondDelay") {
          resultString += `تاخیر دوم  `;
        } else {
          resultString += `تاخیر سوم  `;
        }
        break;
      case "sendStatus":
        resultString += ` - - وضعیت ارسال سفارش: `;
        switch (temp[prop]) {
          case "5":
            resultString += `تحویل تا 5 دقیقه دیگر  `;
            break;
          case "10":
            resultString += `تحویل تا 10 دقیقه دیگر  `;
            break;
          case "15":
            resultString += `تحویل تا 15 دقیقه دیگر  `;
            break;
          case "20":
            resultString += `تحویل تا 20 دقیقه دیگر  `;
            break;
          case "25":
            resultString += `تحویل تا 25 دقیقه دیگر  `;
            break;
          case "30":
            resultString += `تحویل تا 30 دقیقه دیگر  `;
            break;
          case "cancel":
            resultString += `عدم امکان ارسال و کنسلی سفارش  `;
            break;
        }
        break;
      case "callCustomer":
        resultString += ` - - نتیجه تماس با مشتری: `;
        temp[prop] === "answer"
          ? (resultString += "پاسخگو")
          : (resultString += "بی پاسخ");
        break;
      case "customerAsk":
        resultString += ` - - درخواست مشتری: `;
        temp[prop] === "wait"
          ? (resultString += "منتظر می مانند")
          : (resultString += "سفارش کنسل شود");
        break;
      case "expressDelay":
        resultString += `نحوه اعلام تاخیر: `;
        temp[prop] === "incoming"
          ? (resultString += "تماس ورودی")
          : (resultString += "تیکت");
        break;
      case "exDelayRepeat":
        resultString += ` - - تکرار تاخیر: `;
        if (temp[prop] === "firstDelay") {
          resultString += `تاخیر اول  `;
        } else if (temp[prop] === "secondDelay") {
          resultString += `تاخیر دوم  `;
        } else {
          resultString += `تاخیر سوم  `;
        }
        break;
      case "expressStatus":
        resultString += ` - - وضعیت پیک اکسپرس: `;
        switch (temp[prop]) {
          case "noExpress":
            resultString += `undefined  `;
            break;
          case "request":
            resultString += `REQUESTED  `;
            break;
          case "assign":
            resultString += `ASSIGNED  `;
            break;
          case "ACK":
            resultString += `ACK  `;
            break;
          case "arRest":
            resultString += `AT RESAURANT  `;
            break;
          case "dropOff":
            resultString += `ARRIVED AT DROP OFF  `;
            break;
          case "deliver":
            resultString += `DELIVERED  `;
            break;
        }
        break;
      case "vendorSend":
        resultString += ` - - امکان ارسال توسط وندور: `;
        temp[prop] === "send"
          ? (resultString += "دارد")
          : (resultString += "ندارد");
        break;
      case "orderStatus":
        resultString += ` - - وضعیت سفارش: `;
        temp[prop] === "inVendor"
          ? (resultString += "داخل مجموعه")
          : (resultString += "تحویل پیک");
        break;
      case "callCustomer":
        resultString += ` - - نتیجه تماس با مشتری: `;
        temp[prop] === "answer"
          ? (resultString += "پاسخگو")
          : (resultString += "بی پاسخ");
        break;
      case "customerAsk":
        resultString += ` - - درخواست مشتری: `;
        temp[prop] === "exWait"
          ? (resultString += "منتظر می مانند")
          : (resultString += "سفارش کنسل شود");
        break;
      case "givenTime":
        resultString += ` - - زمان داده شده: `;
        switch (temp[prop]) {
          case "5":
            resultString += `5 دقیقه  `;
            break;
          case "10":
            resultString += `10 دقیقه  `;
            break;
          case "15":
            resultString += `15 دقیقه  `;
            break;
          case "20":
            resultString += `20 دقیقه  `;
            break;
          case "25":
            resultString += `25 دقیقه  `;
            break;
          case "30":
            resultString += `ARRIVED AT DROP OFF  `;
            break;
        }
        break;
    }
  }
  return resultString;
}
formCloseBtn.addEventListener("click", () => {
  form.reset();
  expressStatusRemover();
  customerIssueRemover();
  formContainer.classList.remove("show");
  document.getElementById("mainMsg").innerHTML = "";
});

(() => {
  data = JSON.parse(localStorage.getItem("data")) || [];
  reportData(customerID.value);
})();

customerID.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    reportData(customerID.value);
  }
});
