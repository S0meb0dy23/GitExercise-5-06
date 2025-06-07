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
    event => Number(event.day) === Number(date) && 
             Number(event.month) === Number(month + 1) && 
             Number(event.year) === Number(year)
  );

  console.log("dayEvents for selected date:", dayEvents);

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

    // Delete Event Data Base  
    fetch("delete-event.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        const eventObj = eventsArr.find(ev =>
          ev.day === activeDay && ev.month === month + 1 && ev.year === year
        );
        if (!eventObj) return;
        eventObj.events = eventObj.events.filter(ev => ev.id !== eventId);
        if (eventObj.events.length === 0) {
          eventsArr = eventsArr.filter(ev => !(ev.day === activeDay && ev.month === month + 1 && ev.year === year));
        }
        showNotification("Event deleted");
        getEvents();
      } else {
        showNotification("Failed to delete event.");
      }
    });

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

  fetch("add-event.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: eventTitle,
      type: eventType,
      time_from: timeFrom,
      time_to: timeTo,
      day: activeDay,
      month: month + 1,
      year: year
    })
  })
  .then(response => response.json())
  .then(data => {
  if (data.status === "success") {
    showNotification("Event Added");
    addEventWrapper.classList.remove("active");
    resetEventForm();
    getEvents();
    
    setTimeout(() => {
      const activeDayEl = document.querySelector(`.day[data-day="${activeDay}"]`);
      if (activeDayEl) {
        activeDayEl.click();
      }
    }, 100);
    
    } else {
      showNotification("Failed to add event.");
    }
  });
});


// Reset event form function
function resetEventForm() {
  addEventTitle.value = "";
  eventTypeSelect.value = eventTypes[0].id;
  initTimePickers();
}

// Get Event DB
function getEvents() {
  fetch("get-events.php")
    .then(response => response.json())
    .then(data => {
      eventsArr = convertEventsFromDB(data);
      console.log("eventsArr after fetch:", eventsArr);
      initCalendar();
    });
}

function convertEventsFromDB(data) {
  let eventsByDay = [];

  data.forEach(item => {
    let dayEntry = eventsByDay.find(ev =>
      ev.day === item.day && ev.month === item.month && ev.year === item.year
    );

    const eventData = {
      id: Number(item.id),
      title: item.title,
      type: item.type,
      time: `${item.time_from} - ${item.time_to}`,
      notes: ""
    };

    if (dayEntry) {
      dayEntry.events.push(eventData);
    } else {
      eventsByDay.push({
        day: item.day,
        month: item.month,
        year: item.year,
        events: [eventData]
      });
    }
  });

  return eventsByDay;
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

document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // In a complete app, this would show the corresponding tab content
            const tabId = button.getAttribute('data-tab');
            console.log(`Switching to tab: ${tabId}`);
            // You would typically have code here to show the corresponding content
            // document.querySelectorAll('.tab-content').forEach(content => {
            //     content.classList.remove('active');
            // });
            // document.getElementById(tabId).classList.add('active');
        });
    });

    // Notification button functionality
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            console.log('Notification button clicked');
            // This would typically open a notifications dropdown or panel
        });
    }

    // For demonstration, set the first tab as active by default
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
    }
});