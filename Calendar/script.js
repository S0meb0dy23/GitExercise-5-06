const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper"),
  addEventCloseBtn = document.querySelector(".close"),
  addEventTitle = document.querySelector(".event-name"),
  eventTypeSelect = document.querySelector(".event-type"),
  eventHourFrom = document.querySelector(".event-hour-from"),
  eventMinuteFrom = document.querySelector(".event-minute-from"),
  eventAmPmFrom = document.querySelector(".event-am-pm-from"),
  eventHourTo = document.querySelector(".event-hour-to"),
  eventMinuteTo = document.querySelector(".event-minute-to"),
  eventAmPmTo = document.querySelector(".event-am-pm-to"),
  addEventSubmit = document.querySelector(".add-event-btn");


// Event types for pet tracking
const eventTypes = [
  { id: 'medical', name: 'Medical', color: '#FF6B6B' },
  { id: 'grooming', name: 'Grooming', color: '#4ECDC4' },
  { id: 'vaccination', name: 'Vaccination', color: '#45B7D1' },
  { id: 'training', name: 'Training', color: '#FFBE0B' },
  { id: 'other', name: 'Other', color: '#A5A5A5' }
];

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();
let selectedEvent = null;
let editingEventId = null;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let eventsArr = [];
getEvents();

// Initialize event type dropdown
function initEventTypes() {
  eventTypeSelect.innerHTML = '';
  eventTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name;
    option.style.color = type.color;
    eventTypeSelect.appendChild(option);
  });
}

// Initialize time pickers
function initTimePickers() {
  // Add hours (1-12)
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    eventHourFrom.appendChild(option.cloneNode(true));
    eventHourTo.appendChild(option.cloneNode(true));
  }

  // Add minutes (00-55 in 5 min increments)
  for (let i = 0; i < 60; i += 5) {
  const option = document.createElement('option');
  const min = i.toString().padStart(2, '0');
  option.value = min;
  option.textContent = min;
  eventMinuteFrom.appendChild(option.cloneNode(true));
  eventMinuteTo.appendChild(option.cloneNode(true));
}

  // Set default times
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  eventHourFrom.value = hours;
  eventMinuteFrom.value = Math.ceil(now.getMinutes() / 5) * 5;
  if (eventMinuteFrom.value === '60') eventMinuteFrom.value = '55';
  eventAmPmFrom.value = ampm;
  
  // Set end time to 1 hour later
  const endTime = new Date(now.getTime() + 60 * 60 * 1000);
  hours = endTime.getHours();
  const endAmpm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  eventHourTo.value = hours;
  eventMinuteTo.value = Math.ceil(endTime.getMinutes() / 5) * 5;
  if (eventMinuteTo.value === '60') eventMinuteTo.value = '55';
  eventAmPmTo.value = endAmpm;
}

// Initialize calendar
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = (7 - lastDay.getDay() - 1 + 7) % 7;

  date.innerHTML = `${months[month]} ${year}`;

  let days = "";

  // Previous month days
  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    const hasEvent = eventsArr.some(
      eventObj => eventObj.day === i && 
      eventObj.month === month + 1 && 
      eventObj.year === year
    );

    const isToday = 
      i === today.getDate() && 
      year === today.getFullYear() && 
      month === today.getMonth();

    let dayClasses = "day";
    if (isToday) dayClasses += " today";
    if (i === activeDay) dayClasses += " active";
    if (hasEvent) dayClasses += " event";

    if (isToday && !activeDay) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
    }

    days += `<div class="${dayClasses}" data-day="${i}">${i}</div>`;
  }

  // Next month days
  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }

  daysContainer.innerHTML = days;
  addListner();

  // Update active day display if no day is selected
  if (!activeDay) {
    activeDay = today.getDate();
    getActiveDay(activeDay);
    updateEvents(activeDay);
  }
}

// Navigation functions
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

