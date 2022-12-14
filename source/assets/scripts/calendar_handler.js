// Run the init() function when the page has loaded
window.addEventListener("DOMContentLoaded", init);

// Starts the program, all function calls trace back here
function init() {
  add_event();
  add_todo();
  logout();
}

const EMPTY_YEAR = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

const EMPTY_MONTH = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

/**
 * @author Yangming Guan
 * @summary update a day block in html view.
 *
 * @param {number} firstDayOfWeek first day of week day.
 * @param {number} dayOfMonth the day of month
 * @param {Array} data json data.
 * @default firstDayOfWeek should be greter than 0.
 */
function update_day_block(firstDayOfWeek, dayOfMonth, data) {
  const day_block = document.getElementById(
    "day-block-" + String(firstDayOfWeek - 1 + dayOfMonth)
  );
  day_block.innerHTML = "";
  let p = document.createElement("p");
  p.innerHTML = dayOfMonth;
  day_block.append(p);
  let count = 0;
  for (let d of data) {
    let p = document.createElement("p");
    p.innerHTML = d;
    day_block.append(p);
    if (count > 5) {
      console.log(dayOfMonth.length);
      p.innerHTML = String(data.length) + "+";
      day_block.append(p);
      break;
    }
    count++;
  }
}

/**
 * @author Yuelin Dai,Yangming Guan
 * @summary pop dialog for add event.
 */
