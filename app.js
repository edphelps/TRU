/* Table of contents

   Globals

   General Utils

   Menu Handlers -- contain AJAX calls
*/

/* *****************************************************************************
********************************************************************************
*  Globals
********************************************************************************
***************************************************************************** */

const BASE_URL = "https://script.google.com/macros/s/AKfycbyzJBFIC8PFykacFyF1koj1hYH_oGLYy1t-7sUrIy79Xv9AGAA/exec";
const URL_ACTION_GET_OPEN_ASSIGNMENTS = "getOpenAssignments";
const URL_ACTION_TAKE_ASSIGNMENT = "takeAssignment";
const URL_ACTION_VOLUNTEER_ASSIGNMENTS = "getVolunteerAssignments";

const LOCAL_STORAGE_LOGIN_NAME = "login-name";
const LOCAL_STORAGE_LOGIN_PSWD = "login-pswd";
const LOCAL_STORAGE_DATE_VIEWED_OPEN = "last-viewed-open";

const MILLISEC_IN_A_DAY = 1000 * 60 * 60 * 24;

// convenience references to content elements
let gelemContentLogin = null;
let gelemContentHome = null;
let gelemContentOpenAssignments = null;
let gelemContentVolunteerAssignments = null;
let gelemContentVolunteerStats = null;

// Array of open assignments loaded by ajax when displaying the open assoignments page
let gaOpenAssignments = [];

// user validation
const gPASSWORD = "2212";
let gUserValidated = false;


/* *****************************************************************************
********************************************************************************
*  General Utils
********************************************************************************
***************************************************************************** */

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
  // Care_Plans are === so sort a-z by timestamp
  if (oAssign2.Timestamp < oAssign1.Timestamp)
    return -1;
  if (oAssign1.Timestamp < oAssign2.Timestamp)
    return 1;
  return 0;
}

/* ==================================================
*  redactNames()
*
*  Redact names in a string.  Names are flagged with "~"
*   ex: "His name is ~Steve" -> "His name is ----"
*
*  @param sText (string) string that includes ~'s to make words to redact
*  @return new string that's been redacted
* =================================================== */
function redactNames(sText) {
  return sText.replace(new RegExp(/(~\w+)/gi), "#name#"); // replace "~" and following word with "----"
}

/* ==================================================
*  addHtmlBr()
*
*  Replace newlines with <br> so they display correctly in HTML
*
*  @param sText (string) string that includes \n newlines
*  @return new string that's replaced \n with <br>
* =================================================== */
function addHtmlBr(sText) {
  return sText.replace(/\n/g, '<br>');
  // return sText.replace("\n", '<br><br>');  // ERROR, only replacing the first one
}


/* *****************************************************************************
********************************************************************************
*  MENU HANDLERS
********************************************************************************
***************************************************************************** */

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

function makeRow(sTh, sTd) {
  const elemRow = document.createElement("tr");
  const elemColTh = document.createElement("th");
  const elemColTd = document.createElement("td");

  elemColTh.innerText = sTh;
  elemColTd.innerHTML = sTd; // need this for elements that use addHtmlBr()

  elemRow.appendChild(elemColTh);
  elemRow.appendChild(elemColTd);

  return elemRow;
}

