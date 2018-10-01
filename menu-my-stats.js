/*
   My stats page
*/

/* ==================================================
*  makeSpanningRow()
*
*  Create a row element that spans all columns in the table
*  Todo: move this into the one module that uses it, it's not a global util
*
*  @param sTd (string) the text
*  @param iColsToSpan (int) the number of columns to span
*  @return the row element
* =================================================== */
function makeSpanningRow(sTd, iColsToSpan) {
  // console.log("iColsToSpan: "+iColsToSpan);
  const elemRow = document.createElement("tr");

  // kludge: add a blank first column isn't what this function should do
  //         It's doing it for the one function calling this to show doc Notes
  //         Todo: Need to generalize this.
  let elemColTd = document.createElement("td");
  elemRow.appendChild(elemColTd);

  elemColTd = document.createElement("td");
  elemColTd.classList.add("text-left");
  elemColTd.innerHTML = sTd; // need this for elements that use addHtmlBr()
  elemColTd.setAttribute("colspan", (iColsToSpan - 1).toString());
  elemRow.appendChild(elemColTd);
  return elemRow;
}

/* *******************************************************
* getDurationHours(dtDuration)
* Helper to get hours from a duraction entered into the docs sheet.
*  @param (date) dtDuration - a date for a duration.  These start on
*                             12/30/1899 00:00:00 for some reason.
* return (float) - number of decimal hours represented by the duration
******************************************************* */
function getDurationHours(dtDuration) {
  return (dtDuration.getTime() / 1000 / 60 / 60) + 613649;
}
/* *******************************************************
*  getDateOnly()
*  Helper to get just the date for display
*  @param dt (Date) - a date
* return (string) - "01/06/1998"
******************************************************* */
function getDateOnly(_dt) {
  const dt = new Date(_dt); // this allows the dt param to be Date or String
  if (isNaN(dt))
    return "?";
  return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
  // return dt.getMonth()+1 + "/" + dt.getDate() + "/" + dt.getFullYear();
}

/* ==================================================
*  getVolunteerStatsDocs()
*
*  @param sVolunteerDocs (doc objects)
*  @return elem with all the stats setup for display
* =================================================== */
function getVolunteerStatsDocs(aDocs) {

  const elemContainer = document.createElement('div');

  // filter for service date in last 90 days
  const dt90DaysAgo = new Date(new Date() - 90 * MILLISEC_IN_A_DAY);
  const aDocs90Days = aDocs.filter(oDoc => dt90DaysAgo <= oDoc["Date of service"]);

  // sort assignments from last 90 days by reverse date of service (most recent first)
  aDocs90Days.sort((oDoc1, oDoc2) => {
    if (oDoc2["Date of service"] < oDoc1["Date of service"])
      return -1;
    if (oDoc1["Date of service"] < oDoc2["Date of service"])
      return 1;
    return 0;
  });


  // SHOW RECENT DOCS
  // =====================================

  // add a title
  const elemHeading = document.createElement('H4');
  elemHeading.classList.add("ml-2", "mt-4", "text-center");
  elemHeading.innerText = "My Recent Docs";
  elemContainer.appendChild(elemHeading);


  // create the table to display the assignments
  const elemTable = document.createElement('table');
  elemTable.classList.add("table", "table-sm", "table-striped");
  // thead
  const elemTHead = document.createElement('thead');
  elemTHead.classList.add("bg-info", "text-light");
  elemTHead.appendChild(makeRowHeading("Svc Dt", "Patient", "Care Plan", "Service", "Hrs", "Miles", "Calls"));
  elemTable.appendChild(elemTHead);
  // tbody
  const elemTBody = document.createElement('tbody');
  // rows
  for (const oDoc of aDocs90Days) {

    const fHours = getDurationHours(new Date(oDoc["Total time spent"]));
    // oTotals.fHours.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
    // oTotals.fMiles.toLocaleString(undefined, { maximumFractionDigits: 0 });
    // FIX

    let elemRow = makeRow(
      getDateOnly(oDoc["Date of service"]),
      oDoc["Patient name"],
      oDoc["Care Plan"],
      oDoc["What did you do?"],
      // getDurationHours(new Date(oDoc["Total time spent"])),
      fHours.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
      oDoc.Mileage,
      oDoc["Number of calls, if any"],
    );

    elemTBody.appendChild(elemRow);
    elemRow = makeSpanningRow(oDoc.Notes, 7);
    elemTBody.appendChild(elemRow);
  }
  elemTable.appendChild(elemTBody);
  // add to the container
  elemContainer.appendChild(elemTable);

  return elemContainer;
}