function add_event() {
  //preload the element for further using.
  const add_event_btn = document.getElementById("add-event-btn");
  const add_event_dialog = document.getElementById("add-event-dialog");
  const event_form = add_event_dialog.querySelector("#add-event-form");
  const event_dialog_cancel = add_event_dialog.querySelector(".cancel");
  const event_date = document.getElementById("date");
  const start_time_input = document.getElementById("start-time");
  const end_time_input = document.getElementById("end-time");
  const eventEditInfo = document.getElementById("edit-info");
  const eventIsEdit = document.getElementById("is-edit");

  event_date.addEventListener("change", () => {
    let inputDate = event_date.value.split("-");

    for (let i = 0; i < inputDate.length; i++) {
      inputDate[i] = Number(inputDate[i]);
    }

    if (inputDate[0] < 2000) {
      alert("Events can only be set to year 2000 or after!");
      event_date.value = "2000-01-01";
    }
  });

  // event listener for edge case that event start time must be before end time on input change for start time
  start_time_input.addEventListener("change", () => {
    // get the inputted start and end times for the event and convert them into array of numbers [hour, minute]
    let start_time = start_time_input.value.split(":");
    let end_time = end_time_input.value.split(":");
    for (let i = 0; i < start_time.length; i++) {
      start_time[i] = Number(start_time[i]);
      end_time[i] = Number(end_time[i]);
    }

    // if start time is after end time, or if end time hasn't been set, set/reset end time to the same time as start time
    if (start_time[0] > end_time[0] || start_time[1] > end_time[1]) {
      end_time_input.value = start_time_input.value;
    }
  });

  // event listener for edge case that event start time must be before end time on input change for end time
  end_time_input.addEventListener("change", () => {
    // if there's no start time input, return
    if (!start_time_input.value) {
      return;
    }

    // get the inputted start and end times for the event and convert them into array of numbers [hour, minute]
    let start_time = start_time_input.value.split(":");
    let end_time = end_time_input.value.split(":");
    for (let i = 0; i < start_time.length; i++) {
      start_time[i] = Number(start_time[i]);
      end_time[i] = Number(end_time[i]);
    }

    // if start time is after end time, set/reset start time to the same time as end time
    if (start_time[0] > end_time[0] || start_time[1] > end_time[1]) {
      start_time_input.value = end_time_input.value;
    }
  });

  event_form.addEventListener("submit", () => {
    let info = eventEditInfo.value.split(" ");
    //check if this action is edit.
    if (eventIsEdit.value === "true") {
      console.log(calendarData[0]);
      let eventList =
        calendarData[0].years[info[1]].months[info[2]].days[info[3] - 1].Events;
      for (let i = 0; i < eventList.length; i++) {
        if (eventList[i].eventID === parseInt(info[0])) {
          eventList.splice(i, 1);
        }
      }
      eventIsEdit.value = "false";
      updateSideBar(info[3]);
    }
    const data = new FormData(event_form);

    let eventTitle = data.get("event-title");
    let eventDate = data.get("date"); // format: 'YYYY-MM-DD'
    let eventStart = data.get("start-time");
    let eventEnd = data.get("end-time");
    let eventLoc = data.get("location");
    let eventDescription = data.get("description");

    let eventLastTwoYear = Number(eventDate.substring(2, 4));
    let eventYear = Number(eventDate.substring(0, 4));
    let eventMonth = Number(eventDate.substring(5, 7));
    let eventDay = Number(eventDate.substring(8, 10));

    eventStart =
      String(eventMonth) +
      "/" +
      String(eventDay) +
      "/" +
      eventLastTwoYear +
      " " +
      eventStart;

    eventEnd =
      String(eventMonth) +
      "/" +
      String(eventDay) +
      "/" +
      eventLastTwoYear +
      " " +
      eventEnd;

    const newEvent = new Event(
      eventStart,
      eventEnd,
      eventTitle,
      eventLoc,
      eventDescription
    );

    // allocate empty year if needed
    if (calendarData[0].years[eventLastTwoYear] == null) {
      // allocate 12 empty months
      calendarData[0].years[eventLastTwoYear] = new Year(eventYear, []);
      calendarData[0].years[eventLastTwoYear].months = EMPTY_YEAR;
    }

    // allocate empty month if needed
    if (
      calendarData[0].years[eventLastTwoYear].months[eventMonth - 1] == null
    ) {
      // allocate 31 empty days
      calendarData[0].years[eventLastTwoYear].months[eventMonth - 1] =
        new Month(eventMonth, indexToMonth(eventMonth), []);
      calendarData[0].years[eventLastTwoYear].months[eventMonth - 1].days =
        EMPTY_MONTH;
    }

    // allocate empty month if needed
    if (
      calendarData[0].years[eventLastTwoYear].months[eventMonth - 1].days[
        eventDay - 1
      ] == null
    ) {
      // allocate one day
      calendarData[0].years[eventLastTwoYear].months[eventMonth - 1].days[
        eventDay - 1
      ] = new Day(eventDay, indexToDay(eventDay), [], []);
    }

    calendarData[0].years[eventLastTwoYear].months[eventMonth - 1].days[
      eventDay - 1
    ].events.push(newEvent);

    currDay = [eventYear, eventMonth, eventDay];

    // refresh calendar
    // resetCalendarHTML();
    numWeeks = getWeekCount(eventYear, eventMonth);
    hideLastRow(numWeeks); // create day blocks
    loadCalendarHTML(eventYear, eventMonth);
    calendarData[0].Show(eventYear, eventMonth);

    // auto save calendar to local storage
    saveJsonToLocalStorage(calendarData[0]);
  });
  //display the dialog.
  add_event_btn.addEventListener("click", () => {
    add_event_dialog.showModal();
  });

  //close dialog without save.
  event_dialog_cancel.addEventListener("click", (e) => {
    e.stopPropagation();
    add_event_dialog.close();
    eventIsEdit.value = "false";
  });
}

/**
 * @author Steven Khaw,Yangming Guan
 * @summary pop a dialog for add todo list.
 */
