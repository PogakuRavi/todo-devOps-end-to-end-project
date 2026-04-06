const API = "http://localhost:3000/todos";

function loadTasks() {
  fetch(API)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("taskList");
      list.innerHTML = "";
      data.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `${task.task} 
          <button onclick="deleteTask(${task.id})">X</button>`;
        list.appendChild(li);
      });
    });
}

function addTask() {
  const task = document.getElementById("taskInput").value;

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task })
  }).then(loadTasks);
}

function deleteTask(id) {
  fetch(`${API}/${id}`, { method: "DELETE" })
    .then(loadTasks);
}

loadTasks();
