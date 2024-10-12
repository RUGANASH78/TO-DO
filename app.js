document.getElementById("addTaskButton").addEventListener("click", function() {
    const taskName = document.getElementById("taskName").value;
    const priority = document.getElementById("priority").value;
    const dueDate = document.getElementById("dueDate").value;

    if (taskName && dueDate) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "tasks.php?action=add", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                alert(JSON.parse(xhr.responseText).message);
                fetchTasks(); // Fetch tasks after adding
                clearInputs(); // Clear input fields after adding
            }
        };

        xhr.send(`taskName=${encodeURIComponent(taskName)}&priority=${encodeURIComponent(priority)}&dueDate=${encodeURIComponent(dueDate)}`);
    } else {
        alert("Please fill in all fields.");
    }
});

function fetchTasks() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "tasks.php?action=fetch", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const tasks = JSON.parse(xhr.responseText);
            displayTasks(tasks);
        }
    };
    xhr.send();
}

function displayTasks(tasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Clear existing tasks
    tasks.forEach(function(task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <input type="checkbox" onchange="toggleTaskCompletion(${task.id}, this.checked)" ${task.completed ? 'checked' : ''}>
            <strong ${task.completed ? 'style="text-decoration: line-through;"' : ''}>${task.task_name}</strong>
            - Due: ${task.due_date} 
            - Priority: ${task.priority}
            <button onclick="editTask(${task.id}, '${task.task_name}', '${task.priority}', '${task.due_date}')">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(taskItem);
    });
}

function clearInputs() {
    document.getElementById("taskName").value = "";
    document.getElementById("dueDate").value = "";
    document.getElementById("priority").value = "Low"; // Reset to default
}

function editTask(id, taskName, priority, dueDate) {
    document.getElementById("taskName").value = taskName;
    document.getElementById("priority").value = priority;
    document.getElementById("dueDate").value = dueDate;
    const addTaskButton = document.getElementById("addTaskButton");
    addTaskButton.innerText = "Update Task";

    addTaskButton.onclick = function() {
        const updatedTaskName = document.getElementById("taskName").value;
        const updatedPriority = document.getElementById("priority").value;
        const updatedDueDate = document.getElementById("dueDate").value;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "tasks.php?action=edit", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                alert(JSON.parse(xhr.responseText).message);
                fetchTasks(); // Fetch updated tasks
                clearInputs(); // Clear input fields
                addTaskButton.innerText = "Add Task"; // Reset button text
                addTaskButton.onclick = null; // Remove onclick handler
            }
        };

        xhr.send(`id=${id}&taskName=${encodeURIComponent(updatedTaskName)}&priority=${encodeURIComponent(updatedPriority)}&dueDate=${encodeURIComponent(updatedDueDate)}`);
    };
}

function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "tasks.php?action=delete", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                alert(JSON.parse(xhr.responseText).message);
                fetchTasks(); // Fetch updated tasks
            }
        };

        xhr.send(`id=${id}`);
    }
}

function toggleTaskCompletion(taskId, completed) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "tasks.php?action=toggle", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`taskId=${taskId}&completed=${completed}`);
}

function sortTasks() {
    const sortOption = document.getElementById("sortOptions").value;
    let sortedTasks = [...tasks]; // Create a shallow copy of tasks

    if (sortOption === "dueDate") {
        sortedTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    } else if (sortOption === "priority") {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    displayTasks(sortedTasks); // Update displayed tasks
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

function checkDueDates() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "tasks.php?action=fetch", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const tasks = JSON.parse(xhr.responseText);
            const currentDate = new Date();

            tasks.forEach(function(task) {
                const dueDate = new Date(task.due_date);
                if (dueDate - currentDate <= 24 * 60 * 60 * 1000 && !task.completed) { // Due within 24 hours
                    alert(`Reminder: Task "${task.task_name}" is due tomorrow!`);
                }
            });
        }
    };
    xhr.send();
}

// Call checkDueDates and fetchTasks on page load
window.onload = function() {
    checkDueDates();
    fetchTasks();
};
