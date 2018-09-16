
const BASE_URL = "https://script.google.com/macros/s/AKfycbyzJBFIC8PFykacFyF1koj1hYH_oGLYy1t-7sUrIy79Xv9AGAA/exec";

// convenience references to elements
let gElemContentHome = null;
let gElemContentOpenAssignments = null;
let gElemContentMyAssignments = null;
let gElemContentMyStats = null;

// Array of open assignments
let gaOpenAssignments = [];

/* =========================================================
*  dateReviver()
*    Helper for JSON.parse() so the object that parse() builds will
*    create Dates rather than funky ISO Strings for Date objects.
========================================================== */
function dateReviver(key, value) {
  let a;
  if (typeof value === 'string') {
    a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    if (a) {
      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
    }
  }
  return value;
}

/* ==================================================
*  ajaxOpenAssignments
*
*  Load open assignments into gaOpenAssignments
* =================================================== */
// function ajaxOpenAssignments() {
//
//   // build ajax url
//   let urlConversion = BASE_URL;
//
//   urlConversion += "?name=mike reagan";
//   console.log(urlConversion);
//
//   // get a convenience copy of the span to place result or error msg
//   const elemResult = document.getElementById("list-open-assignments");
//
//   // make AJAX call
//   axios.get(urlConversion)
//     .then((oResponse) => {
//       console.log("-- response successful --");
//       // console.log(`oResonse.data: ${oResponse.data}`);
//       // console.log(`Data: ${JSON.stringify(oResponse.data)}`);
//       // console.log("^^^^^^^^^^^^^^");
//
//       gaOpenAssignments = JSON.parse(oResponse.data, dateReviver);
//
//       elemResult.innerText = gaOpenAssignments.length;
//
//       // if (oResponse.data.success) {
//       //   elemResult.innerText = oResponse.data;
//       // } else {
//       //   // display error mesg
//       //   const sErrorMsg = JSON.stringify(oResponse);
//       //   elemResult.innerText = sErrorMsg;
//       // }
//
//     }) // then
//     .catch((error) => {
//       // display AJAX error msg
//       console.log("-- error --");
//       console.log(`${error}`);
//       const sErrorMsg = JSON.stringify(error);
//       elemResult.innerText = sErrorMsg;
//     }); // catch
//
// }
/* ==================================================
*  changeMenuAndContentArea()
*
*  Menu choice onClick event handers call this function to
*  set the correct menu choice active and display the
*  correct content area.  The onClick handler must still
*  dynamically fill the content area.
* =================================================== */
function changeMenuAndContentArea(sMenuBtnID, elemContent) {

  // hide all content sections
  const aElemContent = document.querySelectorAll(".content");
  for (const elem of aElemContent) {
    elem.setAttribute("hidden", true);
  }

  // set all menu buttons inactive
  const aElemNavLink = document.querySelectorAll(".nav-link");
  for (const elemNavLink of aElemNavLink) {
    elemNavLink.classList.remove("active");
  }

  // set current menu choice active and show associated content area
  document.getElementById(sMenuBtnID).classList.add("active");
  elemContent.removeAttribute("hidden");
}

/* ==================================================
*  onMenuHome()
*
*  Menu selection
* =================================================== */
function onMenuHome() {
  changeMenuAndContentArea("nav--home", gElemContentHome);
}

/* ==================================================
*  sortAssignments()
*
*  Helper for onMenuOpenAssignments() to sort assignments for display
* =================================================== */
function sortAssignments(oAssign1, oAssign2) {
  // sort by Care_Plan
  if (oAssign1.Care_Plan < oAssign2.Care_Plan)
    return -1;
  if (oAssign2.Care_Plan < oAssign1.Care_Plan)
    return 1;
  // Care_Plans are === so sort z-a by timestamp
  if (oAssign1.Timestamp < oAssign2.Timestamp)
    return -1;
  if (oAssign2.Timestamp < oAssign1.Timestamp)
    return 1;
  // timestamps could be the same if they were manually set to
  // a date to change the listing order
  return 0;
}

/* ==================================================
*  getCarePlanHeading()
*
*  Helper for onMenuOpenAssignments to create a CarePlanHeading element
* =================================================== */
function getCarePlanHeading(sCarePlan) {
  const elemCarePlan = document.createElement('H3');
  elemCarePlan.innerText = sCarePlan;
  return elemCarePlan;
}

/* ==================================================
*  onMenuOpenAssignments()
*
*  Menu selection
* =================================================== */
function onMenuOpenAssignments() {
  changeMenuAndContentArea("nav--open-assignments", gElemContentOpenAssignments);

  // get a convenience copy of the span to place list of open assignments
  const elemResult = document.getElementById("list-open-assignments");
  elemResult.innerHTML = "";

  // show loading spinner
  document.querySelector("#content--open-assignments .spinner").removeAttribute("hidden");

  // elemResult.innerHTML = "";
  // const elemSpinner = document.createElement("img");
  // elemSpinner.src = "./images/spinner-small.gif";
  // elemSpinner.setAttribute("width", "100px");
  // elemResult.appendChild(elemSpinner);

  // make AJAX call
  axios.get(BASE_URL)
    .then((oResponse) => {
      console.log("-- response successful --");

      // Parse the returned JSON into an array of assignments
      gaOpenAssignments = JSON.parse(oResponse.data, dateReviver);

      // Sort assignments for display
      gaOpenAssignments.sort(sortAssignments);

      // Load DOM with open assignments
      let sCurrCarePlan = "";
      for (const oAssignment of gaOpenAssignments) {
        if (oAssignment.Care_Plan !== sCurrCarePlan) {
          sCurrCarePlan = oAssignment.Care_Plan;
          elemResult.appendChild(getCarePlanHeading(oAssignment.Care_Plan));
        }
      }

      // Hide loading spinner
      document.querySelector("#content--open-assignments .spinner").setAttribute("hidden", true);

      // let s = "";
      // for (const oAssignment of gaOpenAssignments) {
      //   s += `${oAssignment.Patient_ID}<br>`;
      // }
      // elemResult.innerHTML = s;

    }) // then
    .catch((error) => {
      // display AJAX error msg
      console.log("-- error --");
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      elemResult.innerText = sErrorMsg;
    }); // catch
}

/* ==================================================
*  onMenuMyAssignments()
*
*  Menu selecion
* =================================================== */
function onMenuMyAssignments() {
  changeMenuAndContentArea("nav--my-assignments", gElemContentMyAssignments);
}

/* ==================================================
*  onMenuMyStats()
*
*  Menu selection
* =================================================== */
function onMenuMyStats() {
  changeMenuAndContentArea("nav--my-stats", gElemContentMyStats);
}

/* ==================================================
*  DOM loaded, setup and set button event listener
* =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded");

  gElemContentHome = document.getElementById("content--home");
  gElemContentOpenAssignments = document.getElementById("content--open-assignments");
  gElemContentMyAssignments = document.getElementById("content--my-assignments");
  gElemContentMyStats = document.getElementById("content--my-stats");

  document.getElementById("nav--home").onclick = onMenuHome;
  document.getElementById("nav--open-assignments").onclick = onMenuOpenAssignments;
  document.getElementById("nav--my-assignments").onclick = onMenuMyAssignments;
  document.getElementById("nav--my-stats").onclick = onMenuMyStats;

  onMenuHome();
});