// Day click handler
function addListner() {
  const days = document.querySelectorAll(".day:not(.prev-date, .next-date)");
  days.forEach(day => {
    day.addEventListener("click", (e) => {
      const clickedDay = Number(e.target.dataset.day);
      activeDay = clickedDay;
      getActiveDay(clickedDay);
      updateEvents(clickedDay);
      
      // Remove active class from all days
      days.forEach(d => d.classList.remove("active"));
      
      // Add active class to clicked day
      e.target.classList.add("active");
    });
  });
}

// Today button
todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  activeDay = today.getDate();
  initCalendar();
  
  // Force update the events display
  setTimeout(() => {
    const activeDayEl = document.querySelector(`.day[data-day="${activeDay}"]`);
    if (activeDayEl) {
      activeDayEl.click();
    }
  }, 50);
});

// Date input validation
dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2 && dateInput.value.indexOf('/') === -1) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
});

// Go to date function
gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    const monthInput = parseInt(dateArr[0]);
    const yearInput = parseInt(dateArr[1]);
    
    if (monthInput > 0 && monthInput < 13 && !isNaN(yearInput) && yearInput.toString().length === 4) {
      month = monthInput - 1;
      year = yearInput;
      initCalendar();
      return;
    }
  }
  showNotification("Invalid Date Format (MM/YYYY)");
}

// Show active day info
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = weekdays[day.getDay()];
  const dateString = `${date}${getDaySuffix(date)} ${months[month]} ${year}`;
  
  eventDay.innerHTML = dayName;
  eventDay.style.textTransform = "capitalize";
  eventDate.innerHTML = dateString;
}

// Helper for day suffix (1st, 2nd, etc.)
function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Update events display
function updateEvents(date) {
  const dayEvents = eventsArr.filter(
    event => event.day === date && 
    event.month === month + 1 && 
    event.year === year
  );

  eventsContainer.innerHTML = dayEvents.length > 0 
    ? dayEvents[0].events.map(event => createEventElement(event)).join("")
    : `<div class="no-event"><h3>No Events</h3></div>`;
    addEventActions();
}

function addEventActions() {
  // Edit Event
  const editIcons = document.querySelectorAll(".edit-event");
  editIcons.forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const eventId = Number(e.target.closest(".event").dataset.id);
      const eventObj = eventsArr.find(
        ev => ev.day === activeDay && ev.month === month + 1 && ev.year === year
      );
      if (!eventObj) return;
      const event = eventObj.events.find(ev => ev.id === eventId);
      if (!event) return;

      // Set editing ID globally
      editingEventId = eventId;

      // Prefill form
      addEventWrapper.classList.add("active");
      addEventTitle.value = event.title;
      eventTypeSelect.value = event.type;

      const [from, to] = event.time.split(" - ");
      const [fromHour, fromMinuteAmPm] = from.split(":");
      const [fromMinute, fromAmPm] = fromMinuteAmPm.split(" ");
      const [toHour, toMinuteAmPm] = to.split(":");
      const [toMinute, toAmPm] = toMinuteAmPm.split(" ");

      eventHourFrom.value = fromHour;
      eventMinuteFrom.value = fromMinute;
      eventAmPmFrom.value = fromAmPm;

      eventHourTo.value = toHour;
      eventMinuteTo.value = toMinute;
      eventAmPmTo.value = toAmPm;
    });
  });

  // Delete Event
  const deleteIcons = document.querySelectorAll(".delete-event");
  deleteIcons.forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const confirmDelete = confirm("Are you sure you want to delete this event?");
      if (!confirmDelete) return;

      const eventId = Number(e.target.closest(".event").dataset.id);
      const eventObj = eventsArr.find(
        ev => ev.day === activeDay && ev.month === month + 1 && ev.year === year
      );
      if (!eventObj) return;

      // Remove event from array
      eventObj.events = eventObj.events.filter(ev => ev.id !== eventId);
      if (eventObj.events.length === 0) {
        // Remove day if no events left
        eventsArr = eventsArr.filter(
          ev => !(ev.day === activeDay && ev.month === month + 1 && ev.year === year)
        );
      }

      saveEvents();
      updateEvents(activeDay);

      const dayEl = document.querySelector(`.day[data-day="${activeDay}"]`);
      const stillHasEvents = eventsArr.some(ev => ev.day === activeDay && ev.month === month + 1 && ev.year === year);
      if (dayEl && !stillHasEvents) {
        dayEl.classList.remove("event");
      }

      showNotification("Event deleted");
    });
  });
}