/* ==================================================
*  onclickTakeIt()
*
*  Handler for the "I'll take it!" buttons below each open assignment
*
*  @param e (event)
*  @param idxAssignment (int) index into gaOpenAssignments
* =================================================== */
function onclickTakeIt(e, idxAssignment) {
  console.log(`take: ${idxAssignment}`);

  // change button: disable, add wait message
  e.target.setAttribute("disabled", true);
  e.target.classList.remove("btn-success");
  e.target.classList.add("btn-secondary");
  e.target.innerText = "Thank-you, please wait a moment....";

  // build URL
  const oAssignment = gaOpenAssignments[idxAssignment];
  let url = `${BASE_URL}?action=${URL_ACTION_TAKE_ASSIGNMENT}`;
  url += `&sVolunteer=${document.getElementById("login-name").value}`;
  url += `&sPatientID=${oAssignment.Patient_ID}`;
  url += `&sCarePlan=${oAssignment.Care_Plan}`;
  url += `&sTimestamp=${oAssignment.Timestamp.toISOString()}`;
  console.log(`** URL: ${url}`);

  // make AJAX call
  axios.get(url)
    .then((oResponse) => {
      console.log("-- ajax call responded --");
      const oMessage = JSON.parse(oResponse.data);
      // Parse the returned JSON into an array of assignments
      // const sResponse = JSON.parse(oResponse.data);
      console.log(`response from AJAX call: ${oMessage}`);

      if (oMessage.message === "success") {
        onMenuVolunteerAssignments();
      } else {
        e.target.classList.remove("btn-secondary");
        e.target.classList.add("btn-danger");
        e.target.innerText = "Assignment unavailable ";
        document.getElementById("assignment-failed-error-message").innerText = oMessage.message;
        $('#modal-take-assigment-failed').modal();
      }
      // // Parse the returned JSON into an array of assignments
      // const sResponse = JSON.parse(oResponse.data);
      // console.log("response from AJAX call: "+sResponse);
      //
      // if (sResponse.message === "success") {
      //   onMenuMyAssignments();
      // } else {
      //   e.target.classList.remove("btn-secondary");
      //   e.target.classList.add("btn-danger");
      //   e.target.innerText = "Assignment unavailable ";
      //   document.getElementById("assignment-failed-error-message").innerText = sResponse.message;
      //   $('#modal-take-assigment-failed').modal();
      // }
    }) // then
    .catch((error) => {
      // display AJAX error msg (can also be a throw from the .then section)
      console.log("-- error --");
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      console.log(sErrorMsg);
      // elemContainer.innerText = sErrorMsg;
    }); // catch

  // setTimeout(() => {
  //
  //   const oAssignment = gaOpenAssignments[idxAssignment];
  //
  //
  //   url = BASE_URL + "?action=" + URL_ACTION_TAKE_ASSIGNMENT;
  //   url += "&sVolunteer="+document.getElementById("login-name").value;
  //   url += "&sPatientID="+oAssignment.Patient_ID;
  //   url += "&sCarePlan="+oAssignment.Care_Plan;
  //   url += "&sTimestamp="+oAssignment.Timestamp.toISOString();
  //   console.log("** URL: "+url);
  //   const success = Math.random() < 0.5;
  //   if (success) {
  //     onMenuMyAssignments();
  //   } else {
  //     e.target.classList.remove("btn-secondary");
  //     e.target.classList.add("btn-danger");
  //     e.target.innerText = "Assignment unavailable ";
  //     document.getElementById("assignment-failed-error-message").innerText = "Random number generator";
  //     $('#modal-take-assigment-failed').modal();
  //   }
  // }, 500);
}

/* ==================================================
*  getElemVolAssignmentDetails()
*
*  Helper to create the DOM element for an assignment's details
* =================================================== */
function getElemVolAssignmentDetails(idxAssignment, oAssignment) {
  const elemTable = document.createElement('table');

  // ADD DATA ROWS
  elemTable.appendChild(makeRow("Stats", `${oAssignment.Age}yo ${oAssignment.Gender} with ${oAssignment.Diagnosis}`));
  elemTable.appendChild(makeRow("Request", `${oAssignment.Care_Plan}: ${addHtmlBr(oAssignment.Request)}`));
  elemTable.appendChild(makeRow("Location", `${oAssignment.Home_or_Facility}`));
  elemTable.appendChild(makeRow("Address", `${addHtmlBr(oAssignment.Address)}`));
  elemTable.appendChild(makeRow("Phone", `${oAssignment.Phone}`));
  elemTable.appendChild(makeRow("Contacts", `${addHtmlBr(oAssignment.Family_Friends)}`));
  elemTable.appendChild(makeRow("SW", `${oAssignment.SW}`));
  elemTable.appendChild(makeRow("RN", `${oAssignment.RN}`));
  elemTable.appendChild(makeRow("Direction", `${oAssignment.Directive}`));
  elemTable.appendChild(makeRow("Religion", `${oAssignment.Religion}`));
  elemTable.appendChild(makeRow("Military", `${oAssignment.Military}`));
  elemTable.appendChild(makeRow("Story", `${addHtmlBr(oAssignment.Psychosocial)}`));

  return elemTable;
}
/* ==================================================
*  getElemOpenAssignmentDetails()
*
*  Helper to create the DOM element for an assignment's details
* =================================================== */
function getElemOpenAssignmentDetails(idxAssignment, oAssignment) {
  const elemTable = document.createElement('table');

  // ADD DATA ROWS
  elemTable.appendChild(makeRow("Request", `${oAssignment.Care_Plan}: ${addHtmlBr(redactNames(oAssignment.Request))}`));
  elemTable.appendChild(makeRow("Stats", `${oAssignment.Age}yo ${oAssignment.Gender} with ${oAssignment.Diagnosis}`));
  elemTable.appendChild(makeRow("Story", `${addHtmlBr(redactNames(oAssignment.Psychosocial))}`));

  // ADD TAKE IT BUTTON ROW
  const elemTakeItRow = document.createElement("tr");
  const elemTakeItCol = document.createElement("td");
  elemTakeItCol.classList.add("text-right");
  const elemTakeItBtn = document.createElement('button');
  elemTakeItBtn.classList.add("btn");
  elemTakeItBtn.classList.add("btn-success");
  elemTakeItBtn.innerText = "Yes, I'll take it!";
  elemTakeItBtn.onclick = (e) => { onclickTakeIt(e, idxAssignment); }

  elemTakeItRow.appendChild(document.createElement("th")); // blank 1st col
  elemTakeItCol.appendChild(elemTakeItBtn);
  elemTakeItRow.appendChild(elemTakeItCol);
  elemTable.appendChild(elemTakeItRow);

  return elemTable;
}

