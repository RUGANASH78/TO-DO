<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = ""; // Change if you have set a password for the root user
$dbname = "todo_app"; // Ensure your database name matches

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_GET['action'];

    if ($action == 'add') {
        $taskName = $_POST['taskName'];
        $priority = $_POST['priority'];
        $dueDate = $_POST['dueDate'];
        $stmt = $conn->prepare("INSERT INTO tasks (task_name, priority, due_date) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $taskName, $priority, $dueDate);
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Task added successfully.']);
        } else {
            echo json_encode(['message' => 'Error adding task.']);
        }
        $stmt->close();
    } elseif ($action == 'edit') {
        $id = $_POST['id'];
        $taskName = $_POST['taskName'];
        $priority = $_POST['priority'];
        $dueDate = $_POST['dueDate'];
        $stmt = $conn->prepare("UPDATE tasks SET task_name = ?, priority = ?, due_date = ? WHERE id = ?");
        $stmt->bind_param("sssi", $taskName, $priority, $dueDate, $id);
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Task updated successfully.']);
        } else {
            echo json_encode(['message' => 'Error updating task.']);
        }
        $stmt->close();
    } elseif ($action == 'delete') {
        $id = $_POST['id'];
        $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Task deleted successfully.']);
        } else {
            echo json_encode(['message' => 'Error deleting task.']);
        }
        $stmt->close();
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $action = $_GET['action'];
    if ($action == 'fetch') {
        $result = $conn->query("SELECT * FROM tasks");
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }
        echo json_encode($tasks);
    }
}
if ($action == 'toggle') {
    $taskId = $_POST['taskId'];
    $completed = $_POST['completed'] == 'true' ? 1 : 0;

    $stmt = $conn->prepare("UPDATE tasks SET completed = ? WHERE id = ?");
    $stmt->bind_param("ii", $completed, $taskId);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Task updated successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Task could not be updated']);
    }
    $stmt->close();
}
if ($action == 'sort') {
    $sortBy = $_GET['sortBy'];
    $orderBy = "ORDER BY ";
    if ($sortBy === 'dueDate') {
        $orderBy .= "due_date ASC";
    } elseif ($sortBy === 'priority') {
        $orderBy .= "priority ASC";
    } else {
        $orderBy = "";
    }
    
    $result = $conn->query("SELECT * FROM tasks $orderBy");
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    echo json_encode($tasks);
}

$conn->close();
?>
