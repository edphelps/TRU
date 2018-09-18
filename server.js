GOOGLE SERVER CODE

var SPREADSHEET_ID     = '1drQkdhUFhlLRakCkQVfnHXOZokdfdiuprv224ZbQpjI';

// sheet names
var SHEET_OPEN   = "Open";
var SHEET_FILLED = "Filled";
var SHEET_EMAILS = "Emails";

var ROW_OF_COL_HEADINGS = 1;  // 0-based:  0=title row, 1=column headings 2=first row of actual data THIS IS TRUE FOR ALL SHEETS!!

// Sheet 0 and 1 with the assignemnts
var COL_HIDE         = "Hide";
var COL_PATIENT_ID   = "Patient_ID";
var COL_CARE_PLAN    = "Care_Plan";
var COL__ASSIGNED    = "_Assigned";
var COL_REQUEST      = "Request";
var COL_PATIENT_NAME = "Patient_Name";
var COL_TIMESTAMP    = "Timestamp";
var COL_TEAM         = "Team";

// Sheet 2 with the Team email addresses
var COL_EMAIL_TEAM  = "Team";
var COL_EMAIL_EMAIL = "Email";
var EMAIL_ADDRESS_NAME_DEVELOPER  = "Developer";  // must match entry in the spreadsheet's email sheet
var EMAIL_ADDRESS_NAME_VOLUNTEERS = "Volunteers"; // must match entry in the spreadsheet's email sheet
var gaTeamEmailAddresses;  // 2D array of Team names and associated email addresses loaded from spreadsheet

// show assignnmet details # days from their Timestamp (when they were listed)
var NUM_DAYS_TO_SHOW_ASSIGNMENTS = 90;

/*=========================================================
*  getVolunteerAssignments()
*
*  Get the volunteer's assignments from last NUM_DAYS_TO_SHOW_ASSIGNMENTS.
*  Ignores assignments with something in the HIDE column
*
*  @params
*       sVolunteer string volunteer's name
*
*  @return aOpenAssignments : [] of Assignmnet objects: {
*                          Patient_ID : "12345",   // this might translate itself to a Number
*                          Patient_Name : "John Doe",
*                          etc. based on data in the Board spreadsheet of open/filled assignments
*                       }
*             Will be an empty array if sVolunteer/sCode don't match at least
*             one assignment within last 90 days
*
===========================================================*/
function getVolunteerAssignments(sVolunteer) {
  Logger.log("getVolunteerAssignments("+sVolunteer+")");

  var aVolAssignments = [];
  var aColumnHeadings = [];

  sVolunteer = sVolunteer.trim().toLowerCase();

  // get assignments from "Open" sheet as 2D array
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rangeAllAssignments = spreadsheet.getSheetByName(SHEET_OPEN).getDataRange();
  var aAllAssignmentsOpen = rangeAllAssignments.getValues();

  // get assingments from "Filled" sheet as 2D array
  var rangeAllAssignmentsFilled = spreadsheet.getSheetByName(SHEET_FILLED).getDataRange();
  var aAllAssignments = rangeAllAssignmentsFilled.getValues();

  // merge data from Open and Filled sheets
  aAllAssignmentsOpen = aAllAssignmentsOpen.slice(2); // remove the title and column heading rows
  Array.prototype.push.apply(aAllAssignments,aAllAssignmentsOpen);  // adds the open assignments to the filled assignments

  // load aColumnHeadings
  for (var i=0;i<aAllAssignments[ROW_OF_COL_HEADINGS].length;i++) {
    aColumnHeadings[i]=aAllAssignments[ROW_OF_COL_HEADINGS][i];
  }

  var IDX_HIDE          = aColumnHeadings.indexOf(COL_HIDE);
  var IDX_PATIENT_ID    = aColumnHeadings.indexOf(COL_PATIENT_ID);
  var IDX__ASSIGNED     = aColumnHeadings.indexOf(COL__ASSIGNED);
  var IDX_TIMESTAMP     = aColumnHeadings.indexOf(COL_TIMESTAMP);

  // load aVolAssignments with the volunteer's assignments
  var idxVolAssignments = -1;
  var dateLimit = new Date(new Date().setDate(new Date().getDate() - NUM_DAYS_TO_SHOW_ASSIGNMENTS));  // quite the JS mouthful
  for (var i=ROW_OF_COL_HEADINGS+1;i<aAllAssignments.length;i++) {  // index starts at ROW_OF_COL_HEADINGS+1 to skip the row of columns heading
    // Logger.log("Reviewing patient_id: "+aAllAssignments[i][IDX_PATIENT_ID]);

    // if for this Volunteer and not too old and not hidden
    if (aAllAssignments[i][IDX__ASSIGNED].trim().toLowerCase()===sVolunteer
         && dateLimit <= aAllAssignments[i][IDX_TIMESTAMP]
         && aAllAssignments[i][IDX_HIDE].trim().length===0) {
      Logger.log("  matched for volunteer and date");

      // add the assignment object
      aVolAssignments[++idxVolAssignments] = {};  // add blank object to array
      for (var j=0;j<aColumnHeadings.length;j++)  // add properties based on the column headings
        aVolAssignments[idxVolAssignments][aColumnHeadings[j]] = aAllAssignments[i][j];
    }
  }
  // DOUBLE wrap with JSON.stringify() b/c axios does one unwrap and we want to able to provide a reviver for JSON.parse() for the list of open assignments
  return JSON.stringify(aVolAssignments);
}


