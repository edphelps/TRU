/*
    Globals
*/

const BASE_URL = "https://script.google.com/macros/s/AKfycbyzJBFIC8PFykacFyF1koj1hYH_oGLYy1t-7sUrIy79Xv9AGAA/exec";

let gelemContentOpenAssignments = null;
let gelemContentVolunteerAssignments = null;
let gelemContentLogin = null;

// Array of open assignments loaded by ajax when displaying the open assoignments page
let gaOpenAssignments = [];

const MILLISEC_IN_A_DAY = 1000 * 60 * 60 * 24;

let gUserValidated = false;