/* ==================================================
*  function getElemVolAssignment()
*
*  Builds and returns the card for a volunteer's assignment
*
*  @param oAssignment (object) the assignment to add
*  @param idxAssignment (int)  index of the current care plan, used to create ID
*  @return card element for the assignment
* =================================================== */
function getElemVolAssignment(oAssignment, idxAssignment) {

  // CARD
  // ----------------
  // <div class="card">
  const elemCard = document.createElement('div');
  elemCard.classList.add("card");

  // CARD HEADER
  // ----------------
  // <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
  const elemCardHeader = document.createElement('div');
  elemCardHeader.classList.add("card-header");
  elemCardHeader.classList.add("collapsed"); // required to get CSS coloring to work
  elemCardHeader.classList.add("text-center");
  elemCardHeader.setAttribute("data-toggle", "collapse");
  elemCardHeader.setAttribute("data-target", `#assignment-${idxAssignment}`);

  elemCardHeader.innerHTML = `${oAssignment.Patient_Name} (${oAssignment.Care_Plan})`;

  // CARD BODY CONTAINER
  // ----------------
  // <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
  const elemCardBodyContainer = document.createElement('div');
  elemCardBodyContainer.id = `assignment-${idxAssignment}`;
  elemCardBodyContainer.classList.add("collapse");
  elemCardHeader.setAttribute("data-parent", `#accordion`);

  // CARD BODY
  // ----------------
  // <div class="card-body">
  const elemCardBody = document.createElement('div');
  elemCardBody.classList.add("card-body");

  // content of card body / assignment details
  // FIX: this isn't known
  elemCardBody.appendChild(getElemVolAssignmentDetails(idxAssignment, oAssignment));
  // elemCardBody.innerText = oAssignment.Post_Location;

  // ADD EVERYTHING TO elemCard
  // ----------------
  elemCard.appendChild(elemCardHeader);
  elemCard.appendChild(elemCardBodyContainer);
  elemCardBodyContainer.appendChild(elemCardBody);

  return elemCard;
}