function add_todo() {
  //preload the element for further using.
  const add_todo_btn = document.getElementById("add-todo-btn");
  const add_todo_dialog = document.getElementById("add-todo-dialog");
  const todo_form = add_todo_dialog.querySelector("#add-todo-form");
  const todo_dialog_cancel = add_todo_dialog.querySelector(".cancel");
  const eventEditInfo = document.getElementById("edit-info");
  const eventIsEdit = document.getElementById("is-edit");
  const due_date_input = document.getElementById("due-date");

  due_date_input.addEventListener("change", () => {
    console.log(due_date_input.value);
    let dueDate = due_date_input.value.slice(0, 10).split("-");
    console.log(dueDate);

    for (let i = 0; i < dueDate.length; i++) {
      dueDate[i] = Number(dueDate[i]);
    }

    if (dueDate[0] < 2000) {
      alert("Tasks can only be set to year 2000 or after!");
      due_date_input.value = "2000-01-01T00:00";
    }
  });

  //when submit button is clicked in the form.
  todo_form.addEventListener("submit", () => {
    if (eventIsEdit.value === "true") {
      let info = eventEditInfo.value.split(" ");
      let taskList =
        calendarData[0].years[info[1]].months[info[2]].days[info[3] - 1].tasks;
      for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].taskID === parseInt(info[0])) {
          taskList.splice(i, 1);
        }
      }
      eventIsEdit.value = "false";
      updateSideBar(info[3]);
    }

    const data = new FormData(todo_form);

    let taskTitle = data.get("task-title");
    let taskDate = data.get("due-date"); // format: 'YYYY-MM-DDTHH:MM'
    let taskDescription = data.get("todo-description");

    let taskLastTwoYear = Number(taskDate.substring(2, 4));
    let taskYear = Number(taskDate.substring(0, 4));
    let taskMonth = Number(taskDate.substring(5, 7));
    let taskDay = Number(taskDate.substring(8, 10));
    let taskHour = Number(taskDate.substring(11, 13));
    let taskMinute = Number(taskDate.substring(14, 16));

    let taskDueDate = String(
      taskMonth +
        "/" +
        taskDay +
        "/" +
        taskLastTwoYear +
        " " +
        taskHour +
        ":" +
        taskMinute
    );

    const newTask = new Task(
      taskTitle,
      [],
      taskDueDate,
      taskDescription,
      false
    );

    // allocate empty year if needed
    if (calendarData[0].years[taskLastTwoYear] == null) {
      // allocate 12 empty months
      calendarData[0].years[taskLastTwoYear] = new Year(taskYear, []);
      calendarData[0].years[taskLastTwoYear].months = EMPTY_YEAR;
    }

    // allocate empty month if needed
    if (calendarData[0].years[taskLastTwoYear].months[taskMonth - 1] == null) {
      // allocate 31 empty days
      calendarData[0].years[taskLastTwoYear].months[taskMonth - 1] = new Month(
        taskMonth,
        indexToMonth(taskMonth),
        []
      );
      calendarData[0].years[taskLastTwoYear].months[taskMonth - 1].days =
        EMPTY_MONTH;
    }

    // allocate empty day if needed
    if (
      calendarData[0].years[taskLastTwoYear].months[taskMonth - 1].days[
        taskDay - 1
      ] == null
    ) {
      // allocate one day
      calendarData[0].years[taskLastTwoYear].months[taskMonth - 1].days[
        taskDay - 1
      ] = new Day(taskDay, indexToDay(taskDay), [], []);
    }

    calendarData[0].years[taskLastTwoYear].months[taskMonth - 1].days[
      taskDay - 1
    ].tasks.push(newTask);

    currDay = [taskYear, taskMonth, taskDay];

    // refresh calendar
    //resetCalendarHTML();
    numWeeks = getWeekCount(taskYear, taskMonth);
    hideLastRow(numWeeks); // create day blocks
    loadCalendarHTML(taskYear, taskMonth);
    calendarData[0].Show(taskYear, taskMonth);
    // auto save calendar to local storage
    saveJsonToLocalStorage(calendarData[0]);
  });

  //display the dialog.
  add_todo_btn.addEventListener("click", () => {
    add_todo_dialog.showModal();
  });

  //close dialog without save.
  todo_dialog_cancel.addEventListener("click", (e) => {
    e.stopPropagation();
    add_todo_dialog.close();
    eventIsEdit.value = "false";
  });
}

/**
 * @author Younus Ahmad
 * @summary Opens a popup asking whether user wants to logout
 */
function logout() {
  const logoutBtn = document.getElementById("calendar-title-bar-logout");
  const logoutDialog = document.getElementById("logout-dialog");
  const logoutCancel = document.getElementById("cancel-logout");
  const logoutConfirm = document.getElementById("confirm-logout");

  logoutBtn.addEventListener("click", () => {
    // auto save calendar to local storage
    saveJsonToLocalStorage(calendarData[0]);

    logoutDialog.showModal();
  });

  logoutConfirm.addEventListener("click", () => {
    location.href = "index.html";
  });

  logoutCancel.addEventListener("click", () => {
    logoutDialog.close();
  });
}