// Create event HTML element
function createEventElement(event) {
  const eventType = eventTypes.find(t => t.id === event.type) || eventTypes[eventTypes.length - 1];
  return `
    <div class="event" data-id="${event.id}" style="border-left: 4px solid ${eventType.color}">
      <div class="title">
        <i class="fas fa-circle" style="color: ${eventType.color}"></i>
        <h3 class="event-title">${event.title}</h3>
      </div>
      <div class="event-time">
        <span>${event.time}</span>
        <div class="event-actions">
          <i class="fas fa-edit edit-event" title="Edit"></i>
          <i class="fas fa-trash delete-event" title="Delete"></i>
        </div>
      </div>
      ${event.notes ? `<div class="event-notes">${event.notes}</div>` : ''}
    </div>`;
}

// Event management
addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.add("active");
  addEventTitle.focus();
});

addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
  resetEventForm();
  editingEventId = null;
});

document.addEventListener("click", (e) => {
  if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
    addEventWrapper.classList.remove("active");
    resetEventForm();
    editingEventId = null;
  }
});

// Form validation
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});

// Add/edit event
addEventSubmit.addEventListener("click", () => {
  const eventTitle = addEventTitle.value.trim();
  const eventType = eventTypeSelect.value;
  

  if (!eventTitle || !eventType) {
    showNotification("Please fill all required fields");
    return;
  }

  const startHour = eventHourFrom.value;
  const startMinute = eventMinuteFrom.value;
  const startAmPm = eventAmPmFrom.value;
  const endHour = eventHourTo.value;
  const endMinute = eventMinuteTo.value;
  const endAmPm = eventAmPmTo.value;
  const timeFrom = `${startHour}:${startMinute} ${startAmPm}`;
  const timeTo = `${endHour}:${endMinute} ${endAmPm}`;
  const eventTime = `${timeFrom} - ${timeTo}`;

 const newEvent = {
  id: editingEventId ? editingEventId : Date.now(),
  title: eventTitle,
  type: eventType,
  time: eventTime,
  notes: ""
  };

  let eventObj = eventsArr.find(
    event => event.day === activeDay &&
             event.month === month + 1 &&
             event.year === year
  );

  if (eventObj) {
    // If editing, replace event
    if (editingEventId) {
      eventObj.events = eventObj.events.map(ev => ev.id === editingEventId ? newEvent : ev);
    } else {
      eventObj.events.push(newEvent);
    }
  } else {
    eventsArr.push({
      day: activeDay,
      month: month + 1,
      year: year,
      events: [newEvent]
    });
  }

  saveEvents();
  updateEvents(activeDay);
  addEventWrapper.classList.remove("active");
  resetEventForm();

  const dayEl = document.querySelector(`.day[data-day="${activeDay}"]`);
  if (dayEl && !dayEl.classList.contains("event")) {
    dayEl.classList.add("event");
  }

  showNotification(editingEventId ? "Event Updated" : "Event Added");

  // Clear editing mode
  editingEventId = null;
});

// Reset event form function
function resetEventForm() {
  addEventTitle.value = "";
  eventTypeSelect.value = eventTypes[0].id;
  initTimePickers();
}

// Load events from localStorage
function getEvents() {
  const stored = localStorage.getItem("events");
  if (stored) {
    eventsArr = JSON.parse(stored);
  }
}

// Save events to localStorage
function saveEvents() {
  localStorage.setItem("events", JSON.stringify(eventsArr));
}

// Quick notification popup (basic example)
function showNotification(message) {
  let notification = document.querySelector(".notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.className = "notification";
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2500);
}

// Initialize everything on load
initEventTypes();
initTimePickers();
initCalendar();
