/*
   My Assignments page
*/

const URL_ACTION_VOLUNTEER_ASSIGNMENTS = "getVolunteerAssignments";

/* ==================================================
*  getElemVolAssignmentDetails()
*
*  Helper to create the DOM element for an assignment's details
* =================================================== */
function getElemVolAssignmentDetails(idxAssignment, oAssignment) {
  const elemTable = document.createElement('table');

  // ADD DATA ROWS
  elemTable.appendChild(makeRow("Stats", `${oAssignment.Age}yo ${oAssignment.Gender} with ${oAssignment.Diagnosis}`));
  elemTable.appendChild(makeRow("Request", `${oAssignment.Care_Plan}: ${addHtmlBr(unredactNames(oAssignment.Request))}`));
  elemTable.appendChild(makeRow("Location", `${oAssignment.Home_or_Facility}`));
  elemTable.appendChild(makeRow("Address", `${addHtmlBr(oAssignment.Address)}`));
  elemTable.appendChild(makeRow("Phone", `${oAssignment.Phone}`));
  elemTable.appendChild(makeRow("Contacts", `${addHtmlBr(oAssignment.Family_Friends)}`));
  elemTable.appendChild(makeRow("SW", `${oAssignment.SW}`));
  elemTable.appendChild(makeRow("RN", `${oAssignment.RN}`));
  elemTable.appendChild(makeRow("Direction", `${oAssignment.Directive}`));
  elemTable.appendChild(makeRow("Religion", `${oAssignment.Religion}`));
  elemTable.appendChild(makeRow("Military", `${oAssignment.Military}`));
  elemTable.appendChild(makeRow("Story", `${addHtmlBr(unredactNames(oAssignment.Psychosocial))}`));

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
  console.log("#####################");

  // make AJAX call
  cancelPendingAjaxLoad(); // looks at goCancelAjax
  goCancelAjax = axios.CancelToken.source();
  axios.get(url, { cancelToken: goCancelAjax.token })
    .then((oResponse) => {
      console.log("-- ajax call responded --");
      // Parse the returned JSON into an array of assignments
      // The data from API was double JSON.stringified() since axios does one
      // round of JSON.parse() for us.  We want to JSON.parse() ourselves to be
      // able to apply the reviver.
      const aVolunteerAssignments = JSON.parse(oResponse.data, dateReviver);

      // if volunteer has assignments to display, display them
      if (aVolunteerAssignments.length) {
        // add a title
        const elemHeading = document.createElement('H4');
        elemHeading.classList.add("ml-2");
        elemHeading.classList.add("mt-3");
        elemHeading.innerText = "My assignments";
        elemContainer.appendChild(elemHeading);

        elemContainer.appendChild(getVolunteerAssignments(aVolunteerAssignments));
      // no assigments for volunteer, unhide message to that effect
      } else {
        document.getElementById("volunteer-has-no-assignments").removeAttribute("hidden");
      }

      // Hide loading spinner
      document.querySelector("#content--volunteer-assignments .spinner").setAttribute("hidden", true);

    }) // then
    .catch((error) => {
      // if not due to a call to goCancelAjax.cancel()
      if (error.toString()!=="Cancel") {
        // display AJAX error msg (can also be a throw from the .then section)
        console.log("-- AJAX error --");
        console.log(error);
        console.log(`${error}`);
        const sErrorMsg = JSON.stringify(error);
        console.log(sErrorMsg);
        elemContainer.innerText = `An error occured: ${sErrorMsg}`;
        debugger;
      }
    }); // catch
}
