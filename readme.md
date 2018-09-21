# TRU Care Volunteer Assigment Site


# Overview

This site allows TRU Care volunteers to:
* view available volunteer assignments
* take a volunteer assignment
* view the details (phone, address, etc) for their assignments
* view a summary of their volunteer history (hours and miles by year)
* view the patient visit documentation they've submitted in the past 90 days  

The site links to:
* the volunteer's "home" page, administered via Google Sites
* a Google Form for volunteers to submit documentation of their patient visits


# Login process

A single password is used for all users and is currently hard-coded into the
app.  Application saves login information to local storage.  Menu is disabled
and a dummy page is displayed until login is completed.

### invalid login
![Example](screenshots/login-invalid.png)

### valid login
![Example](screenshots/login-valid.png)


# Open Assignments page

Lists assignments grouped by Care Plan and then in reverse date order of when
they were posted.  Badges highlight:
* new assignments posted since the last time the user viewed this page (app
  stores the last viewed date/time in local storage)
* assignments posted > 7 days ago
* assignments posted > 14 days ago  

Clicking an assignment will slide it open to reveal basic information on the
assignment with names redacted (they appears as "#name#" in the text).

### assignments page
![Example](screenshots/open-assignments.png)

At the bottom of the assignment details is a button to take the assignment.

### "take it" button
![Example](screenshots/take-it-btn.png)

When a user clicks to take an assignment the button changes to a wait message
while an AJAX call is made to try to take the assignment.  

### wait button
![Example](screenshots/take-it-wait-btn.png)

If there is a problema modal is displayed and the button changes to
"Assignment Unavailable".

### failed to take assignment modal
![Example](screenshots/take-it-failed-modal.png)

### failed to take assignment button
![ExampleÎ](screenshots/take-it-failed-btn.png)


# My Assignments page

Lists the volunteer's active assignments.  The volunteer coordinators can remove
or hide assignments from the spreadsheet containing the assignments.  This page
functions similarly to the open assignments page, allowing the user to click
an assignment to see the details.  On this page more information on the
assignment is shown (including names, phone numbers, etc).

### assignments page
![ExampleÎ](screenshots/my-assignments.png)

# My Stats page

Lists annual totals and the docs volunteer has submitted in the last 90 days.

### my stats page
![ExampleÎ](screenshots/my-stats.png)


# Axios details

All calls to axios/ajax set a 


# Data

Data is accessed via a Google Apps Script API that maintains a spreadsheet
of assignments (open and assigned) and another spreadsheet with the 'docs'
submitted by volunteers.

The code for this is in server.js and designed to run as a Google Apps Scripts
project on their servers.

Data is maintained and server.js is executed in the context of the e
dphelps@trucare.org Google account.