/* ==================================================
*  function getElemOpenAssignment()
*
*  Builds and returns the card for an assignment
*
*  @param oAssignment (object) the assignment to add
*  @param idxAssignment (int)  index of the current care plan, used to create ID
*  @param dtLastViewed (Date) date user last viewed open assignments, used to set 'New' pill
*  @return card element for the assignment
* =================================================== */
function getElemOpenAssignment(oAssignment, idxAssignment, dtLastViewed) {

  // CARD
  // ----------------
  // <div class="card">
  const elemCard = document.createElement('div');
  elemCard.classList.add("card");

  // CARD HEADER
  // ----------------
  // <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
  const elemCardHeader = document.createElement('div');
  elemCardHeader.classList.add("card-header");
  elemCardHeader.classList.add("collapsed"); // required to get CSS coloring to work
  elemCardHeader.classList.add("text-center");
  elemCardHeader.setAttribute("data-toggle", "collapse");
  elemCardHeader.setAttribute("data-target", `#assignment-${idxAssignment}`);

  elemCardHeader.innerHTML = `${oAssignment.Post_Location}, ${oAssignment.Home_or_Facility} &nbsp;&nbsp;`;
  // how many days ago was it posted?
  // const elemSpan = document.createElement('span');
  // elemSpan.classList.add("text-muted");
  // elemSpan.classList.add("small");
  const iDaysAgo = Math.floor((new Date() - oAssignment.Timestamp) / MILLISEC_IN_A_DAY);

  // orange pill, 7-14 days ago
  if (7 < iDaysAgo && iDaysAgo <= 14) {
    const elemBadge = document.createElement("span");
    elemBadge.innerText = "> 1wk";
    elemBadge.classList.add("badge");
    elemBadge.classList.add("badge-pill");
    elemBadge.classList.add("badge-warning");
    elemCardHeader.appendChild(elemBadge);
  }
  // red pill, 14+ days ago
  if (14 < iDaysAgo) {
    const elemBadge = document.createElement("span");
    elemBadge.innerText = "> 2wks";
    elemBadge.classList.add("badge");
    elemBadge.classList.add("badge-pill");
    elemBadge.classList.add("badge-danger");
    elemCardHeader.appendChild(elemBadge);
  }
  // 'new' pill if volunteer hasn't visited site since assignment added
  if (dtLastViewed < oAssignment.Timestamp) {
    const elemSpacer = document.createElement("span");
    elemSpacer.innerText = " ";
    elemCardHeader.appendChild(elemSpacer);
    const elemBadge = document.createElement("span");
    elemBadge.innerText = "New";
    elemBadge.classList.add("badge");
    elemBadge.classList.add("badge-pill");
    elemBadge.classList.add("badge-primary");
    elemCardHeader.appendChild(elemBadge);
  }

  // CARD BODY CONTAINER
  // ----------------
  // <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
  const elemCardBodyContainer = document.createElement('div');
  elemCardBodyContainer.id = `assignment-${idxAssignment}`;
  elemCardBodyContainer.classList.add("collapse");
  elemCardHeader.setAttribute("data-parent", `#accordion`);

  // CARD BODY
  // ----------------
  // <div class="card-body">
  const elemCardBody = document.createElement('div');
  elemCardBody.classList.add("card-body");

  // content of card body / assignment details
  elemCardBody.appendChild(getElemOpenAssignmentDetails(idxAssignment, oAssignment));
  // elemCardBody.innerText = oAssignment.Post_Location;

  // ADD EVERYTHING TO elemCard
  // ----------------
  elemCard.appendChild(elemCardHeader);
  elemCard.appendChild(elemCardBodyContainer);
  elemCardBodyContainer.appendChild(elemCardBody);

  return elemCard;
}

/* ==================================================
*  getVolunteerAssignments()
*
*  Loads passed container with assignments with the format below.
*  Builds a BS collapsing list of cards to display  assignment details.
*
*   elemContainer (calling procedures has this)
*     elemAccordion (BS container for collapsing cards)
*       card (BS card for an assignment)
*         header (BS card-header for assignment)
*         details (BS collapsing element)
*           details for an assignment
*       card
*         ....
*
*   <div id="list-open-assignments">
*     <div id="Accordion">
*       <h4></h4>
*       <div class="card">
*         <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
*         <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
*           <div class="card-body">
*
*  @param aVolunteerAssignments ([] of oAssignment) Array of volunteers assignments
*  @return elemAccordion containing the care plans, assigments, and assigment details
* =================================================== */
function getVolunteerAssignments(aVolunteerAssignments) {

  let idxAssignment = 0; // counter to setting card header and body ID references

  // Sort assignments for display (by CP then date)
  aVolunteerAssignments.sort((oAssign1, oAssign2) => {
    if (oAssign1.Patient_Name < oAssign2.Patient_Name)
      return -1;
    if (oAssign2.Patient_Name < oAssign1.Patient_Name)
      return 1;
    return 0;
  });

  // create the container for all headings and to manage accordion elements
  const elemAccordion = document.createElement('div');
  elemAccordion.id = "accordion";

  // for each assignment
  for (const oAssignment of aVolunteerAssignments) {

    // add assignment to the Accordion element
    elemAccordion.appendChild(getElemVolAssignment(oAssignment, idxAssignment++));
  }
  return elemAccordion;
}

