TRU Care Volunteer Website

=====================================================
Login
=====================================================

Application saves login information to local storage and is retrieved and
re-validated when app loads.  Validation is performed as the user types.

A single password is used for everyone and is currently hard-coded into the
app.  Todo: add an ajax call to get the current password.  This creates some
timing conditions, but ok to have the state show the user is unauthorized
until the universal password is received.  Todo: create a place in the
Google spreadsheets to maintain the password.


=====================================================
Data
=====================================================

Data is accessed from a Google Apps Script API that maintains spreadsheets
of assignments (open and assigned) and the 'docs' submitted by volunteers.

The RESTful API has the following methods:
-- todo: fill in
