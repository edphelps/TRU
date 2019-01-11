/*
    Globals
*/

const BASE_URL = "https://script.google.com/macros/s/AKfycbyzJBFIC8PFykacFyF1koj1hYH_oGLYy1t-7sUrIy79Xv9AGAA/exec";

// convenience references to elements
let gelemContentOpenAssignments = null;
let gelemContentVolunteerAssignments = null;
let gelemContentLogin = null;

// Array of open assignments loaded by ajax when displaying the open
// assignments page
let gaOpenAssignments = [];

const MILLISEC_IN_A_DAY = 1000 * 60 * 60 * 24;

// has user been validated
let gUserValidated = false;

// object used to cancel current AJAX data loads requests if another is made.
// Ex: user clicks the menu multiple times while a page is loading data.
let goCancelAjax = null;
