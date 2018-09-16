"use strict";
let endpoint = "students.json";
let studentList = document.querySelector("#Studentlist");
let template = document.querySelector("#student_template");

window.addEventListener("DOMContentLoaded", init);

const allStudents = [];
let currentStudents = [];

const Student_prototype = {
  firstName: "",
  middleName: "",
  lastName: "",

  toString() {
    return this.firstName + " " + this.middleName + " " + this.lastName;
  },
  splitName(fullName) {
    const searchSpace = " ";
    const firstSpace = fullName.indexOf(" ");
    const lastSpace = fullName.lastIndexOf(searchSpace);

    this.firstName = fullName.substring(0, firstSpace);
    this.middleName = fullName.substring(firstSpace, lastSpace);
    this.lastName = fullName.substring(lastSpace);
  }
};

// fetching JSON FILE
function init() {
  allStudents.splice(0, allStudents.length); // from https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
  // fetch JSON
  fetchData();
}

function fetchData() {
  const url = "students.json";

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(jsondata) {
      console.log(jsondata);

      createObject(jsondata);

      currentStudents = allStudents;

      displayList(currentStudents);

      //console.log(jsondata);
    });
}

function createObject(names) {
  names.forEach(element => {
    console.log(element);
    const elmObject = Object.create(Student_prototype);
    elmObject.splitName(element);
    console.log(elmObject);
    allStudents.push(elmObject);
  });
  console.table(allStudents);
}

function displayList(listOfStudents) {
  console.log("Display list");
  // clear the table
  document.querySelector("table#Studentlist tbody").innerHTML = "";

  // foreach student in listOfStudents
  listOfStudents.forEach(function(student) {
    // clone a table-row for student
    const clone = document
      .querySelector("#student_template")
      .content.cloneNode(true);

    // fill in the clone with data
    clone.querySelector("[data-firstname]").textContent = student.firstName;
    clone.querySelector("[data-middlename]").textContent = student.middleName;
    clone.querySelector("[data-lastname]").textContent = student.lastName;

    // add the studentId to the <tr>
    clone.querySelector("tr").dataset.studentId = student.id;

    // append clone to table
    document.querySelector("table#Studentlist tbody").appendChild(clone);

    initFrontend();
  });
}

//filtering data
function initFrontend() {
  console.log("Frontend is running");

  // register buttons for sort
  document
    .querySelector("li#sort_first")
    .addEventListener("click", clickedSortFirstname);
  document
    .querySelector("li#sort_last")
    .addEventListener("click", clickedSortLastname);

  // register table clicks
  document
    .querySelector("table#Studentlist")
    .addEventListener("click", clickedTable);
}
function clickedSortFirstname() {
  console.log("clickedSortFirstname");
  sortByFirstName();
  displayList(currentStudents);
}

function sortByFirstName() {
  currentStudents.sort(byFirstName);

  function byFirstName(a, b) {
    if (a.firstName < b.firstName) {
      return -1;
    } else if (a.firstName > b.firstName) {
      return 1;
    } else {
      return 0;
    }
  }
}

function clickedSortLastname() {
  console.log("clickedSortLastname");
  sortByLastName();
  displayList(currentStudents);
}

function sortByLastName() {
  currentStudents.sort(byLastName);

  function byLastName(a, b) {
    if (a.lastName < b.lastName) {
      return -1;
    } else {
      return 1;
    }
  }
}

///deleting

// from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime();
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    d += performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function deleteStudent(studentId) {
  // find the index of the student with studentId

  const index = allStudents.findIndex(findStudent);
  console.log("found index: " + index);

  allStudents.splice(index, 1);

  // function that returns true when student.id == studentId
  function findStudent(student) {
    if (student.id === studentId) {
      return true;
    } else {
      return false;
    }
  }
}

function clickedTable(event) {
  //    console.log("clicked table");
  //    console.log(event.target);

  const clicked = event.target;
  //    console.log(clicked.tagName);
  if (clicked.tagName.toLowerCase() === "img") {
    // NOTE: When we have more buttons, check which kind was clicked (on class or something)
    clickedDelete(clicked);
  }
}

function clickedDelete(deleteButton) {
  //    console.log(deleteButton);
  // find the parent <tr> that has this deleteButton inside it
  let tr = deleteButton.parentElement;
  while (tr.tagName !== "TR") {
    tr = tr.parentElement;
  }

  // find the studentId
  const studentId = tr.dataset.studentId;
  console.log(studentId);

  deleteStudent(studentId);

  // animate the <tr> out
  animateDelete(tr);
  // remove that <tr>
  //tr.remove();
}

function animateDelete(tr) {
  tr.style.transform = "translateX(-105%)";
  tr.style.transition = "transform 1s";

  // tr.classList.add("fly-out");
  const rect = tr.getBoundingClientRect();

  tr.addEventListener("transitionend", function() {
    // find the nextSibling (the tr below this)
    let nextSibling = tr.nextElementSibling;

    if (nextSibling !== null) {
      nextSibling.addEventListener("transitionend", function() {
        console.log("transition end");

        // reset all the translateY!
        let nextTr = tr.nextElementSibling;
        while (nextTr !== null) {
          nextTr.style.transform = "translateY(0)";
          nextTr.style.transition = "transform 0s";

          nextTr = nextTr.nextElementSibling;
        }

        // remove that <tr>
        tr.remove();
      });

      while (nextSibling !== null) {
        nextSibling.style.transform = "translateY(-" + rect.height + "px)";
        nextSibling.style.transition = "transform 0.5s";

        nextSibling = nextSibling.nextElementSibling;
      }
    } else {
      // no next sibling - just remove!
      tr.remove();
    }
  });
}

//function open details
let details = document.querySelector(".student_details");
let showName = document.querySelector(".full_name");
let FrontEndStudents = document.querySelector(".list");
let profile = document.querySelector(".profile");

function openDetails(showNameInModal) {
  details.style.width = "50vw";
  FrontEndStudents.style.width = "35vw";
  FrontEndStudents.style.backgroundColor = "#8FB3B2";
  profile.style.width = "50vw";
  console.log("show details");

  let tr = showNameInModal.parentElement;
  while (tr.tagName !== "TR") {
    tr = tr.parentElement;
  }

  // find the studentId
  const studentId = tr.dataset.studentId;
  console.log(studentId);

  details.querySelector("h2").textContent = showName;
}

function closeDetails() {
  details.style.width = "0";
  FrontEndStudents.style.width = "85vw";
  FrontEndStudents.style.backgroundColor = "white";
  profile.style.width = "85vw";
  console.log("close details");
}

// function open sorting list button

let li = document.querySelector("li#sort_first");
let li2 = document.querySelector("li#sort_last");

function showLi() {
  li.style.display = "block";
  li2.style.display = "block";
}

function hideLi() {
  li.style.display = "none";
  li2.style.display = "none";
}
