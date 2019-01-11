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

const URL_ACTION_VOLUNTEER_DOCS = "getVolunteerDocs";
const URL_ACTION_GET_PASSWORD = "getPassword";

const LOCAL_STORAGE_LOGIN_NAME = "login-name";
const LOCAL_STORAGE_LOGIN_PSWD = "login-pswd";

const FIRST_YEAR_OF_DOCS = 2007;

// convenience references to content elements
let gelemContentHome = null;
let gelemContentVolunteerStats = null;

// user validation
let gPASSWORD = "unk"; // will be loaded via AJAX


/* *****************************************************************************
********************************************************************************
*  MENU HANDLERS
********************************************************************************
***************************************************************************** */


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
  if (hasLocalStorageSupport()) {
    localStorage.setItem(LOCAL_STORAGE_LOGIN_NAME, sName);
    localStorage.setItem(LOCAL_STORAGE_LOGIN_PSWD, sPassword);
  }

  // valid
  if (sName.length && sPassword.toLowerCase() === gPASSWORD.toLowerCase()) {
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
*  loadPassword()
*
*  AJAX call to get password from server.  Call onkeyupLogin() when loaded.
* =================================================== */
function loadPassword() {
  let url = `${BASE_URL}?action=${URL_ACTION_GET_PASSWORD}`;
  console.log(`URL: ${url}`);
  console.log("##################");
  // make AJAX call
  cancelPendingAjaxLoad(); // looks at goCancelAjax
  goCancelAjax = axios.CancelToken.source();
  axios.get(url, { cancelToken: goCancelAjax.token })
    .then((oResponse) => {
      goCancelAjax = null;
      console.log("-- ajax call responded --");
      // Parse the returned JSON into a string
      // The data from API was double JSON.stringified() since axios does one
      // round of JSON.parse() for us.  We want to JSON.parse() ourselves to be
      // able to apply the date reviver in other parts of the application.
      gPASSWORD = JSON.parse(oResponse.data);
      // console.log(`password loaded: ${gPASSWORD}`);
      // console.log(gPASSWORD);
      // console.log(oResponse.data);
      onkeyupLogin(); // cause a re-evalidation of user login credentials
    }) // then
    .catch((error) => {
      // display AJAX error msg (can also be a throw from the .then section)
      console.log("-- AJAX error --");
      console.log(error);
      console.log(`${error}`);
      const sErrorMsg = JSON.stringify(error);
      console.log(sErrorMsg);
      debugger;
    }); // catch
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

  loadPassword();

  if (hasLocalStorageSupport()) {
    const sName = localStorage.getItem(LOCAL_STORAGE_LOGIN_NAME) || "";
    const sPswd = localStorage.getItem(LOCAL_STORAGE_LOGIN_PSWD) || "";

    document.getElementById("login-name").value = sName;
    document.getElementById("login-password").value = sPswd;
  }
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
  // onMenuHome();
});