/*=========================================================
*  getOpenAssignments()
*
*  Called by client after page loades to get the list of open assignemnts to display.
*  Return is an arryy of objects based on the sheet of open assignments.
*  The object properties are keyed based on column names on the first sheet of the
*  assignments spreadsheet
*
*  @return aOpenAssignments : [] of Assignment objects: {
*                          Patient_ID : "12345",   // this might translate itself to a Number
*                          Patient_Name : "John Doe",
*                          etc.
*                       }
==========================================================*/
function getOpenAssignments() {
  Logger.log("getOpenAssignments() START");
  var aOpenAssignments = [];
  var aColumnHeadings = [];

  // get the data from the sheet as a 2D array
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rangeAllAssignments = spreadsheet.getSheetByName(SHEET_OPEN).getDataRange();
  var aAllAssignments = rangeAllAssignments.getValues();

  // load aColumnHeadings
  for (var i=0;i<aAllAssignments[ROW_OF_COL_HEADINGS].length;i++)
    aColumnHeadings[i]=aAllAssignments[ROW_OF_COL_HEADINGS][i];
  var IDX_HIDE          = aColumnHeadings.indexOf(COL_HIDE);
  var IDX_PATIENT_ID    = aColumnHeadings.indexOf(COL_PATIENT_ID);
  var IDX_CARE_PLAN     = aColumnHeadings.indexOf(COL_CARE_PLAN);
  var IDX__ASSIGNED     = aColumnHeadings.indexOf(COL__ASSIGNED);
  var IDX_REQUEST       = aColumnHeadings.indexOf(COL_REQUEST);
  var IDX_PATIENT_NAME  = aColumnHeadings.indexOf(COL_PATIENT_NAME);
  var IDX_TIMESTAMP     = aColumnHeadings.indexOf(COL_TIMESTAMP);

  // load aOpenAssignments with assignments that aren't hidden or already assigned
  var idxOpenAssignments = -1;
  for (var i=ROW_OF_COL_HEADINGS+1; i < aAllAssignments.length; i++) {  // index starts at ROW_OF_COL_HEADINGS+1 to skip the row of columns heading

    // if not hidden or already assigned
    if (aAllAssignments[i][IDX_HIDE].length === 0 && aAllAssignments[i][IDX__ASSIGNED].length === 0) {

      // add the assignment object
      aOpenAssignments[++idxOpenAssignments] = {};  // create blank object
      for (var j = 0; j < aColumnHeadings.length; j++)    // add properties based on the column headings
        aOpenAssignments[idxOpenAssignments][aColumnHeadings[j]] = aAllAssignments[i][j];
    }
  }
  //Logger.log("Count of assignments loaded: "+aOpenAssignments.length);
  // DOUBLE wrap with JSON.stringify() b/c axios does one unwrap and we want to able to provide a reviver for JSON.parse() for the list of open assignments
  return JSON.stringify(aOpenAssignments);
}

