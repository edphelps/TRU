# TRU Care Volunteer Assigment Site

# Overview

This site allows TRU Care volunteers to:
* view available volunteer assignments
* take a volunteer assignment
* view the details (phone, address, etc) for their assignments
* view a summary of their volunteer history (hours and miles by year)
* view the documentation of their patient visits they've submitted in the past 90 days  

The site links to:
* the volunteer's "home" page, administered via Google Sites
* the Google Form that allows volunteers to submit documentation of their patient visit

# Login

A single password is used for all users and is currently hard-coded into the
app.  Application saves login information to local storage.

## invalid login
![Example](screenshots/login-invalid.png)

## valid login
![Example](screenshots/login-valid.png)

=====================================================
Data
=====================================================

Data is accessed via a Google Apps Script API that maintains a spreadsheet
of assignments (open and assigned) and another spreadsheet with the 'docs'
submitted by volunteers.

The code for this is in server.js and designed to run as a Google Apps Scripts
project.

Data is maintained by the edphelps@trucare.org Google account.