/* ==================================================
*  getOpenAssignments()
*
*  Loads passed container with open assignments with the format below.
*  Care Plans are added as titles and a subfunction builds a BS collapsing
*  list of cards to display the assignment details.
*
*   elemContainer (calling procedure has this)
*     elemAccordion (BS container for collapsing cards)
*       CP Heading
*       card (BS card for an assignment in the Care Plan)
*         header (BS card-header for assignment)
*         details (BS collapsing element)
*           details for an assignment
*       card
*         ....
*
*   <div id="list-open-assignments">
*     <div id="Accordion">
*       <h4></h4>
*       <div class="card">
*         <div class="card-header" data-toggle="collapse" data-target="#assignment-1">
*         <div id="assignment-1" class="collapse" data-parent="#care-plan-1">
*           <div class="card-body">
*
*  @return elemAccordion containing the care plans, assigments, and assigment details
* =================================================== */
function getOpenAssignments() {
// function addOpenAssignments(elemContainer) {

  /* ************************************************
  *  getDtLastViewed()
  *  helper to get dtLastViewed from local storage
  *  @return date ast viewed or date from 1yr ago
  *  ************************************************ */
  function getDtLastViewed() {
    // get date last viewed or set to a year ago
    let dtLastViewed = localStorage.getItem(LOCAL_STORAGE_DATE_VIEWED_OPEN);
    if (!dtLastViewed) {
      dtLastViewed = new Date(new Date() - MILLISEC_IN_A_DAY * 365);
    } else {
      dtLastViewed = new Date(dtLastViewed); // convert string to
    }
    dtLastViewed = new Date(dtLastViewed - MILLISEC_IN_A_DAY * 4); // todo: remove, for testing only
    console.log(`Last viewed: ${dtLastViewed}`);
    return dtLastViewed;
  }
  /* ************************************************
  *  updateDtLastViewed()
  *  helper to update dtLatViewed in local storage
  *  ************************************************ */
  function updateDtLastViewed() {
    localStorage.setItem(LOCAL_STORAGE_DATE_VIEWED_OPEN,new Date());
  }

  let sCurrCP = "";
  let idxAssignment = 0; // counter to setting card header and body ID references

  const dtLastViewed = getDtLastViewed();
  updateDtLastViewed(); // will update it to now

  // Sort assignments for display (by CP then date)
  gaOpenAssignments.sort(sortAssignments);

  // create the container for all headings and to manage accordion elements
  const elemAccordion = document.createElement('div');
  elemAccordion.id = "accordion";

  // for each assignment
  for (const oAssignment of gaOpenAssignments) {

    // is assignment a new care plan?
    if (oAssignment.Care_Plan !== sCurrCP) {

      // add the new care plan title to elemAccordion
      const elemHeading = document.createElement('H4');
      elemHeading.classList.add("ml-2");
      elemHeading.classList.add("mt-3");
      elemHeading.innerText = oAssignment.Care_Plan;
      elemAccordion.appendChild(elemHeading);

      // reset current care plan
      sCurrCP = oAssignment.Care_Plan;
    }

    // add assignment to the Accordion element
    elemAccordion.appendChild(getElemOpenAssignment(oAssignment, idxAssignment++, dtLastViewed));
  }
  return elemAccordion;
  // elemContainer.appendChild(elemAccordion); // todo: return the elemAccordion and move this step to caller
}

/* *****************************************************************************
********************************************************************************
*  MENU HANDLERS
********************************************************************************
***************************************************************************** */

/* ==================================================
*  changeMenuAndContentArea()
*
*  Menu choice onClick event handers call this function to
*  set the correct menu choice active and display the
*  correct content area.  The onClick handler must still
*  dynamically fill the content area.  All other content
*  areas will be hidden.
*
*  Note: checks gUserValidated and redirects back to login
*        content if user not validated
*
*  @param sMenuBtnID (string) ID for the menu button so it can be selected
*  @param elemConten (html element) the content area to unhide.
* =================================================== */
function changeMenuAndContentArea(sMenuBtnID, elemContent) {

  // hide all content sections
  const aElemContent = document.querySelectorAll(".content");
  for (const elem of aElemContent) {
    elem.setAttribute("hidden", true);
  }

  // remove the dynamic AJAX content from each 'page', otherwise
  // the generated element IDs start to conflict in the accordion lists
  const aElemAutoClear = document.querySelectorAll(".auto-clear");
  for (const elem of aElemAutoClear) {
    elem.innerHTML = "";
  }

  // set all menu buttons inactive
  const aElemNavLink = document.querySelectorAll(".nav-link");
  for (const elemNavLink of aElemNavLink) {
    elemNavLink.classList.remove("active");
  }

  // set current menu choice active
  document.getElementById(sMenuBtnID).classList.add("active");

  // show menu's content area
  if (gUserValidated)
    elemContent.removeAttribute("hidden");
  else
    gelemContentLogin.removeAttribute("hidden");
}

