/* Table of contents

   Globals

   General Utils

   Menu Handlers -- contain AJAX calls
*/

const BASE_URL = "https://script.google.com/macros/s/AKfycbyzJBFIC8PFykacFyF1koj1hYH_oGLYy1t-7sUrIy79Xv9AGAA/exec";

// convenience references to elements
let gelemContentHome = null;
let gelemContentOpenAssignments = null;
let gelemContentMyAssignments = null;
let gelemContentMyStats = null;

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
  changeMenuAndContentArea("nav--home", gelemContentHome);
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
// function getCarePlanHeading(sCarePlan) {
//   const elemCarePlan = document.createElement('H3');
//   elemCarePlan.innerText = sCarePlan;
//   return elemCarePlan;
// }

function getRow(sTh, sTd) {
  const elemRow = document.createElement("tr");
  const elemColTh = document.createElement("th");
  const elemColTd = document.createElement("td");

  elemColTh.innerText = sTh;
  elemColTd.innerHtml = sTd;

  elemRow.appendChild(elemColTh);
  elemRow.appendChild(elemColTd);

  return elemRow;
}

/* ==================================================
*  getElemOpenAssignmentDetails()
*
*  Helper to creat the DOM element for an assignment's details
* =================================================== */
function getElemOpenAssignmentDetails(oAssignment) {
  const elemTable = document.createElement('table');
  elemTable.appendChild(getRow("Location", `${oAssignment.Post_Location} - ${oAssignment.Home_or_Facility}`));
  elemTable.appendChild(getRow("Request", `${oAssignment.Care_Plan}  ADD MORE`));
  elemTable.appendChild(getRow("Stats", `${oAssignment.Age} yo ${oAssignment.Gender} with ${oAssignment.Diagnosis}`));
  elemTable.appendChild(getRow("Background",`FIX THIS -- ${oAssignment.Psychosocial}`));

  return elemTable;

//   sOutput += "<p><table>";
//   sOutput += "<tr><th>Location</th><td>"+  oAssignment.Post_Location+" - "+oAssignment.Home_or_Facility+"</td></tr>";
//   sOutput += "<tr><th>Request</th><td>"+   oAssignment.Care_Plan+": &nbsp;"+addHtmlBr(redactNames(oAssignment.Request))+"</td></tr>";
//   sOutput += "<tr><th>Stats</th><td>"+     oAssignment.Age+" yo "+oAssignment.Gender+" with "+oAssignment.Diagnosis+"</td></tr>";
//   sOutput += "<tr><th>Background</th><td>"+addHtmlBr(redactNames(oAssignment.Psychosocial))+"</td></tr>";
//   sOutput += "<tr>" +
//                 "<th class=accept-head>Accept</th>"+
//                 "<td class=accept-name>" +
//                   "Your name: " +
//                   "<input type=\"text\" id=\"sVolunteer"+assignmentIndex+"\">" +   // create unique field name, example: sVolunteer3
//                   "&nbsp; <button type=\"button\" onclick=\"handleRequestAssignment("+assignmentIndex+")\">I Accept</button>" +
//                 "</td></tr>";
// sOutput += "</table><p>";

}

/* ==================================================
*  function getElemOpenAssignment()
*
*  Builds ard returns the element for an assignment in the form:
*
*   <div class="card">
*     <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
*       <h3><a href="#">heading for assignment...</a></h3>
*     </div>
*     <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
*       <div class="card-body">
*         <table>
*           details of assignment...
*         </table>
*       </div>
*     </div>
*   </div>
*
* @param idxCP (int) index of the current care plan, used to create ID
* @param oAssignment (object) the assignment to add
* @param idxAssignment (int)  index of the current care plan, used to create ID
* =================================================== */
function getElemOpenAssignment(idxCP, oAssignment, idxAssignment) {
  // <div class="card">
  const elemCard = document.createElement('div');
  elemCard.classList.add("card");

  // <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
  const elemCardHeader = document.createElement('div');
  elemCardHeader.classList.add("card-header");
  elemCardHeader.setAttribute("data-toggle", "collapse");
  elemCardHeader.setAttribute("data-target", `#assignment-${idxAssignment}`);

  // content of the card header
  elemCardHeader.innerText = oAssignment.Patient_ID+" "+oAssignment.Care_Plan+" "+oAssignment.Patient_Name;

  // <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
  const elemCardBodyContainer = document.createElement('div');
  elemCardBodyContainer.id = `assignment-${idxAssignment}`;
  elemCardBodyContainer.classList.add("collapse");
  elemCardHeader.setAttribute("data-parent", `#care-plan-${idxCP}`);

  // <div class="card-body">
  const elemCardBody = document.createElement('div');
  elemCardBody.classList.add("card-body");

  // content of card body / assignment details
  elemCardBody.appendChild(getElemOpenAssignmentDetails(oAssignment));
  // elemCardBody.innerText = oAssignment.Post_Location;

  // Add everything to DOM
  elemCard.appendChild(elemCardHeader);
  elemCard.appendChild(elemCardBodyContainer);
  elemCardBodyContainer.appendChild(elemCardBody);

  return elemCard;
}