/*=========================================================
*  processAssignmentRequest()
*
*  Called by client when volunteer requests an assignment
*  @param(oAssignmentRequest) {
*                                sVolunteer  the name te volunteer entered in making the request
*                                sPatientID  string or number, the assignment's PatientID
*                                ** REMOVED ** sCarePlan   the assignment's Care Plan
*                                sRequest    the assignment Request (need this in case a request row was copied on the Board, ex: multiple 1x respites where only the Request column differentiates them)
*                                sTimestamp  the assignment's timestamp in ISO string format
*                             }
*  @return string:  Access code or error message (if the assignment is no longer available) starting with "ERROR"
==========================================================*/
function processAssignmentRequest(oAssignmentRequest) {
  Logger.log("processAssignmentRequest() START");
  Logger.log("oAssignmentRequest="+JSON.stringify(oAssignmentRequest));
  Logger.log("^^^^^^^");

  // get the data from the sheet as a 2D array
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rangeAllAssignments = spreadsheet.getSheetByName(SHEET_OPEN).getDataRange();
  var aAllAssignments = rangeAllAssignments.getValues();

  // load aColumnHeadings
  var aColumnHeadings = [];
  for (var i=0;i<aAllAssignments[ROW_OF_COL_HEADINGS].length;i++)
    aColumnHeadings[i]=aAllAssignments[ROW_OF_COL_HEADINGS][i];
  var IDX_HIDE          = aColumnHeadings.indexOf(COL_HIDE);
  var IDX_PATIENT_ID    = aColumnHeadings.indexOf(COL_PATIENT_ID);
  var IDX_CARE_PLAN     = aColumnHeadings.indexOf(COL_CARE_PLAN);
  var IDX__ASSIGNED     = aColumnHeadings.indexOf(COL__ASSIGNED);
  var IDX_REQUEST       = aColumnHeadings.indexOf(COL_REQUEST);
  var IDX_PATIENT_NAME  = aColumnHeadings.indexOf(COL_PATIENT_NAME);
  var IDX_TIMESTAMP     = aColumnHeadings.indexOf(COL_TIMESTAMP);

  // SEARCH FOR ASSIGNMENT
  var idxOfAssignment = -1;  // index of matching assignment in aAllAssignments, if found
  for (var i=ROW_OF_COL_HEADINGS+1;i<aAllAssignments.length;i++) {  // index starts at ROW_OF_COL_HEADINGS+1 to skip column headings row
    if (oAssignmentRequest.sPatientID==aAllAssignments[i][IDX_PATIENT_ID]) {  // must be "==" as the PatientIDs jump btw being string and numeric
      if (oAssignmentRequest.sCarePlan===aAllAssignments[i][IDX_CARE_PLAN]) {
        if (new Date(oAssignmentRequest.sTimestamp).toString()==aAllAssignments[i][IDX_TIMESTAMP].toString()) {
          // ** REMOVED ** if (oAssignmentRequest.sRequest===aAllAssignments[i][IDX_REQUEST]) {
            idxOfAssignment = i;
            break;
          // ** REMOVED ** }
        }
      }
    }
  }

  // IF ASSIGNMENT FOUND AND STILL AVAILABLE, ASSIGN IT TO VOLUNTEER
  if (idxOfAssignment === -1)
    sReturnMessage = "Not found in list of open assignments.";

  else if (aAllAssignments[idxOfAssignment][IDX_HIDE].length!==0)
    sReturnMessage = "Hidden by a volunteer coordinator.";

  else if (aAllAssignments[idxOfAssignment][IDX__ASSIGNED].length!==0)
    sReturnMessage = "Another volunteer has already taken this assignment.";

  else {
    // make assignment
    var rangeAssignmentRow = spreadsheet.getSheetByName(SHEET_OPEN).getRange(idxOfAssignment+1,1,1,rangeAllAssignments.getNumColumns());
    var aAssignmentRow = rangeAssignmentRow.getValues()[0]; // turn 2D array into 1D

    // sanity check that we have the assignment we think we do
    if (oAssignmentRequest.sPatientID!=aAssignmentRow[IDX_PATIENT_ID] ||  // must be "!=" as the PatientIDs jump btw string and numeric
        // ** REMOVED ** oAssignmentRequest.sRequest!==aAssignmentRow[IDX_REQUEST] ||
        oAssignmentRequest.sCarePlan!==aAssignmentRow[IDX_CARE_PLAN]) {
      sReturnMessage = "ERROR: Let Ed know you got this error, no assignment was made.";

    // assign it!
    } else {
      rangeAssignmentRow.offset(0,IDX__ASSIGNED,1,1).setValue(oAssignmentRequest.sVolunteer);
      rangeAssignmentRow.setBackground('#FDEBD0');
      sReturnMessage = "success";  // ** REMOVED ** getAccessCode(aAssignmentRow[IDX_PATIENT_ID]);
      emailVolunteerTeam(oAssignmentRequest.sVolunteer,aAssignmentRow);
      }
  }
  Logger.log("sReturnMessage from processAssignmentRequest: "+sReturnMessage);
  const oReturnMessage = {};
  oReturnMessage.message = sReturnMessage;
  // DOUBLE wrap with JSON.stringify() b/c axios does one unwrap and we want to able to provide a reviver for JSON.parse() for the list of open assignments
  return JSON.stringify(oReturnMessage);
}

