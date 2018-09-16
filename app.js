
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
function ajaxOpenAssignments() {

  // build ajax url
  let urlConversion = BASE_URL;

  urlConversion += "?name=mike reagan";
  console.log(urlConversion);

  // get a convenience copy of the span to place result or error msg
  const elemResult = document.getElementById("result");

  // make AJAX call
  axios.get(urlConversion)
    .then((oResponse) => {
      console.log("-- response successful --");
      // console.log(`oResonse.data: ${oResponse.data}`);
      // console.log(`Data: ${JSON.stringify(oResponse.data)}`);
      // console.log("^^^^^^^^^^^^^^");

      gaOpenAssignments = JSON.parse(oResponse.data, dateReviver);

      elemResult.innerText = gaOpenAssignments.length;

      // if (oResponse.data.success) {
      //   elemResult.innerText = oResponse.data;
      // } else {
      //   // display error mesg
      //   const sErrorMsg = JSON.stringify(oResponse);
      //   elemResult.innerText = sErrorMsg;
      // }

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
*  hideAllContent()
*
*  Hide all of the content blocks associated with the menu choices
* =================================================== */
function hideAllContent() {
  gElemContentHome.setAttribute("hidden",true);
  gElemContentOpenAssignments.setAttribute("hidden",true);
  gElemContentMyAssignments.setAttribute("hidden",true);
  gElemContentMyStats.setAttribute("hidden",true);
}

/* ==================================================
*  onMenuHome()
*
*  Menu selection
* =================================================== */
function onMenuHome() {
  hideAllContent();
  gElemContentHome.removeAttribute("hidden");
}

/* ==================================================
*  onMenuOpenAssignments()
*
*  Menu selection
* =================================================== */
function onMenuOpenAssignments() {
  hideAllContent();
  gElemContentOpenAssignments.removeAttribute("hidden");
}

/* ==================================================
*  onMenuMyAssignments()
*
*  Menu selecion
* =================================================== */
function onMenuMyAssignments() {
  hideAllContent();
  gElemContentMyAssignments.removeAttribute("hidden");
}

/* ==================================================
*  onMenuMyStats()
*
*  Menu selection
* =================================================== */
function onMenuMyStats() {
  hideAllContent();
  gElemContentMyStats.removeAttribute("hidden");
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
