// Improved Pet Tracker Calendar Script
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
  addEventFrom = document.querySelector(".event-time-from"),
  addEventTo = document.querySelector(".event-time-to"),
  addEventSubmit = document.querySelector(".add-event-btn"),
  eventTypeSelect = document.querySelector(".event-type");

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

// Initialize calendar
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;

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
});

document.addEventListener("click", (e) => {
  if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
    addEventWrapper.classList.remove("active");
    resetEventForm();
  }
});

// Form validation
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});

// Time input validation
function setupTimeInput(input) {
  input.addEventListener("input", (e) => {
    input.value = input.value.replace(/[^0-9:]/g, "");
    if (input.value.length === 2 && input.value.indexOf(':') === -1) {
      input.value += ":";
    }
    if (input.value.length > 5) {
      input.value = input.value.slice(0, 5);
    }
  });
}

setupTimeInput(addEventFrom);
setupTimeInput(addEventTo);

// Add/edit event
addEventSubmit.addEventListener("click", () => {
  const eventTitle = addEventTitle.value.trim();
  const eventTimeFrom = addEventFrom.value.trim();
  const eventTimeTo = addEventTo.value.trim();
  const eventType = eventTypeSelect.value;

  if (!eventTitle || !eventTimeFrom || !eventType) {
    showNotification("Please fill all required fields");
    return;
  }

  // Time validation
  if (!validateTime(eventTimeFrom) || (eventTimeTo && !validateTime(eventTimeTo))) {
    showNotification("Invalid time format (HH:MM)");
    return;
  }

  const timeString = eventTimeTo 
    ? `${convertTime(eventTimeFrom)} - ${convertTime(eventTimeTo)}`
    : convertTime(eventTimeFrom);

  const newEvent = {
    id: Date.now().toString(),
    title: eventTitle,
    time: timeString,
    type: eventType,
    notes: document.querySelector(".event-notes")?.value || ""
  };

  if (selectedEvent) {
    // Edit existing event
    updateEventInArray(newEvent);
    selectedEvent = null;
  } else {
    // Add new event
    addEventToArray(newEvent);
  }

  addEventWrapper.classList.remove("active");
  resetEventForm();
  updateEvents(activeDay);
  
  // Add event class to day if not present
  const activeDayEl = document.querySelector(`.day[data-day="${activeDay}"]`);
  if (activeDayEl && !activeDayEl.classList.contains("event")) {
    activeDayEl.classList.add("event");
  }
});

function addEventToArray(newEvent) {
  let eventAdded = false;
  
  // Check if there's already an event for this day
  for (const eventObj of eventsArr) {
    if (eventObj.day === activeDay && eventObj.month === month + 1 && eventObj.year === year) {
      eventObj.events.push(newEvent);
      eventAdded = true;
      break;
    }
  }

  if (!eventAdded) {
    eventsArr.push({
      day: activeDay,
      month: month + 1,
      year: year,
      events: [newEvent]
    });
  }

  saveEvents();
}

function updateEventInArray(updatedEvent) {
  for (const eventObj of eventsArr) {
    if (eventObj.day === activeDay && eventObj.month === month + 1 && eventObj.year === year) {
      const eventIndex = eventObj.events.findIndex(e => e.id === selectedEvent.id);
      if (eventIndex !== -1) {
        eventObj.events[eventIndex] = updatedEvent;
        saveEvents();
        return;
      }
    }
  }
}

// Event actions (edit/delete)
eventsContainer.addEventListener("click", (e) => {
  // Handle delete icon click
  if (e.target.classList.contains("delete-event") || 
      e.target.parentElement.classList.contains("delete-event")) {
    const eventElement = e.target.closest(".event");
    if (eventElement) {
      const eventId = eventElement.dataset.id;
      deleteEvent(eventId);
    }
    return;
  }
  
  // Handle edit icon click
  if (e.target.classList.contains("edit-event") || 
      e.target.parentElement.classList.contains("edit-event")) {
    const eventElement = e.target.closest(".event");
    if (eventElement) {
      const eventId = eventElement.dataset.id;
      editEvent(eventId);
    }
    return;
  }
  
  // Original event click handler (if you had one)
  if (e.target.classList.contains("event")) {
    // Your existing event click logic here
  }
});

// Update the todayBtn click handler to this:
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

// Update the addListner function to this:
function addListner() {
  const days = document.querySelectorAll(".day:not(.prev-date, .next-date)");
  days.forEach(day => {
    day.addEventListener("click", (e) => {
      const clickedDay = Number(e.target.dataset.day || e.target.textContent);
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

function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  for (let i = 0; i < eventsArr.length; i++) {
    const eventObj = eventsArr[i];
    if (eventObj.day === activeDay && eventObj.month === month + 1 && eventObj.year === year) {
      eventObj.events = eventObj.events.filter(event => event.id !== eventId);
      
      if (eventObj.events.length === 0) {
        eventsArr.splice(i, 1);
        const activeDayEl = document.querySelector(".day.active");
        if (activeDayEl) {
          activeDayEl.classList.remove("event");
        }
      }
      
      saveEvents();
      updateEvents(activeDay);
      break;
    }
  }
}

function editEvent(eventId) {
  for (const eventObj of eventsArr) {
    if (eventObj.day === activeDay && eventObj.month === month + 1 && eventObj.year === year) {
      const event = eventObj.events.find(e => e.id === eventId);
      if (event) {
        selectedEvent = event;
        
        // Parse time range if it exists
        let timeFrom = '', timeTo = '';
        if (event.time.includes('-')) {
          const [from, to] = event.time.split('-').map(t => t.trim());
          timeFrom = convertTo24Hour(from);
          timeTo = convertTo24Hour(to);
        } else {
          timeFrom = convertTo24Hour(event.time);
        }
        
        // Fill the form
        addEventTitle.value = event.title;
        addEventFrom.value = timeFrom;
        addEventTo.value = timeTo || '';
        eventTypeSelect.value = event.type || 'other';
        
        if (event.notes) {
          const notesInput = document.querySelector(".event-notes") || document.createElement('input');
          notesInput.type = 'text';
          notesInput.className = 'event-notes';
          notesInput.placeholder = 'Notes (optional)';
          notesInput.value = event.notes;
          if (!document.querySelector(".event-notes")) {
            addEventBody.insertBefore(notesInput, addEventFooter);
          }
        }
        
        addEventWrapper.classList.add("active");
        addEventTitle.focus();
        break;
      }
    }
  }
}

// Helper to convert display time to 24-hour format for editing
function convertTo24Hour(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (modifier === 'PM' && hours !== '12') {
    hours = parseInt(hours, 10) + 12;
  } else if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }
  
  return `${hours}:${minutes}`;
}

// Reset form
function resetEventForm() {
  addEventTitle.value = '';
  addEventFrom.value = '';
  addEventTo.value = '';
  eventTypeSelect.value = 'medical';
  const notesInput = document.querySelector(".event-notes");
  if (notesInput) notesInput.remove();
  selectedEvent = null;
  addEventSubmit.textContent = 'Add Event';
}

// Time validation
function validateTime(time) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Convert 24-hour time to 12-hour format
function convertTime(time) {
  let [hours, minutes] = time.split(':');
  const timeFormat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${timeFormat}`;
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Save/load events
function saveEvents() {
  localStorage.setItem("petCalendarEvents", JSON.stringify(eventsArr));
}

function getEvents() {
  const savedEvents = localStorage.getItem("petCalendarEvents");
  if (savedEvents) {
    eventsArr = JSON.parse(savedEvents);
  }
}

// Initialize
initEventTypes();
initCalendar();