/*=========================================================
https://script.google.com/a/trucare.org/macros/s/AKfycbxoYDVdKuD5L6iigoDBG-iOwvMY57mOWHdrBWe18r0/dev?action=getOpenAssignments
*  doGet() manages requests for:
*
*    ?action=getOpenAssignments
*        no parameters, get all open assignments
*
*    ?action=takeAssignment, volunteer taking an assignment
*        params: sVolunteer, sPatientID, sCarePlan, sTimestamp
*
*    ?action=getVolunteerAssignments, get all assignments for a volunteer
*        param: sVolunteer
*
*    ?action=getVolsSummary. get summary of volunteer's docs for optional date range
*        params: sVolunteer, [sStart], [sEnd]
==========================================================*/
function doGet(e) {
  Logger.log("doGet() version 22");
  Logger.log(e);
  Logger.log("-----------------------------");

  var result = "";
  switch (e.parameter.action) {
    case "getOpenAssignments":
       Logger.log("ACTION: getOpenAssignments --------------------");
       Logger.log("-----");
       result = getOpenAssignments();
       break;
    case "takeAssignment":
       Logger.log("ACTION: takeAssignment --------------------");
       Logger.log("-----");
       const oAssignmentRequest = {};
       oAssignmentRequest.sVolunteer = e.parameter.sVolunteer;
       oAssignmentRequest.sPatientID = e.parameter.sPatientID;
       oAssignmentRequest.sCarePlan = e.parameter.sCarePlan;
       oAssignmentRequest.sTimestamp = e.parameter.sTimestamp;
       result = processAssignmentRequest(oAssignmentRequest);
       Logger.log(">>>> result: "+result.message);
       break;
    case "getVolunteerAssignments":
       Logger.log("ACTION: getVolunteerAssignments --------------------");
       Logger.log("-----");
       result = getVolunteerAssignments(e.parameter.sVolunteer);
       break;
    default:
       Logger.log("ACTION: takeAssignment --------------------");
       result = {};
       result.message = "ERROR: unknown/missing action parameter in GAS doGet(): ?action="+e.parameter.action;
       result=JSON.stringify(result);
  }
  // DOUBLE wrap with JSON.stringify() b/c axios does one unwrap and we want to able to provide a reviver for JSON.parse() for the list of open assignments
  return ContentService.createTextOutput(JSON.stringify(result));
}

