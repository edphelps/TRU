/*
    General utility functions
*/

/* ==================================================
*  cancelPendingAjaxLoad()
*
*  Called by a page before it launches an AJAX request for data.  This
*  is important to prevent user from clicking the menu selection for the
*  page multuple times OR movine from one page to another while the first
*  page is still loading (we wouldn't want the first page to start loading
*  the DOM when its AJAX call returned while the user is viewing the 2nd page).
* =================================================== */
function cancelPendingAjaxLoad() {
  if (goCancelAjax) {
    console.log("Cancelling current AJAX call");
    goCancelAjax.cancel();
    goCancelAjax = null;
  }
}

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
*        content if user hasn't been validated
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
  // on different 'pages'
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
*  hasLocalStorageSupport()
*
*  Checks is localStorage is supported, which it's not in Safari
*
*  @return t/f
* =================================================== */
function hasLocalStorageSupport() {
  let bLocalStorageSupport = false;
  try {
    const testKey = 'safari-issue';
    localStorage.setItem(testKey, 'foo');
    localStorage.removeItem(testKey);
    bLocalStorageSupport = true;
  } catch (e) {
    bLocalStorageSupport = false;
  }
  return bLocalStorageSupport;
}

/* ==================================================
*  unredactNames()
*
*  Remove the '~' used to flag names to be redacted.
*
*  @param sText (string) string that includes ~'s
*  @return new string that's had the '~'s removed.
* =================================================== */
function unredactNames(sText) {
  return sText.replace(new RegExp(/(~)/gi), ""); // replace "~" with nothing
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
}

/* ==================================================
*  makeRowHeading()
*
*  Create a row element for a table header
*
*  @param sTh (string) the heading text for row
*  @param ...sTr (string parameters) the col2,3,4... body text for the row
*  @return the row element
* =================================================== */
function makeRowHeading(...sThs) {
  const elemRow = document.createElement("tr");
  for (const sTh of sThs) {
    const elemColTh = document.createElement("th");
    elemColTh.innerHTML = sTh; // need this for elements that use addHtmlBr()
    elemRow.appendChild(elemColTh);
  }
  return elemRow;
}

/* ==================================================
*  makeRow()
*
*  Create a row element
*
*  @param sTh (string) the heading text for row
*  @param ...sTr (string parameters) the col2,3,4... body text for the row
*  @return the row element
* =================================================== */
function makeRow(sTh, ...sTds) {
  const elemRow = document.createElement("tr");
  const elemColTh = document.createElement("th");
  elemColTh.innerText = sTh;

  elemRow.appendChild(elemColTh);
  for (const sTd of sTds) {
    const elemColTd = document.createElement("td");
    elemColTd.innerHTML = sTd; // need this for elements that use addHtmlBr()
    elemRow.appendChild(elemColTd);
  }

  return elemRow;
}