/* ==================================================
*  onMenuLogin()
*
*  Driven by an unvalidated user, covers all other menu choices
* =================================================== */
function onMenuLogin() {
  // confusing: sets the nav to "Home" but the content to "gelemContentLogin"
  changeMenuAndContentArea("nav--home", gelemContentLogin);
}

/* ==================================================
*  onMenuHome()
*
*  Menu selection
* =================================================== */
function onMenuHome() {
  changeMenuAndContentArea("nav--home", gelemContentHome);

  // const myModal = document.getElementById("exampleModal");
  // myModal.modal();
  //$('#exampleModal').modal();
}

/* ==================================================
*  onMenuOpenAssignments()
*
*  Menu selection
* =================================================== */
function onMenuOpenAssignments() {

  // move to this menu choice
  changeMenuAndContentArea("nav--open-assignments", gelemContentOpenAssignments);

  // convenience copy of the span to place list of open assignments
  const elemContainer = document.getElementById("list-open-assignments");
  elemContainer.innerText = ""; // clear it from last rendering

  // Unhide loading spinner
  document.querySelector("#content--open-assignments .spinner").removeAttribute("hidden");

  const url = BASE_URL + "?action=" + URL_ACTION_GET_OPEN_ASSIGNMENTS;
  console.log("URL: " + url);

  // make AJAX call
  axios.get(url)
    .then((oResponse) => {
      console.log("-- response successful --");
      // Parse the returned JSON into an array of assignments
      // The data from API was double JSON.stringified() since axios does one
      // round of JSON.parse() for us.  We want to JSON.parse() ourselves to be
      // able to apply the reviver.
      gaOpenAssignments = JSON.parse(oResponse.data, dateReviver);
      if (!gaOpenAssignments.message) {

        // render the open assignments content area
        // renderOpenAssignments(elemOpenAssignments);
        // addOpenAssignments(elemContainer);
        elemContainer.appendChild(getOpenAssignments());
      } else {
        console.log("-- error --");
        console.log(gaOpenAssignments.message);
      }

      // Hide loading spinner
      document.querySelector("#content--open-assignments .spinner").setAttribute("hidden", true);

    }) // then
    .catch((error) => {
      // display AJAX error msg (can also be a throw from the .then section)
      console.log("-- error --");
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      console.log(sErrorMsg);
      elemContainer.innerText = sErrorMsg;
      debugger;
    }); // catch
}

/* ==================================================
*  onMenuVolunteerAssignments()
*
*  Menu selecion
* =================================================== */
function onMenuVolunteerAssignments() {
  // move to this menu choice
  changeMenuAndContentArea("nav--volunteer-assignments", gelemContentVolunteerAssignments);

  // convenience copy of the span to place list of open assignments
  const elemContainer = document.getElementById("list-volunteer-assignments");
  elemContainer.innerText = ""; // clear it from last rendering

  // Unhide loading spinner
  document.querySelector("#content--volunteer-assignments .spinner").removeAttribute("hidden");

  // hide the message that volunteer has no Assignments
  document.getElementById("volunteer-has-no-assignments").setAttribute("hidden", true);

  let url = `${BASE_URL}?action=${URL_ACTION_VOLUNTEER_ASSIGNMENTS}`;
  url += `&sVolunteer=${document.getElementById("login-name").value}`;
  console.log(`URL: ${url}`);
  console.log("~~~~~~~~~~~~~~~~~~~~~");
  // make AJAX call
  axios.get(url)
    .then((oResponse) => {
      console.log("-- ajax call responded --");
      // Parse the returned JSON into an array of assignments
      // The data from API was double JSON.stringified() since axios does one
      // round of JSON.parse() for us.  We want to JSON.parse() ourselves to be
      // able to apply the reviver.
      const aVolunteerAssignments = JSON.parse(oResponse.data, dateReviver);

      // if volunteer has assignments to display, display them
      if (aVolunteerAssignments.length) {
        // render the volunteer assignments content area
        // renderOpenAssignments(elemOpenAssignments);
        // addOpenAssignments(elemContainer);
        elemContainer.appendChild(getVolunteerAssignments(aVolunteerAssignments));
      // no assigments for volunteer, unhide message to that effect
      } else {
        document.getElementById("volunteer-has-no-assignments").removeAttribute("hidden");
      }

      // Hide loading spinner
      document.querySelector("#content--volunteer-assignments .spinner").setAttribute("hidden", true);

    }) // then
    .catch((error) => {
      // display AJAX error msg (can also be a throw from the .then section)
      console.log("-- error --");
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      console.log(sErrorMsg);
      elemContainer.innerText = sErrorMsg;
      debugger;
    }); // catch
}