/*
WORKING FOR getOpenAssignments at 4pm
function doGet(e) {
  Logger.log("doGet() version 2");
  Logger.log(e);
  Logger.log("-----------------------------");

  var result = "";
  switch (e.parameter.action) {
    case "getOpenAssignments":
       Logger.log("ACTION: getOpenAssignments --------------------");
       Logger.log("-----");
       result = getOpenAssignments();
       break;
    case "takeAssignment":
       Logger.log("ACTION: takeAssignment --------------------");
       Logger.log("-----");
       const oAssignmentRequest = {};
       oAssignmentRequest.sVolunteer = e.parameter.sVolunteer;
       oAssignmentRequest.sPatientID = e.parameter.sPatientID;
       oAssignmentRequest.sCarePlan = e.parameter.sCarePlan;
       oAssignmentRequest.sTimestamp = e.parameter.sTimestamp;
       result = processAssignmentRequest(oAssignmentRequest);
       Logger.log(">>>> result: "+result);
       break;
    default:
       result = { errorMessage: "ERROR: unknown/missing action parameter in GAS doGet(): ?action="+e.parameter.action };
  }

  return ContentService.createTextOutput(JSON.stringify(result));
}*/

/*=========================================================
*  Email assignment information to team
==========================================================*/
function emailVolunteerTeam(sVolunteer,aAssignmentRow) {

  var sEmailAddresses = "";

  // TODO:  This is super inefficient since its only being loaded to get the column heading indexes
  // get the data from the sheet as a 2D array
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rangeAllAssignments = spreadsheet.getSheetByName(SHEET_OPEN).getDataRange();
  var aAllAssignments = rangeAllAssignments.getValues();

  // load aColumnHeadings
  var aColumnHeadings = [];
  for (var i=0;i<aAllAssignments[ROW_OF_COL_HEADINGS].length;i++)
    aColumnHeadings[i]=aAllAssignments[ROW_OF_COL_HEADINGS][i];
  var IDX_PATIENT_ID    = aColumnHeadings.indexOf(COL_PATIENT_ID);
  var IDX_PATIENT_NAME  = aColumnHeadings.indexOf(COL_PATIENT_NAME);
  var IDX_TEAM          = aColumnHeadings.indexOf(COL_TEAM);
  var IDX_CARE_PLAN     = aColumnHeadings.indexOf(COL_CARE_PLAN);
  var IDX_REQUEST       = aColumnHeadings.indexOf(COL_REQUEST);


  // Care Plans that start with "Testing" should not generate team emails, they are used during development
  if (/Testing/.test(aAssignmentRow[IDX_CARE_PLAN]))
    sEmailAddresses = getTeamEmailAddress(EMAIL_ADDRESS_NAME_DEVELOPER);
  else
    sEmailAddresses = getTeamEmailAddress(aAssignmentRow[IDX_TEAM])+
                      ", "+getTeamEmailAddress(EMAIL_ADDRESS_NAME_VOLUNTEERS);

  Logger.log("** Sending email to: "+sEmailAddresses);

  try {
    MailApp.sendEmail(sEmailAddresses,

                    aAssignmentRow[IDX_PATIENT_NAME]+" - "+aAssignmentRow[IDX_PATIENT_ID]+" - volunteer assigned",

                    "\n"+sVolunteer+" has been assigned to:\n\n\t"+
                         aAssignmentRow[IDX_PATIENT_ID]+" "+aAssignmentRow[IDX_PATIENT_NAME]+"\n\t"+
                         aAssignmentRow[IDX_CARE_PLAN]+"\n\n"+
                         unRedactNames(aAssignmentRow[IDX_REQUEST])+"\n\n"+
                         "(assignment taken at: "+Date()+")");
  }
  catch (err) {
    Logger.log(err.message);
    MailApp.sendEmail("edphelps1@gmail.com","TRU: error while emailing that vol took an assignment",err.message+". email addr: "+sEmailAddresses);
  }
}