/* ==================================================
*  addOpenAssignments()
*
*  Loads passed container with open assignments with the format below.
*  Care Plans are added as titles and a subfunction builds a BS collapsing
*  list of cards to display the assignment details.
*
*   elemContainer (the passed param)
*     elemCurrCP (Care Plan is a BS container for collapsing cards)
*       card (BS card for an assignment in the Care Plan)
*         header (BS card-header for assignment)
*         details (BS collapsing element)
*           details for an assignment
*       card
*         ....
*     elemCurrCP
*       ..
*
*   <div id="list-open-assignments">
*     <div id="care-plan-1">
*       <div class="card">
*         <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
*         <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
*           <div class="card-body">
*
*  @param elemContainer (HTML Element) the element to add everything in to
* =================================================== */
function addOpenAssignments(elemContainer) {
  let sCurrCP = "";
  let elemCurrCP = null;
  let idxCP = -1; // counter for CPs to use in setting elem ID's
  let idxAssignment = 0; // counter for CPs to use in setting elem ID's below

  // for each assignment
  for (const oAssignment of gaOpenAssignments) {

    // is assignment a new care plan?
    if (oAssignment.Care_Plan !== sCurrCP) {
      // If we've been building a CP, add to container.
      if (elemCurrCP) {
        elemContainer.appendChild(elemCurrCP);
      }
      // add the new care plan title to elemContainer
      const elemHeading = document.createElement('H4');
      elemHeading.classList.add("ml-4");
      elemHeading.classList.add("mt-4");
      elemHeading.innerText = oAssignment.Care_Plan;
      elemContainer.appendChild(elemHeading);

      // create new CP container for assignments
      sCurrCP = oAssignment.Care_Plan;
      elemCurrCP = document.createElement('div');
      elemCurrCP.id = `care-plan-${++idxCP}`;
    }

    // add the assignment to the CP
    elemCurrCP.appendChild(getElemOpenAssignment(idxCP, oAssignment, idxAssignment++));
  }

  // add final CP to DOM
  elemContainer.appendChild(elemCurrCP);
}

/* ==================================================
*  onMenuOpenAssignments()
*
*  Menu selection
* =================================================== */
function onMenuOpenAssignments() {
  changeMenuAndContentArea("nav--open-assignments", gelemContentOpenAssignments);

  // convenience copy of the span to place list of open assignments
  const elemOpenAssignments = document.getElementById("list-open-assignments");
  elemOpenAssignments.innerHTML = ""; // clear it from last rendering

  // show loading spinner
  document.querySelector("#content--open-assignments .spinner").removeAttribute("hidden");

  // make AJAX call
  axios.get(BASE_URL)
    .then((oResponse) => {
      console.log("-- response successful --");

      // Parse the returned JSON into an array of assignments
      gaOpenAssignments = JSON.parse(oResponse.data, dateReviver);

      // Sort assignments for display
      gaOpenAssignments.sort(sortAssignments);

      // Load DOM with open assignments
      addOpenAssignments(elemOpenAssignments);

      // Hide loading spinner
      document.querySelector("#content--open-assignments .spinner").setAttribute("hidden", true);
    }) // then
    .catch((error) => {
      // display AJAX error msg
      console.log("-- error --");
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      elemOpenAssignments.innerText = sErrorMsg;
    }); // catch
}

/* ==================================================
*  onMenuMyAssignments()
*
*  Menu selecion
* =================================================== */
function onMenuMyAssignments() {
  changeMenuAndContentArea("nav--my-assignments", gelemContentMyAssignments);
}

/* ==================================================
*  onMenuMyStats()
*
*  Menu selection
* =================================================== */
function onMenuMyStats() {
  changeMenuAndContentArea("nav--my-stats", gelemContentMyStats);
}

/* ==================================================
*  DOM loaded, setup and set button event listener
* =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded");

  gelemContentHome = document.getElementById("content--home");
  gelemContentOpenAssignments = document.getElementById("content--open-assignments");
  gelemContentMyAssignments = document.getElementById("content--my-assignments");
  gelemContentMyStats = document.getElementById("content--my-stats");

  document.getElementById("nav--home").onclick = onMenuHome;
  document.getElementById("nav--open-assignments").onclick = onMenuOpenAssignments;
  document.getElementById("nav--my-assignments").onclick = onMenuMyAssignments;
  document.getElementById("nav--my-stats").onclick = onMenuMyStats;

  // onMenuHome();
  onMenuOpenAssignments();
  // onMenuMyStats();
});