/* ==================================================
*  getVolunteerStatsAnnual()
*
*  Return container element with the annual totals in a table
*
*  @param sVolunteerDocs (doc objects)
*  @return elem with all the stats setup for display
* =================================================== */
function getVolunteerStatsAnnual(aDocs) {

  const elemContainer = document.createElement('div');

  // SHOW ANNUAL TOTALS
  // =====================================

  // calculate the annual totals
  const aYearlyTotals = []; // [0]=year 2007 totals, [1]=2008 year totals, etc
  for (const aDoc of aDocs) {
    const iYear = aDoc["Date of service"].getFullYear();
    let oYearlyTotals = aYearlyTotals[iYear - FIRST_YEAR_OF_DOCS];
    // if no object in this array position yet, create an object for the year
    // to store the total for the year
    if (!oYearlyTotals) {
      oYearlyTotals = {};
      oYearlyTotals.iYear = iYear;
      oYearlyTotals.iCalls = 0;
      oYearlyTotals.fHours = 0;
      oYearlyTotals.fMiles = 0;
      aYearlyTotals[iYear - FIRST_YEAR_OF_DOCS] = oYearlyTotals;
    }
    const duration = new Date(aDoc["Total time spent"]);
    const fCalcHours = getDurationHours(duration);
    oYearlyTotals.fHours += fCalcHours;
    oYearlyTotals.iCalls += Number(aDoc["Number of calls, if any"]); // must use Number() or first blank entry will turn iCalls into a string
    // use Number() or 1st blank  will turn fMiles into string
    oYearlyTotals.fMiles += Number(aDoc.Mileage);
  }

  // add a title
  const elemHeading = document.createElement('H4');
  elemHeading.classList.add("ml-2", "mt-3", "text-center");
  elemHeading.innerText = "My Annual Totals";
  elemContainer.appendChild(elemHeading);

  // create the table to display the totals
  const elemTable = document.createElement('table');
  elemTable.classList.add("table", "table-sm", "table-striped");
  // thead
  const elemTHead = document.createElement('thead');
  elemTHead.classList.add("bg-info", "text-light");
  elemTHead.appendChild(makeRowHeading("Year", "Calls", "Hours", "Miles"));
  elemTable.appendChild(elemTHead);
  // tbody
  const elemTBody = document.createElement('tbody');
  const oTotals = {
    iCalls: 0,
    fHours: 0,
    fMiles: 0,
  };
  for (const oYearStats of aYearlyTotals) {
    if (oYearStats) { // this is a sparse array, so skip missing years
      const elemRow = makeRow(
        oYearStats.iYear,
        oYearStats.iCalls,
        oYearStats.fHours.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
        oYearStats.fMiles.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      );
      elemTBody.appendChild(elemRow);
      oTotals.iCalls += oYearStats.iCalls;
      oTotals.fHours += oYearStats.fHours;
      oTotals.fMiles += oYearStats.fMiles;
    }
  }
  elemTable.appendChild(elemTBody);
  // tfoot
  const elemTFoot = document.createElement('tfoot');
  elemTFoot.classList.add("bg-info", "text-light");
  elemTFoot.appendChild(makeRowHeading("Totals",
    oTotals.iCalls,
    oTotals.fHours.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
    oTotals.fMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })));
  elemTable.appendChild(elemTFoot);
  // add table to the container
  elemContainer.appendChild(elemTable);

  return elemContainer;
}

/* ==================================================
*  onMenuVolunteerStats()
*
*  Menu selection
* =================================================== */
function onMenuVolunteerStats() {
  changeMenuAndContentArea("nav--volunteer-stats", gelemContentVolunteerStats);

  // convenience copy of the span to place list of open assignments
  const elemContainerAnnual = document.getElementById("list-volunteer-stats-annual");
  const elemContainerDocs = document.getElementById("list-volunteer-stats-docs");
  elemContainerAnnual.innerText = ""; // clear it from last rendering
  elemContainerDocs.innerText = ""; // clear it from last rendering

  // Unhide loading spinner
  document.querySelector("#content--volunteer-stats .spinner").removeAttribute("hidden");

  // hide the message that volunteer has no Assignments
  document.getElementById("volunteer-has-no-docs").setAttribute("hidden", true);

  let url = `${BASE_URL}?action=${URL_ACTION_VOLUNTEER_DOCS}`;
  url += `&sVolunteer=${document.getElementById("login-name").value}`;
  console.log(`URL: ${url}`);
  console.log("##################");
  // make AJAX call

  cancelPendingAjaxLoad(); // looks at goCancelAjax
  goCancelAjax = axios.CancelToken.source();
  axios.get(url, { cancelToken: goCancelAjax.token })
    .then((oResponse) => {
      goCancelAjax = null;
      console.log("-- ajax call responded --");
      // Parse the returned JSON into an array of assignments
      // The data from API was double JSON.stringified() since axios does one
      // round of JSON.parse() for us.  We want to JSON.parse() ourselves to be
      // able to apply the reviver.
      const aVolunteerDocs = JSON.parse(oResponse.data, dateReviver);

      // if volunteer has assignments to display, display them
      if (aVolunteerDocs.length) {
        // render the volunteer assignments content area
        // renderOpenAssignments(elemOpenAssignments);
        // addOpenAssignments(elemContainer);
        elemContainerAnnual.appendChild(getVolunteerStatsAnnual(aVolunteerDocs));
        elemContainerDocs.appendChild(getVolunteerStatsDocs(aVolunteerDocs));
      // no assigments for volunteer, unhide message to that effect
      } else {
        document.getElementById("volunteer-has-no-docs").removeAttribute("hidden");
      }

      // Hide loading spinner
      document.querySelector("#content--volunteer-stats .spinner").setAttribute("hidden", true);

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
