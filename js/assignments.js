
/* ==========================================
   STUDY ARCHIVE
   Assignment Manager
   ========================================== */

const Assignments = {

    tasks: [],

    init() {
        this.tasks = StudyArchive.data.assignments || [];
        this.render();
        this.setupModal();
    },

    save() {
        StudyArchive.data.assignments = this.tasks;
        StudyArchive.save();
        this.render();
    },

    // Create a new assignment
    addTask(title, subject, dueDate, priority) {
        if (!title.trim()) return;

        this.tasks.push({
            id: Date.now(),
            title: title.trim(),
            subject,
            dueDate,
            priority,
            status: "todo",
            rewarded: false
        });

        this.save();
    },

    // Change task status
    changeStatus(id, status) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        task.status = status;

        if (status === "completed" && !task.rewarded) {
            task.rewarded = true;
            StudyArchive.addCrystals(20);
            this.notify("+20 crystals! Assignment completed.");
        }

        this.save();
    },

    // Delete an assignment
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.save();
    },

    // Render all assignment cards
    render() {
        const columns = {
            todo: document.getElementById("todoTasks"),
            progress: document.getElementById("progressTasks"),
            completed: document.getElementById("completedTasks")
        };

        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = "";
        });

        this.tasks.forEach(task => {
            const card = document.createElement("article");
            card.className = "task-card";

            const title = document.createElement("h3");
            title.textContent = task.title;

            const subject = document.createElement("span");
            subject.className = "task-subject";
            subject.textContent = task.subject || "General";

            const due = document.createElement("p");
            due.textContent = task.dueDate
                ? "Due: " + task.dueDate
                : "No deadline";

            const priority = document.createElement("span");
            priority.className = "task-priority";
            priority.textContent = "Priority: " + task.priority;

            card.append(subject, title, due, priority);

            const actions = document.createElement("div");
            actions.className = "task-actions";

            if (task.status !== "todo") {
                actions.appendChild(
                    this.makeButton("To Do", () =>
                        this.changeStatus(task.id, "todo")
                    )
                );
            }

            if (task.status !== "progress") {
                actions.appendChild(
                    this.makeButton("In Progress", () =>
                        this.changeStatus(task.id, "progress")
                    )
                );
            }

            if (task.status !== "completed") {
                actions.appendChild(
                    this.makeButton("Complete (+20 crystals)", () =>
                        this.changeStatus(task.id, "completed")
                    )
                );
            }

            actions.appendChild(
                this.makeButton("Delete", () =>
                    this.deleteTask(task.id)
                )
            );

            card.appendChild(actions);

            const column = columns[task.status];

            if (column) {
                column.appendChild(card);
            }
        });

        this.updateCounts();

        Object.entries(columns).forEach(([status, column]) => {
            if (column && column.children.length === 0) {
                const empty = document.createElement("p");
                empty.className = "empty-tasks";
                empty.textContent = "Nothing here just yet.";
                column.appendChild(empty);
            }
        });
    },

    makeButton(label, callback) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", callback);
        return button;
    },

    // Update board statistics
    updateCounts() {
        const counts = {
            todo: this.tasks.filter(task => task.status === "todo").length,
            progress: this.tasks.filter(task => task.status === "progress").length,
            completed: this.tasks.filter(task => task.status === "completed").length
        };

        document.getElementById("totalTasks").textContent = this.tasks.length;
        document.getElementById("todoCount").textContent = counts.todo;
        document.getElementById("progressCount").textContent = counts.progress;
        document.getElementById("completedCount").textContent = counts.completed;

        document.getElementById("todoBadge").textContent = counts.todo;
        document.getElementById("progressBadge").textContent = counts.progress;
        document.getElementById("completedBadge").textContent = counts.completed;
    },

    // Set up new assignment form
    setupModal() {
        const openButton = document.getElementById("openTaskModal");

        if (!openButton) return;

        openButton.addEventListener("click", () => {
            const title = prompt("What is the assignment called?");
            if (title === null || !title.trim()) return;

            const subject = prompt("What subject is it for?") || "General";
            const dueDate = prompt("When is it due? (Optional)") || "";
            const priority = prompt(
                "Priority: Low, Medium, or High",
                "Medium"
            ) || "Medium";

            this.addTask(title, subject, dueDate, priority);
        });
    },

    notify(message) {
        let notification = document.getElementById("assignmentNotification");

        if (!notification) {
            notification = document.createElement("div");
            notification.id = "assignmentNotification";
            notification.className = "dashboard-notification";
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add("visible");

        setTimeout(() => {
            notification.classList.remove("visible");
        }, 2500);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Assignments.init();
});
