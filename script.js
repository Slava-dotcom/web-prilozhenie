document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("add-task-btn");
    const prioritySelect = document.getElementById("priority-select");
    const taskList = document.getElementById("task-list");
    const clearAllBtn = document.getElementById("clear-all-btn");
    const sortTasksBtn = document.getElementById("sort-tasks-btn");
    const filterDateInput = document.getElementById("filter-date-input");
    const filterTasksBtn = document.getElementById("filter-tasks-btn");
    const filterPriorityBtn = document.getElementById("filter-priority-btn");
    const filterStatusBtn = document.getElementById("filter-status-btn");
    const showAllTasksBtn = document.getElementById("show-all-tasks-btn");
    const searchInput = document.getElementById("search-input");

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach(task => addTask(task.text, task.date, task.priority, task.notes, task.completed));

    addTaskBtn.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        const taskPriority = prioritySelect.value;
        if (taskText !== "") {
            addTask(taskText, "", taskPriority);
            taskInput.value = "";
            clearAllBtn.style.display = "inline-block"; 
        }
    });

    function addTask(taskText, taskDate = "", taskPriority = "low", taskNotes = "", completed = false) {
        const li = document.createElement("li");
        li.classList.add(`${taskPriority}-priority`);
        if (completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <div class="flex">
                <span class="task-text">${taskText}</span>
                <input type="datetime-local" class="expected-completion" value="${taskDate}">
            </div>
            <div class="flex">
                <span class="task-date">${taskDate ? `Дата выполнения: ${new Date(taskDate).toLocaleString()}` : ''}</span>
                <button class="edit-btn">Редактировать</button>
                <button class="notes-btn">Заметки</button>
                <button class="complete-btn">${completed ? 'Не выполнено' : 'Выполнено'}</button>
                <button class="delete-btn">Удалить</button>
            </div>
            <div class="task-notes" style="display: ${taskNotes ? 'block' : 'none'};">${taskNotes}</div>
        `;

        const dateInput = li.querySelector(".expected-completion");
        dateInput.addEventListener("change", function () {
            const taskDate = li.querySelector(".task-date");
            taskDate.textContent = `Дата выполнения: ${new Date(dateInput.value).toLocaleString()}`;
            saveTasks();
        });

        const editBtn = li.querySelector(".edit-btn");
        editBtn.addEventListener("click", function () {
            editTask(li);
        });

        const notesBtn = li.querySelector(".notes-btn");
        notesBtn.addEventListener("click", function () {
            addNotes(li);
        });

        const completeBtn = li.querySelector(".complete-btn");
        completeBtn.addEventListener("click", function () {
            li.classList.toggle("completed");
            completeBtn.textContent = li.classList.contains("completed") ? 'Не выполнено' : 'Выполнено';
            saveTasks();
        });

        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
            li.classList.add("removing");
            setTimeout(() => {
                li.remove();
                saveTasks();
                if (taskList.children.length === 0) {
                    clearAllBtn.style.display = "none"; 
                }
            }, 300);
        });

        taskList.appendChild(li);
        setTimeout(() => li.classList.add("show"), 10);
        saveTasks();
        checkDueSoon();
    }

    function editTask(li) {
        const taskText = li.querySelector(".task-text");
        const newText = prompt("Редактировать задачу:", taskText.textContent);
        if (newText !== null) {
            taskText.textContent = newText.trim();
            saveTasks();
        }
    }

    function addNotes(li) {
        const taskNotes = li.querySelector(".task-notes");
        const newNotes = prompt("Добавить/изменить заметки:", taskNotes.textContent);
        if (newNotes !== null) {
            taskNotes.textContent = newNotes.trim();
            taskNotes.style.display = newNotes.trim() ? "block" : "none";
            saveTasks();
        }
    }

    taskInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            addTaskBtn.click();
        }
    });

    clearAllBtn.addEventListener("click", function () {
        Array.from(taskList.children).forEach(task => {
            task.classList.add("removing");
            setTimeout(() => task.remove(), 300);
        });
        saveTasks();
        clearAllBtn.style.display = "none"; 
    });

    sortTasksBtn.addEventListener("click", function () {
        const tasks = Array.from(taskList.children);
        tasks.sort((a, b) => {
            const dateA = a.querySelector(".expected-completion").value;
            const dateB = b.querySelector(".expected-completion").value;
            if (!dateA) return 1; // Если дата не задана, перемещаем задачу в конец
            if (!dateB) return -1; // Если дата не задана, перемещаем задачу в конец
            return new Date(dateA) - new Date(dateB);
        });
        tasks.forEach(task => taskList.appendChild(task));
        saveTasks();
    });

    filterTasksBtn.addEventListener("click", function () {
        const filterDate = filterDateInput.value;
        if (!filterDate) return;

        Array.from(taskList.children).forEach(task => {
            const taskDate = task.querySelector(".expected-completion").value;
            if (taskDate.startsWith(filterDate)) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });

        filterDateInput.value = ""; // Сброс даты после фильтрации
        showAllTasksBtn.style.display = "inline-block"; // Показываем кнопку для возврата к полному списку
    });

    filterPriorityBtn.addEventListener("click", function () {
        const selectedPriority = prioritySelect.value;

        Array.from(taskList.children).forEach(task => {
            const isPriorityMatch = task.classList.contains(`${selectedPriority}-priority`);
            task.style.display = isPriorityMatch ? "flex" : "none";
        });

        showAllTasksBtn.style.display = "inline-block"; // Показываем кнопку для возврата к полному списку
    });

    filterStatusBtn.addEventListener("click", function () {
        const filterStatus = prompt("Введите статус (completed для выполненных, not-completed для невыполненных):").toLowerCase();

        Array.from(taskList.children).forEach(task => {
            const isCompleted = task.classList.contains("completed");
            if (filterStatus === "completed" && isCompleted) {
                task.style.display = "flex";
            } else if (filterStatus === "not-completed" && !isCompleted) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });

        showAllTasksBtn.style.display = "inline-block"; // Показываем кнопку для возврата к полному списку
    });

    showAllTasksBtn.addEventListener("click", function () {
        Array.from(taskList.children).forEach(task => {
            task.style.display = "flex";
        });

        showAllTasksBtn.style.display = "none"; // Скрываем кнопку после возврата к полному списку
    });

    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();
        Array.from(taskList.children).forEach(task => {
            const taskText = task.querySelector(".task-text").textContent.toLowerCase();
            if (taskText.includes(searchTerm)) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });
    });

    function saveTasks() {
        const tasks = Array.from(taskList.children).map(li => {
            return {
                text: li.querySelector(".task-text").textContent,
                date: li.querySelector(".expected-completion").value,
                priority: li.classList.contains("low-priority") ? "low" :
                          li.classList.contains("medium-priority") ? "medium" : "high",
                notes: li.querySelector(".task-notes").textContent,
                completed: li.classList.contains("completed")
            };
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function checkDueSoon() {
        Array.from(taskList.children).forEach(task => {
            const taskDate = task.querySelector(".expected-completion").value;
            if (taskDate) {
                const dueTime = new Date(taskDate).getTime();
                const currentTime = Date.now();
                if (dueTime - currentTime < 3600000 && dueTime > currentTime) {
                    task.classList.add("due-soon");
                    alert(`Задача "${task.querySelector('.task-text').textContent}" истекает менее чем через час!`);
                } else {
                    task.classList.remove("due-soon");
                }
            }
        });
    }

    setInterval(checkDueSoon, 60000); // Проверять задачи каждую минуту
});






