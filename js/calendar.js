
/* =====================================
   STUDY ARCHIVE — GOOGLE-STYLE CALENDAR
   ===================================== */

const Calendar = {
    currentDate: new Date(),
    selectedDate: new Date(),
    currentView: "month",
    events: [],
    lastFocusedElement: null,

    init() {
        if (!window.StudyArchive) {
            console.error("StudyArchive did not load. Check the main.js script path.");
            return;
        }

        this.events = Array.isArray(StudyArchive.data.calendarEvents)
            ? StudyArchive.data.calendarEvents
            : [];
        this.bindControls();
        this.render();
    },

    // Use local dates instead of UTC to avoid date shifting.
    dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    },

    parseDate(value) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    },

    sameDay(a, b) {
        return this.dateKey(a) === this.dateKey(b);
    },

    startOfWeek(date) {
        const result = new Date(date);
        result.setDate(result.getDate() - result.getDay());
        result.setHours(0, 0, 0, 0);
        return result;
    },

    formatTime(time) {
        if (!time) return "";
        const [hours, minutes] = time.split(":").map(Number);
        const suffix = hours >= 12 ? "PM" : "AM";
        const displayHour = hours % 12 || 12;
        return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
    },

    bindControls() {
        document.getElementById("previousMonth").addEventListener("click", () => {
            this.moveDate(-1);
        });

        document.getElementById("nextMonth").addEventListener("click", () => {
            this.moveDate(1);
        });

        document.getElementById("todayButton").addEventListener("click", () => {
            this.currentDate = new Date();
            this.selectedDate = new Date();
            this.render();
        });

        document.getElementById("addEventButton").addEventListener("click", () => {
            this.openModal();
        });

        document.getElementById("closeEventModal").addEventListener("click", () => {
            this.closeModal();
        });

        document.getElementById("cancelEventButton").addEventListener("click", () => {
            this.closeModal();
        });

        document.getElementById("eventModal").addEventListener("click", (event) => {
            if (event.target.id === "eventModal") this.closeModal();
        });

        document.getElementById("eventForm").addEventListener("submit", (event) => {
            event.preventDefault();
            this.saveEvent();
        });

        document.getElementById("deleteEventButton").addEventListener("click", () => {
            this.deleteEvent();
        });

        document.getElementById("eventAllDay").addEventListener("change", (event) => {
            document.getElementById("timeFields").style.display =
                event.target.checked ? "none" : "grid";
        });

        document.querySelectorAll(".view-button").forEach(button => {
            button.addEventListener("click", () => {
                this.currentView = button.dataset.view;

                document.querySelectorAll(".view-button").forEach(item => {
                    item.classList.toggle("active", item === button);
                });

                this.render();
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.closeModal();
        });
    },

    moveDate(direction) {
        if (this.currentView === "day") {
            this.currentDate.setDate(this.currentDate.getDate() + direction);
        } else if (this.currentView === "week") {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else {
            const day = this.currentDate.getDate();
            this.currentDate.setDate(1);
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
            const lastDay = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth() + 1,
                0
            ).getDate();
            this.currentDate.setDate(Math.min(day, lastDay));
        }

        this.selectedDate = new Date(this.currentDate);
        this.render();
    },

    save() {
        StudyArchive.data.calendarEvents = this.events;
        StudyArchive.save();
        this.render();
    },

    render() {
        this.renderHeading();
        this.renderCalendar();
        this.renderMiniCalendar();
        this.renderUpcoming();
    },

    renderHeading() {
        const heading = document.getElementById("calendarMonth");
        const options = { month: "long", year: "numeric" };

        if (this.currentView === "day") {
            heading.textContent = this.currentDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
        } else if (this.currentView === "week") {
            const start = this.startOfWeek(this.currentDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);

            heading.textContent =
                `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ` +
                `${end.toLocaleDateString(undefined, options)}`;
        } else {
            heading.textContent = this.currentDate.toLocaleDateString(undefined, options);
        }
    },

    renderCalendar() {
        const container = document.getElementById("calendarView");

        if (this.currentView === "month") {
            container.innerHTML = this.buildMonthView();
        } else {
            container.innerHTML = this.buildTimeView();
        }
    },

    buildMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const gridStart = new Date(year, month, 1 - firstDay.getDay());
        const today = new Date();

        let html = `<div class="month-grid">`;

        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
            html += `<div class="month-weekday">${day}</div>`;
        });

        for (let i = 0; i < 42; i++) {
            const date = new Date(gridStart);
            date.setDate(gridStart.getDate() + i);

            const key = this.dateKey(date);
            const isToday = this.sameDay(date, today);
            const isSelected = this.sameDay(date, this.selectedDate);
            const isOtherMonth = date.getMonth() !== month;

            const classes = [
                "month-day",
                isToday ? "today" : "",
                isSelected ? "selected" : "",
                isOtherMonth ? "other-month" : ""
            ].filter(Boolean).join(" ");

            const dayEvents = this.events
                .filter(event => event.date === key)
                .sort((a, b) => (a.start || "").localeCompare(b.start || ""));

            html += `
                <div class="${classes}" data-date="${key}">
                    <span class="day-number">${date.getDate()}</span>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <button class="calendar-event ${this.getEventColor(event)}"
                                data-event-id="${this.escapeHTML(event.id)}"
                                title="${this.escapeHTML(event.title)}">
                                ${event.allDay ? "" : this.formatTime(event.start) + " "}
                                ${this.escapeHTML(event.title)}
                            </button>
                        `).join("")}
                        ${dayEvents.length > 3
                            ? `<span class="more-events">+${dayEvents.length - 3} more</span>`
                            : ""}
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        return html;
    },

    buildTimeView() {
        const days = [];

        if (this.currentView === "day") {
            days.push(new Date(this.currentDate));
        } else {
            const start = this.startOfWeek(this.currentDate);

            for (let i = 0; i < 7; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                days.push(date);
            }
        }

        let html = `<div class="time-grid" style="--day-count:${days.length}">`;

        html += `<div class="time-header"></div>`;

        days.forEach(date => {
            const todayClass = this.sameDay(date, new Date()) ? "today" : "";
            html += `
                <div class="time-header ${todayClass}">
                    ${date.toLocaleDateString(undefined, { weekday: "short" })}
                    <strong>${date.getDate()}</strong>
                </div>
            `;
        });

        html += `<div class="time-label all-day-label">All day</div>`;
        days.forEach(date => {
            const key = this.dateKey(date);
            const allDayEvents = this.events.filter(event =>
                event.date === key && event.allDay
            );

            html += `
                <div class="time-slot all-day-slot" data-date="${key}">
                    ${allDayEvents.map(event => `
                        <button class="calendar-event ${this.getEventColor(event)}"
                            data-event-id="${this.escapeHTML(event.id)}">
                            ${this.escapeHTML(event.title)}
                        </button>
                    `).join("")}
                </div>
            `;
        });

        for (let hour = 0; hour < 24; hour++) {
            const label = new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, {
                hour: "numeric"
            });

            html += `<div class="time-label">${label}</div>`;

            days.forEach(date => {
                const key = this.dateKey(date);
                const isToday = this.sameDay(date, new Date());

                const events = this.events.filter(event => {
                    if (event.date !== key || event.allDay || !event.start) return false;
                    return Number(event.start.split(":")[0]) === hour;
                });

                html += `
                    <div class="time-slot ${isToday ? "today-column" : ""}"
                         data-date="${key}" data-hour="${hour}">
                        ${events.map(event => {
                            const startParts = event.start.split(":").map(Number);
                            const endParts = (event.end || event.start).split(":").map(Number);
                            const startMinutes = startParts[0] * 60 + startParts[1];
                            let endMinutes = endParts[0] * 60 + endParts[1];

                            if (endMinutes <= startMinutes) endMinutes = startMinutes + 30;

                            const duration = Math.max(20, endMinutes - startMinutes);
                            const top = (startParts[1] / 60) * 58;
                            const height = Math.max(25, (duration / 60) * 58);

                            return `
                                <button class="timed-event ${this.getEventColor(event)}"
                                    data-event-id="${this.escapeHTML(event.id)}"
                                    style="top:${top}px;height:${height}px">
                                    <strong>${this.escapeHTML(event.title)}</strong>
                                    ${this.formatTime(event.start)}
                                </button>
                            `;
                        }).join("")}
                    </div>
                `;
            });
        }

        html += `</div>`;
        return html;
    },

    renderMiniCalendar() {
        const container = document.getElementById("miniCalendar");
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const start = new Date(year, month, 1 - new Date(year, month, 1).getDay());
        const today = new Date();

        let html = `<div class="mini-grid">`;

        ["S", "M", "T", "W", "T", "F", "S"].forEach(day => {
            html += `<div class="mini-weekday">${day}</div>`;
        });

        for (let i = 0; i < 42; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            const classes = [
                "mini-day",
                date.getMonth() !== month ? "muted" : "",
                this.sameDay(date, today) ? "today" : "",
                this.sameDay(date, this.selectedDate) ? "selected" : ""
            ].filter(Boolean).join(" ");

            html += `
                <button class="${classes}" data-mini-date="${this.dateKey(date)}">
                    ${date.getDate()}
                </button>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    renderUpcoming() {
        const container = document.getElementById("upcomingEvents");
        const todayKey = this.dateKey(new Date());

        const upcoming = [...this.events]
            .filter(event => event.date >= todayKey)
            .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return (a.start || "").localeCompare(b.start || "");
            })
            .slice(0, 7);

        if (!upcoming.length) {
            container.innerHTML = `<p class="empty-calendar-message">Nothing scheduled yet. Add an event to get started!</p>`;
            return;
        }

        container.innerHTML = upcoming.map(event => {
            const date = this.parseDate(event.date);
            const dateLabel = date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
            });

            const timeLabel = event.allDay
                ? "All day"
                : this.formatTime(event.start);

            return `
                <button class="upcoming-event" data-upcoming-event-id="${this.escapeHTML(event.id)}">
                <span class="upcoming-color ${this.getEventColor(event)}"></span>
                <span class="upcoming-information">
                        <strong>${this.escapeHTML(event.title)}</strong>
                        <span>${dateLabel} · ${timeLabel}</span>
                </span>
                </button>
            `;
        }).join("");
    },

    openModal(event = null, date = null, hour = null) {
        const modal = document.getElementById("eventModal");
        const form = document.getElementById("eventForm");

        this.lastFocusedElement = document.activeElement;
        form.reset();

        document.getElementById("eventId").value = event ? event.id : "";
        document.getElementById("eventTitle").value = event ? event.title : "";
        document.getElementById("eventDate").value =
            event ? event.date : (date || this.dateKey(this.selectedDate));
        document.getElementById("eventColor").value = event
            ? this.getEventColor(event)
            : "blue";
        document.getElementById("eventAllDay").checked = event ? !!event.allDay : false;
        const defaultStartHour = Math.min(hour ?? 9, 23);
        const defaultEnd = defaultStartHour === 23
            ? "23:59"
            : `${String(defaultStartHour + 1).padStart(2, "0")}:00`;
        document.getElementById("eventStart").value =
            event ? (event.start || "09:00") : `${String(defaultStartHour).padStart(2, "0")}:00`;
        document.getElementById("eventEnd").value =
            event ? (event.end || "10:00") : defaultEnd;
        document.getElementById("eventDescription").value =
            event ? (event.description || "") : "";

        document.getElementById("eventModalTitle").textContent =
            event ? "Edit event" : "Create an event";

        document.getElementById("deleteEventButton").hidden = !event;
        document.getElementById("timeFields").style.display =
            event && event.allDay ? "none" : "grid";

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");

        setTimeout(() => document.getElementById("eventTitle").focus(), 50);
    },

    closeModal() {
        const modal = document.getElementById("eventModal");
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        if (this.lastFocusedElement instanceof HTMLElement) {
            this.lastFocusedElement.focus();
        }
    },

    saveEvent() {
        const id = document.getElementById("eventId").value;
        const title = document.getElementById("eventTitle").value.trim();
        const date = document.getElementById("eventDate").value;
        const allDay = document.getElementById("eventAllDay").checked;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value;

        if (!title || !date) return;

        if (!allDay && (!start || !end || end <= start)) {
            alert("Please choose an end time that is later than the start time.");
            return;
        }

        const eventData = {
            id: id || String(Date.now()),
            title,
            date,
            allDay,
            start: allDay ? "" : start,
            end: allDay ? "" : end,
            color: document.getElementById("eventColor").value,
            description: document.getElementById("eventDescription").value.trim()
        };

        const previousEvents = this.events;
        this.events = id
            ? this.events.map(event =>
                String(event.id) === String(id) ? eventData : event
            )
            : [...this.events, eventData];

        this.currentDate = this.parseDate(date);
        this.selectedDate = this.parseDate(date);

        try {
            this.save();
            this.closeModal();
        } catch (error) {
            this.events = previousEvents;
            StudyArchive.data.calendarEvents = previousEvents;
            console.error("Could not save calendar event:", error);
            alert("The event could not be saved. Check your browser storage and try again.");
        }
    },

    deleteEvent() {
        const id = document.getElementById("eventId").value;
        if (!id) return;

        if (!confirm("Delete this event?")) return;

        const previousEvents = this.events;
        this.events = this.events.filter(event => String(event.id) !== String(id));

        try {
            this.save();
            this.closeModal();
        } catch (error) {
            this.events = previousEvents;
            StudyArchive.data.calendarEvents = previousEvents;
            console.error("Could not delete calendar event:", error);
            alert("The event could not be deleted. Check your browser storage and try again.");
        }
    },

    getEventColor(event) {
        const colors = ["blue", "lavender", "pink", "green", "yellow"];
        return colors.includes(event.color) ? event.color : "blue";
    },

    escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }
};

// Handle clicks on calendar cells and events.
document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;

    const eventButton = event.target.closest("[data-event-id], [data-upcoming-event-id]");

    if (eventButton) {
        event.stopPropagation();
        const eventId = eventButton.dataset.eventId || eventButton.dataset.upcomingEventId;
        const selectedEvent = Calendar.events.find(item =>
            String(item.id) === String(eventId)
        );

        if (selectedEvent) Calendar.openModal(selectedEvent);
        return;
    }

    const miniDay = event.target.closest("[data-mini-date]");

    if (miniDay) {
        const date = Calendar.parseDate(miniDay.dataset.miniDate);
        Calendar.selectedDate = date;
        Calendar.currentDate = new Date(date);
        Calendar.render();
        return;
    }

    const monthDay = event.target.closest(".month-day");

    if (monthDay) {
        const date = Calendar.parseDate(monthDay.dataset.date);
        Calendar.selectedDate = date;
        Calendar.currentDate = new Date(date);
        Calendar.openModal(null, monthDay.dataset.date);
        return;
    }

    const timeSlot = event.target.closest(".time-slot");

    if (timeSlot) {
        const hour = Number(timeSlot.dataset.hour ?? 9);
        const date = Calendar.parseDate(timeSlot.dataset.date);

        Calendar.selectedDate = date;
        Calendar.currentDate = new Date(date);
        Calendar.openModal(null, timeSlot.dataset.date, hour);
    }
});

window.Calendar = Calendar;

document.addEventListener("DOMContentLoaded", () => {
    Calendar.init();
});