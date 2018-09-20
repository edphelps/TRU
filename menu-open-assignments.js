/*
   Open assignments page
*/

const URL_ACTION_GET_OPEN_ASSIGNMENTS = "getOpenAssignments";
const LOCAL_STORAGE_DATE_VIEWED_OPEN = "last-viewed-open";
const URL_ACTION_TAKE_ASSIGNMENT = "takeAssignment";

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
    }) // then
    .catch((error) => {
      // display AJAX error msg (can also be a throw from the .then section)
      console.log("-- error --");
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      console.log(sErrorMsg);
      // elemContainer.innerText = sErrorMsg;
    }); // catch
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
  elemTakeItBtn.onclick = (e) => { onclickTakeIt(e, idxAssignment); };

  elemTakeItRow.appendChild(document.createElement("th")); // blank 1st col
  elemTakeItCol.appendChild(elemTakeItBtn);
  elemTakeItRow.appendChild(elemTakeItCol);
  elemTable.appendChild(elemTakeItRow);

  return elemTable;
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

  /* ==================================================
  *  sortAssignments()
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
    localStorage.setItem(LOCAL_STORAGE_DATE_VIEWED_OPEN, new Date());
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

  const url = `${BASE_URL}?action=${URL_ACTION_GET_OPEN_ASSIGNMENTS}`;
  console.log(`URL: ${url}`);

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