/*=========================================================
*  unRedactNames()
*
*  Removes the "~" used to redact names
*
*  @param sText (string) string that can include redacting characters
*
*  @return (string) unredacted text
==========================================================*/
function unRedactNames(sText) {
  return sText.replace(new RegExp(/~/gi),"");  // remove the "~"s
}

/*=========================================================
*  getTeamEmailAddrees()
*
*  Get the email address for Developer, Volunteers, or Team
*
*  @param (string) sTeamName - name of the team, matching the entry in the email list in the spreadsheet
*
*  @return (string) associated email address or "" if sTeam not found
===========================================================*/
function getTeamEmailAddress(sTeamName) {
  Logger.log("getTeamEmailAddress()");

  loadEmails();  // figure out object permenance on server side so don't have to reload each call

  var sEmail = "";

  for (var i=0;i<gaTeamEmailAddresses.length;i++) {
    if (gaTeamEmailAddresses[i][0]===sTeamName) {
      sEmail = gaTeamEmailAddresses[i][1];
      break;
    }
  }

  if (0<sEmail.length) {
    Logger.log(sTeamName+" - "+sEmail);
    }
  else {
    Logger.log(sTeamName+" NOT FOUND");
  }
  return sEmail;
}

/*=========================================================
*  loadEmails()
*
*  Load the "Volunteers" and Team email addresses for notification
*    into global array gaTeamEmailAddresses
*
===========================================================*/
function loadEmails() {
  var aAllEmails = [];
  var aColumnHeadings = [];
  gaTeamEmailAddresses = [];

  // get the data from the sheet as a 2D array
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rangeAllEmails = spreadsheet.getSheetByName(SHEET_EMAILS).getDataRange();
  var aAllEmails = rangeAllEmails.getValues();

  // load aColumnHeadings
  for (var i=0;i<aAllEmails[ROW_OF_COL_HEADINGS].length;i++) {
    Logger.log("col head: "+aAllEmails[ROW_OF_COL_HEADINGS][i]);
    aColumnHeadings[i]=aAllEmails[ROW_OF_COL_HEADINGS][i];
  }

  var IDX_EMAIL_TEAM    = aColumnHeadings.indexOf(COL_EMAIL_TEAM);
  var IDX_EMAIL_EMAIL   = aColumnHeadings.indexOf(COL_EMAIL_EMAIL);

  // load gaTeamEmailAddresses
  var idx_gaTeamEmailAddresses = -1;
  for (var i=ROW_OF_COL_HEADINGS+1;i<aAllEmails.length;i++) {  // index starts at ROW_OF_COL_HEADINGS+1 to skip the row of columns heading
    Logger.log("email: "+aAllEmails[i][IDX_EMAIL_TEAM]+" = "+aAllEmails[i][IDX_EMAIL_EMAIL]);
    gaTeamEmailAddresses[++idx_gaTeamEmailAddresses] = [];
    gaTeamEmailAddresses[idx_gaTeamEmailAddresses][0]=aAllEmails[i][IDX_EMAIL_TEAM];
    gaTeamEmailAddresses[idx_gaTeamEmailAddresses][1]=aAllEmails[i][IDX_EMAIL_EMAIL];
  }

  for (var i=0;i<gaTeamEmailAddresses.length;i++) {
    Logger.log("arr: "+gaTeamEmailAddresses[i][0]+" : "+gaTeamEmailAddresses[i][1]);
    }
}