/* ==================================================
*  onMenuVolunteerStats()
*
*  Menu selection
* =================================================== */
function onMenuVolunteerStats() {
  changeMenuAndContentArea("nav--volunteer-stats", gelemContentVolunteerStats);
}


/* *****************************************************************************
********************************************************************************
*  DOM AND INITIAL SETUP
********************************************************************************
***************************************************************************** */


/* ==================================================
*  onkeyupLogin()
*
*  Does the following:
*    - Validates login as user types
*    - Saves the user's name and password to local storage so the user
*      will be validated when they next run the app
*    - changes the fieldset classes to change the background color: red or green
*    - sets gUserValidated
*    - while invalid, sets the content area to user not logged in content
*    - once validated, initiates the home menu choice
*
* =================================================== */
function onkeyupLogin() {
  const sName = document.getElementById("login-name").value.trim();
  const sPassword = document.getElementById("login-password").value.trim();
  const elemFieldsetLogin = document.getElementById("login-fieldset");

  // save values to local storage
  localStorage.setItem(LOCAL_STORAGE_LOGIN_NAME, sName);
  localStorage.setItem(LOCAL_STORAGE_LOGIN_PSWD, sPassword);

  // valid
  if (sName.length && sPassword === gPASSWORD) {
    elemFieldsetLogin.classList.add("login--valid");
    elemFieldsetLogin.classList.remove("login--invalid");
    gUserValidated = true;
    onMenuHome();

  // invalid
  } else {
    elemFieldsetLogin.classList.add("login--invalid");
    elemFieldsetLogin.classList.remove("login--valid");
    gUserValidated = false;
    onMenuLogin();
  }
}

/* ==================================================
*  initUserValidation()
*
*  Tasks:
*    - Load user name and pswd from local storage
*    - Put them in the logn and pswd fieldset
*    - delegate to onkeyupLogin() to validate
*
* =================================================== */
function initUserValidation() {

  const sName = localStorage.getItem(LOCAL_STORAGE_LOGIN_NAME) || "";
  const sPswd = localStorage.getItem(LOCAL_STORAGE_LOGIN_PSWD) || "";

  document.getElementById("login-name").value = sName;
  document.getElementById("login-password").value = sPswd;

  // validate user
  onkeyupLogin();
}

/* ==================================================
*  DOM loaded, setup and set button event listener
* =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded");

  // setup convenience variables
  gelemContentLogin = document.getElementById("content--login");
  gelemContentHome = document.getElementById("content--home");
  gelemContentOpenAssignments = document.getElementById("content--open-assignments");
  gelemContentVolunteerAssignments = document.getElementById("content--volunteer-assignments");
  gelemContentVolunteerStats = document.getElementById("content--volunteer-stats");

  // load last login name / password
  initUserValidation();

  // setup login field change validators
  document.getElementById("login-name").onkeyup = onkeyupLogin;
  document.getElementById("login-password").onkeyup = onkeyupLogin;

  // setup nav bar selection handlers
  document.getElementById("nav--home").onclick = onMenuHome;
  document.getElementById("nav--open-assignments").onclick = onMenuOpenAssignments;
  document.getElementById("nav--volunteer-assignments").onclick = onMenuVolunteerAssignments;
  document.getElementById("nav--volunteer-stats").onclick = onMenuVolunteerStats;

  onkeyupLogin(); // validate user and prevent other menu choice for unvalidated user

  // start with the home menu choice
  onMenuHome();
  // onMenuOpenAssignments();
  // onMenuMyStats();
});
