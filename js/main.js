const baseURL = 'https://66745e6f75872d0e0a9635f3.mockapi.io/api/v1/tasks';

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('task-list')) {
        loadTasks();
    }

    if (document.getElementById('create-task-form')) {
        document.getElementById('create-task-form').addEventListener('submit', createTask);
    }

    if (document.getElementById('change-status-form')) {
        loadTasksForSelect();
        document.getElementById('change-status-form').addEventListener('submit', changeTaskStatus);
    }

    if (document.getElementById('config-form')) {
        document.getElementById('config-form').addEventListener('submit', saveConfig);
    }
});

function loadTasks() {
    fetch(baseURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new TypeError('Expected an array of tasks');
            }
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = ''; // Limpiar cualquier contenido existente
            data.sort((a, b) => new Date(b.fechacreacion) - new Date(a.fechacreacion));
            data.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.classList.add('task-card');
                taskCard.innerHTML = `
                    <h3>${task.titulo}</h3>
                    <p>${task.fechacreacion}</p>
                    <button onclick="playTask('${task.id}')">Play</button>
                `;
                taskList.appendChild(taskCard);
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

function createTask(e) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const detail = document.getElementById('task-detail').value;
    const status = document.getElementById('task-status').value;
    const date = new Date().toISOString();

    fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            titulo: title,
            descripcion: detail,
            estado: status,
            fechacreacion: date,
            fechaconclusion: status === 'finalizado' ? date : ""
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tarea creada:', data);
        // Opcionalmente, redirige o actualiza la lista de tareas
    })
    .catch(error => console.error('Error creating task:', error));
}

function loadTasksForSelect() {
    fetch(baseURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new TypeError('Expected an array of tasks');
            }
            const taskSelect = document.getElementById('task-select');
            taskSelect.innerHTML = ''; // Limpiar cualquier opción existente
            data.forEach(task => {
                const option = document.createElement('option');
                option.value = task.id;
                option.text = task.titulo;
                taskSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching tasks for select:', error));
}

function changeTaskStatus(e) {
    e.preventDefault();
    const taskId = document.getElementById('task-select').value;
    const newStatus = document.getElementById('new-task-status').value;
    const date = new Date().toISOString();

    if (!taskId) {
        console.error('No task selected');
        return;
    }

    fetch(`${baseURL}/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            estado: newStatus,
            fechaconclusion: newStatus === 'finalizado' ? date : ""
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Estado de tarea actualizado:', data);
        // Opcionalmente, redirige o actualiza la lista de tareas
    })
    .catch(error => console.error('Error updating task status:', error));
}

function saveConfig(e) {
    e.preventDefault();
    const audioLanguage = document.getElementById('audio-language').value;
    const audioSpeed = document.getElementById('audio-speed').value;
    localStorage.setItem('audioLanguage', audioLanguage);
    localStorage.setItem('audioSpeed', audioSpeed);
    console.log('Configuración guardada');
}

function playTask(taskId) {
    if (!taskId) {
        console.error('No taskId provided');
        return;
    }
    fetch(`${baseURL}/${taskId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const utterance = new SpeechSynthesisUtterance(data.descripcion);
            utterance.lang = localStorage.getItem('audioLanguage') || 'es-ES';
            utterance.rate = parseFloat(localStorage.getItem('audioSpeed')) || 1;
            window.speechSynthesis.speak(utterance);
        })
        .catch(error => console.error('Error fetching task for playback:', error));
}
