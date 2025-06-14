let users = JSON.parse(localStorage.getItem('users')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let departments = ['Software', 'Design', 'Marketing', 'Finance', 'HR'];
let taskComments = JSON.parse(localStorage.getItem('taskComments')) || [];
let pendingCancellations = JSON.parse(localStorage.getItem('pendingCancellations')) || [];
let avatarIcons = {
  'avatar1': 'fa-user-circle',
  'avatar2': 'fa-user-tie',
  'avatar3': 'fa-user-ninja',
  'avatar4': 'fa-user-astronaut',
  'avatar5': 'fa-user-graduate',
  'avatar6': 'fa-user-secret',
  'avatar7': 'fa-user-md',
  'avatar8': 'fa-user-cog'
};

document.addEventListener('DOMContentLoaded', function() {
  if (!users.some(u => u.username === 'admin')) {
    users.push({
      username: 'admin',
      password: 'admin123',
      role: 'manager',
      department: 'All',
      avatar: 'avatar2'
    });
    saveData();
  }
  if (currentUser) {
    showMain();
  }

  setupEventListeners();
});
function setupEventListeners() {
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('registerBtn').addEventListener('click', showRegisterDetails);
  document.getElementById('completeRegisterBtn').addEventListener('click', handleRegister);
  document.getElementById('cancelRegisterBtn').addEventListener('click', hideRegisterDetails);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
  document.getElementById('cancelTaskBtn').addEventListener('click', closeTaskModal);
  document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
  document.getElementById('closeTaskModal').addEventListener('click', closeTaskModal);
  document.getElementById('closeCommentModal')?.addEventListener('click', closeCommentModal);
  document.getElementById('saveCommentBtn')?.addEventListener('click', saveComment);
  document.getElementById('cancelCommentBtn')?.addEventListener('click', closeCommentModal);
  document.getElementById('closeUserManagementModal')?.addEventListener('click', closeUserManagementModal);
  document.getElementById('saveUserBtn')?.addEventListener('click', saveUserEdit);
  document.getElementById('cancelUserEditBtn')?.addEventListener('click', cancelUserEdit);
  document.getElementById('searchInput')?.addEventListener('input', filterTasks);
  document.getElementById('filterType')?.addEventListener('change', filterTasks);
  document.getElementById('departmentFilter')?.addEventListener('change', filterByDepartment);
  document.getElementById('mark-all-read')?.addEventListener('click', markAllNotificationsAsRead);
  document.getElementById('clear-notifications')?.addEventListener('click', clearNotifications);
  document.getElementById('sound-toggle')?.addEventListener('click', toggleNotificationSounds);
  document.querySelectorAll('.avatar-option').forEach(option => {
    option.addEventListener('click', selectAvatar);
  });
  document.getElementById('user-profile')?.addEventListener('click', showAvatarModal);
  document.getElementById('closeAvatarModal')?.addEventListener('click', closeAvatarModal);
  document.getElementById('saveAvatarBtn')?.addEventListener('click', saveAvatar);
}
function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  if (!username || !password) {
    alert('Please enter username and password!');
    return;
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    alert('Invalid username or password!');
    usernameInput.value = '';
    passwordInput.value = '';
    return;
  }

  currentUser = user;
  saveData();
  showMain();
  usernameInput.value = '';
  passwordInput.value = '';
}

function showRegisterDetails() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  if (!username || !password) {
    alert('Please enter username and password!');
    return;
  }

  if (users.some(u => u.username === username)) {
    alert('This username already exists!');
    usernameInput.value = '';
    passwordInput.value = '';
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long!');
    passwordInput.value = '';
    return;
  }

  document.getElementById('auth-area').style.display = 'none';
  document.getElementById('register-details').style.display = 'block';
  const isAdmin = currentUser && currentUser.role === 'manager';
  document.getElementById('userRoleGroup').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('userRole').value = 'user';
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelector('.avatar-option[data-avatar="avatar1"]').classList.add('selected');
  document.getElementById('selectedAvatar').value = 'avatar1';
}

function hideRegisterDetails() {
  document.getElementById('auth-area').style.display = 'block';
  document.getElementById('register-details').style.display = 'none';
}

function handleRegister() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('userRole').value;
  const department = document.getElementById('userDepartment').value;
  const avatar = document.getElementById('selectedAvatar').value;

  if (!username || !password || !department || !avatar) {
    alert('Please fill in all required fields!');
    return;
  }

  if (users.some(u => u.username === username)) {
    alert('This username already exists!');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }

  const newUser = {
    username,
    password,
    role,
    department,
    avatar
  };

  users.push(newUser);
  saveData();

  alert('Registration successful! You can now log in.');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  hideRegisterDetails();
}

function handleLogout() {
  currentUser = null;
  saveData();
  location.reload();
}
function showMain() {
  document.getElementById('auth-area').style.display = 'none';
  document.getElementById('register-details').style.display = 'none';
  document.getElementById('main-area').style.display = 'block';
  document.getElementById('search-area').style.display = 'flex';
  document.getElementById('notification-area').style.display = 'flex';
  document.getElementById('user-profile').style.display = 'flex';

  updateUserDisplay();

  const isAdmin = currentUser.role === 'manager' || currentUser.role === 'admin';

   
  document.getElementById('departmentFilter').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('addTaskBtn').style.display = isAdmin ? 'block' : 'none';

   
  if (isAdmin) {
    const toolbarRightControls = document.querySelector('.right-controls');

    if (!document.getElementById('userManagementBtn')) {
      const manageBtn = document.createElement('button');
      manageBtn.id = 'userManagementBtn';
      manageBtn.innerHTML = '<i class="fas fa-users"></i> User Management';
      manageBtn.addEventListener('click', openUserManagementModal);

      toolbarRightControls.insertBefore(manageBtn, document.getElementById('logoutBtn'));
    }

    checkPendingCancellations();
  }

   
  loadNotificationsForCurrentUser();
  renderTasks();
  updateNotificationCount();
  updateSoundToggleButton();
}

function updateUserDisplay() {
  const usernameDisplay = document.getElementById('username-display');
  const userAvatar = document.getElementById('user-avatar');

  if (usernameDisplay && userAvatar) {
    usernameDisplay.textContent = currentUser.username;

    if (currentUser.avatar && avatarIcons[currentUser.avatar]) {
      userAvatar.innerHTML = `<i class="fas ${avatarIcons[currentUser.avatar]}"></i>`;
    } else {
      userAvatar.innerHTML = `<i class="fas fa-user-circle"></i>`;
    }
  }
}

function checkPendingCancellations() {
  if (pendingCancellations.length > 0 && (currentUser.role === 'manager' || currentUser.role === 'admin')) {
    addNotification('There are pending cancellation requests!', null, [], null);
  }
}

 
function openTaskModal(task = null) {
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const taskIdInput = document.getElementById('taskId');
  const taskTitleInput = document.getElementById('taskTitle');
  const taskDescInput = document.getElementById('taskDesc');
  const taskDateInput = document.getElementById('taskDate');
  const taskDepartmentInput = document.getElementById('taskDepartment');
  const taskPriorityInput = document.getElementById('taskPriority');
  const deleteBtn = document.getElementById('deleteTaskBtn');

   
  document.getElementById('taskModalContent')?.reset?.();

   
  const today = new Date().toISOString().split('T')[0];
  taskDateInput.setAttribute('min', today);

  if (task) {
     
    modalTitle.textContent = 'Edit Task';
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description;
    taskDateInput.value = task.dueDate;
    taskDepartmentInput.value = task.department;
    taskPriorityInput.value = task.priority || 'medium';

    populateAssigneeDropdown(task.department);

    setTimeout(() => {
      const assigneeInput = document.getElementById('assignee');
      if (assigneeInput && task.assignee) {
        assigneeInput.value = task.assignee;
      }
    }, 100);

    deleteBtn.style.display = 'block';
  } else {
     
    modalTitle.textContent = 'Add New Task';
    taskIdInput.value = '';
    taskTitleInput.value = '';
    taskDescInput.value = '';
    taskDateInput.value = today;

    if (currentUser.role === 'manager') {
      taskDepartmentInput.value = 'Software';
    } else {
      taskDepartmentInput.value = currentUser.department;
      taskDepartmentInput.disabled = true;
    }

    taskPriorityInput.value = 'medium';
    populateAssigneeDropdown(taskDepartmentInput.value);
    deleteBtn.style.display = 'none';
  }

   
  taskDepartmentInput.onchange = function() {
    populateAssigneeDropdown(this.value);
  };

  modal.style.display = 'block';
}

function closeTaskModal() {
  document.getElementById('taskModal').style.display = 'none';
}

function populateAssigneeDropdown(department) {
  const assigneeDropdown = document.getElementById('assignee');
  assigneeDropdown.innerHTML = '';

   
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Unassigned';
  assigneeDropdown.appendChild(defaultOption);

   
  const departmentUsers = users.filter(user => user.department === department);
  departmentUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user.username;
    option.textContent = user.username;
    assigneeDropdown.appendChild(option);
  });
}

function saveTask() {
  const taskId = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const dueDate = document.getElementById('taskDate').value;
  const department = document.getElementById('taskDepartment').value;
  const assignee = document.getElementById('assignee').value;
  const priority = document.getElementById('taskPriority').value;

  if (!title || !description || !dueDate || !department) {
    alert('Please fill in the required fields!');
    return;
  }

  if (taskId) {
     
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const oldDepartment = task.department;
      const oldAssignee = task.assignee;

      task.title = title;
      task.description = description;
      task.dueDate = dueDate;
      task.department = department;
      task.assignee = assignee;
      task.priority = priority;
      task.lastEditedBy = currentUser.username;
      task.lastEditedAt = new Date().toISOString();

       
      if (oldDepartment !== department) {
        addNotification(
          `The task "${title}" has been moved from ${oldDepartment} department to ${department} department.\nModified by: ${currentUser.username}`,
          null,  
          [],  
          [oldDepartment, department]  
        );
      }

      if (oldAssignee !== assignee) {
        if (assignee) {
          addNotification(
            `The task "${title}" has been assigned to ${assignee}.\nAssigned by: ${currentUser.username}`,
            null,
            [assignee],  
            department
          );
        } else {
          addNotification(
            `The task "${title}" has been unassigned.\nModified by: ${currentUser.username}`,
            null,
            [],  
            department
          );
        }
      }
    }
  } else {
     
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      dueDate,
      department,
      assignee,
      priority,
      status: 'todo',
      createdBy: currentUser.username,
      createdAt: new Date().toISOString(),
      lastEditedBy: currentUser.username,
      lastEditedAt: new Date().toISOString()
    };

    tasks.push(newTask);

     
    const isUrgentTask = priority === 'high' || isTaskDueSoon(dueDate);
    
    if (assignee) {
      const message = isUrgentTask ? 
        `URGENT: A high-priority task "${title}" has been assigned to you.\nCreated by: ${currentUser.username}` :
        `A new task "${title}" has been assigned to you.\nCreated by: ${currentUser.username}`;
      
      addNotification(
        message,
        null,
        [assignee],  
        department
      );
    } else {
      const message = isUrgentTask ? 
        `URGENT: A high-priority task "${title}" has been created for the ${department} department.\nCreated by: ${currentUser.username}` :
        `A new task "${title}" has been created for the ${department} department.\nCreated by: ${currentUser.username}`;
      
      addNotification(
        message,
        null,
        [],  
        department
      );
    }
  }

  saveData();
  renderTasks();
  closeTaskModal();
  updateNotificationCount();
}

function deleteTask() {
  const taskId = document.getElementById('taskId').value;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex > -1) {
    const task = tasks[taskIndex];
    
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      tasks.splice(taskIndex, 1);
      
       
      addNotification(
        `The task "${task.title}" has been deleted.\nDeleted by: ${currentUser.username}`,
        null,
        [],  
        task.department
      );
      
      saveData();
      renderTasks();
      closeTaskModal();
      updateNotificationCount();
    }
  }
}

 
const notificationSounds = {
  taskAssigned: createBeepSound(800, 0.1, 0.3),  
  taskCompleted: createBeepSound(600, 0.15, 0.2),  
  taskCreated: createBeepSound(500, 0.1, 0.2),  
  system: createBeepSound(700, 0.08, 0.15),  
  urgent: createBeepSound(900, 0.2, 0.1, true)  
};

function createBeepSound(frequency, duration, volume = 0.3, repeat = false) {
  return function() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      if (repeat) {
        setTimeout(() => {
          createBeepSound(frequency, duration, volume, false)();
        }, duration * 1000 + 100);
      }
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  };
}

function playNotificationSound(type = 'system') {
   
  const soundEnabled = localStorage.getItem('notificationSounds') !== 'false';
  
  if (soundEnabled && notificationSounds[type]) {
    notificationSounds[type]();
  }
}

function toggleNotificationSounds() {
  const soundToggle = document.getElementById('sound-toggle');
  const soundEnabled = localStorage.getItem('notificationSounds') !== 'false';
  
   
  localStorage.setItem('notificationSounds', soundEnabled ? 'false' : 'true');
  
   
  updateSoundToggleButton();
  
   
  if (!soundEnabled) {
    playNotificationSound('system');
  }
}

function updateSoundToggleButton() {
  const soundToggle = document.getElementById('sound-toggle');
  const soundEnabled = localStorage.getItem('notificationSounds') !== 'false';
  
  if (soundToggle) {
    if (soundEnabled) {
      soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
      soundToggle.classList.remove('muted');
      soundToggle.title = 'Mute notification sounds';
    } else {
      soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
      soundToggle.classList.add('muted');
      soundToggle.title = 'Enable notification sounds';
    }
  }
}

 
function isTaskDueSoon(dueDate) {
  const taskDate = new Date(dueDate);
  const today = new Date();
  const twoDaysFromNow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
  
  return taskDate <= twoDaysFromNow;
}

 
function addNotification(message, type = null, targetUsers = [], relatedDepartment = null) {
  const notification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    message,
    type,
    targetUsers: Array.isArray(targetUsers) ? targetUsers : [],
    relatedDepartment: Array.isArray(relatedDepartment) ? relatedDepartment : (relatedDepartment ? [relatedDepartment] : []),
    timestamp: new Date().toISOString(),
    read: false,
    createdBy: currentUser ? currentUser.username : 'system'
  };

  notifications.push(notification);
  saveData();
  
   
  if (currentUser && isNotificationVisibleToUser(notification, currentUser)) {
     
    let soundType = 'system';
    
    if (message.toLowerCase().includes('assigned to you') || message.toLowerCase().includes('assigned to')) {
      soundType = 'taskAssigned';
    } else if (message.toLowerCase().includes('completed') || message.toLowerCase().includes('done')) {
      soundType = 'taskCompleted';
    } else if (message.toLowerCase().includes('new task') || message.toLowerCase().includes('created')) {
      soundType = 'taskCreated';
    } else if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('pending')) {
      soundType = 'urgent';
    }
    
    playNotificationSound(soundType);
  }
}

function isNotificationVisibleToUser(notification, user) {
   
  if ((!notification.targetUsers || notification.targetUsers.length === 0) && 
      (!notification.relatedDepartment || notification.relatedDepartment.length === 0)) {
    return true;
  }

   
  if (notification.targetUsers && notification.targetUsers.includes(user.username)) {
    return true;
  }

   
  if (notification.relatedDepartment && notification.relatedDepartment.length > 0) {
     
    if (user.role === 'manager' && user.department === 'All') {
      return true;
    }
    
     
    if (notification.relatedDepartment.includes(user.department)) {
      return true;
    }
  }

  return false;
}

function loadNotificationsForCurrentUser() {
  if (!currentUser) return;

   
  const userNotifications = notifications.filter(notification => 
    isNotificationVisibleToUser(notification, currentUser)
  );

   
  const unreadNotifications = userNotifications.filter(n => !n.read);
  if (unreadNotifications.length > 0) {
     
    const hasUrgent = unreadNotifications.some(n => 
      n.message.toLowerCase().includes('urgent') || 
      n.message.toLowerCase().includes('pending') ||
      n.message.toLowerCase().includes('high priority')
    );
    
    if (hasUrgent) {
      playNotificationSound('urgent');
    } else {
      playNotificationSound('system');
    }
  }

   
  userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const notificationList = document.getElementById('notification-list');
  if (!notificationList) return;

  notificationList.innerHTML = '';

  if (userNotifications.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.innerHTML = '<span style="color: #6c757d; font-style: italic;">No notifications</span>';
    notificationList.appendChild(emptyLi);
    return;
  }

  userNotifications.forEach(notification => {
    const li = document.createElement('li');
    
     
    const isHighPriority = notification.message.toLowerCase().includes('urgent') || 
                          notification.message.toLowerCase().includes('pending') ||
                          notification.message.toLowerCase().includes('high priority') ||
                          notification.message.toLowerCase().includes('assigned to you');
    
     
    let className = notification.read ? '' : 'unread';
    if (isHighPriority) {
      className += ' high-priority';
    }
    
    li.className = className;
    li.setAttribute('data-notification-id', notification.id);

    const timeAgo = getTimeAgo(new Date(notification.timestamp));
    
     
    const priorityBadge = isHighPriority ? '<span class="priority-badge">!</span>' : '';
    
    li.innerHTML = `
      <div class="notification-content">
        ${priorityBadge}
        <span class="notification-message">${notification.message}</span>
        <span class="notification-time">${timeAgo}</span>
      </div>
    `;

     
    li.addEventListener('click', () => markNotificationAsRead(notification.id));

    notificationList.appendChild(li);
  });
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function markNotificationAsRead(notificationId) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification && !notification.read) {
    notification.read = true;
    saveData();
    loadNotificationsForCurrentUser();
    updateNotificationCount();
  }
}

function markAllNotificationsAsRead() {
  if (!currentUser) return;

  let hasUnread = false;
  notifications.forEach(notification => {
    if (!notification.read && isNotificationVisibleToUser(notification, currentUser)) {
      notification.read = true;
      hasUnread = true;
    }
  });

  if (hasUnread) {
    saveData();
    loadNotificationsForCurrentUser();
    updateNotificationCount();
  }
}

function clearNotifications() {
  if (!currentUser) return;

  if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
     
    notifications = notifications.filter(notification => 
      !isNotificationVisibleToUser(notification, currentUser)
    );
    
    saveData();
    loadNotificationsForCurrentUser();
    updateNotificationCount();
  }
}

function updateNotificationCount() {
  if (!currentUser) return;

  const userNotifications = notifications.filter(notification => 
    !notification.read && isNotificationVisibleToUser(notification, currentUser)
  );

  const unreadCount = userNotifications.length;

   
  const hasHighPriority = userNotifications.some(n => 
    n.message.toLowerCase().includes('urgent') || 
    n.message.toLowerCase().includes('pending') ||
    n.message.toLowerCase().includes('high priority') ||
    n.message.toLowerCase().includes('assigned to you')
  );

  const countElement = document.getElementById('notification-count');
  const bellElement = document.getElementById('notification-bell');
  
  if (countElement) {
    countElement.textContent = unreadCount;
    countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
    
     
    if (hasHighPriority) {
      countElement.classList.add('high-priority');
    } else {
      countElement.classList.remove('high-priority');
    }
  }

  if (bellElement) {
     
    if (hasHighPriority) {
      bellElement.classList.add('urgent-notification');
    } else {
      bellElement.classList.remove('urgent-notification');
    }
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) {
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      loadNotificationsForCurrentUser();
    }
  }
}

 
function renderTasks() {
  const todoContainer = document.querySelector('[data-status="todo"] .tasks-container');
  const inProgressContainer = document.querySelector('[data-status="inprogress"] .tasks-container');
  const doneContainer = document.querySelector('[data-status="done"] .tasks-container');

  if (!todoContainer || !inProgressContainer || !doneContainer) return;

   
  todoContainer.innerHTML = '';
  inProgressContainer.innerHTML = '';
  doneContainer.innerHTML = '';

   
  let filteredTasks = tasks;
  
  if (currentUser.role !== 'manager' || currentUser.department !== 'All') {
    filteredTasks = tasks.filter(task => {
       
      return task.department === currentUser.department || task.assignee === currentUser.username;
    });
  }

   
  const departmentFilter = document.getElementById('departmentFilter');
  if (departmentFilter && departmentFilter.value !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.department === departmentFilter.value);
  }

   
  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    
    switch (task.status) {
      case 'todo':
        todoContainer.appendChild(taskElement);
        break;
      case 'inprogress':
        inProgressContainer.appendChild(taskElement);
        break;
      case 'done':
        doneContainer.appendChild(taskElement);
        break;
    }
  });
}

function createTaskElement(task) {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'task-card';
  taskDiv.draggable = true;
  taskDiv.setAttribute('data-task-id', task.id);

   
  let assigneeAvatar = '';
  if (task.assignee) {
    const assigneeUser = users.find(u => u.username === task.assignee);
    if (assigneeUser && assigneeUser.avatar) {
      assigneeAvatar = `<div class="task-assignee-avatar">
        <i class="fas ${avatarIcons[assigneeUser.avatar] || 'fa-user-circle'}"></i>
      </div>`;
    }
  }

   
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const isOverdue = dueDate < today && task.status !== 'done';
  const dueDateClass = isOverdue ? 'overdue' : '';

  taskDiv.innerHTML = `
    <div class="task-header">
      <div class="task-title">${task.title}</div>
      <div class="task-actions">
        ${(task.status !== 'done' && (currentUser.role === 'manager' || currentUser.role === 'admin')) ? 
		`<button onclick="openTaskModal(${JSON.stringify(task).replace(/"/g, '&quot;')})" title="Edit">
		<i class="fas fa-edit"></i>
		</button>` : ''
		}
        ${task.status === 'todo' && (currentUser.role === 'manager' || task.assignee === currentUser.username || task.department === currentUser.department) ? 
          `<button onclick="moveToInProgress('${task.id}')" title="Move to In Progress">
            <i class="fas fa-play"></i>
          </button>` : ''
        }
        ${task.status === 'inprogress' && (currentUser.role === 'manager' || task.assignee === currentUser.username || task.department === currentUser.department) ? 
          `<button onclick="openCommentModal('${task.id}', 'complete')" title="Complete Task">
            <i class="fas fa-check"></i>
          </button>` : ''
        }
      </div>
    </div>
    <div class="task-description">${task.description}</div>
    <div class="task-meta">
      <div class="task-meta-item">
        <i class="fas fa-calendar-alt"></i>
        <span class="${dueDateClass}">${dueDate.toLocaleDateString()}</span>
      </div>
      <div class="task-meta-item">
        <i class="fas fa-building"></i>
        <span>${task.department}</span>
      </div>
      ${task.assignee ? `
        <div class="task-assignee">
          ${assigneeAvatar}
          <span>${task.assignee}</span>
        </div>
      ` : ''}
      <div class="task-priority priority-${task.priority || 'medium'}">
        ${task.priority || 'medium'}
      </div>
      ${task.lastEditedBy ? `
        <div class="task-meta-item">
          <i class="fas fa-user-edit"></i>
          <span>Last Editor: ${task.lastEditedBy}</span>
        </div>
      ` : ''}
    </div>
  `;

   
  taskDiv.addEventListener('dragstart', handleDragStart);
  taskDiv.addEventListener('dragend', handleDragEnd);

  return taskDiv;
}

 
let draggedTask = null;

function handleDragStart(e) {
  draggedTask = e.target;
  e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
  e.target.style.opacity = '1';
  draggedTask = null;
}

function allowDrop(event) {
  event.preventDefault();
}

function dropTask(event) {
  event.preventDefault();
  
  if (!draggedTask) return;

  const taskId = draggedTask.getAttribute('data-task-id');
  const newStatus = event.currentTarget.getAttribute('data-status');
  
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

   
  const canMove = currentUser.role === 'manager' || 
                  task.assignee === currentUser.username ||
                  task.createdBy === currentUser.username ||
                  task.department === currentUser.department;

  if (!canMove) {
    alert('You do not have permission to move this task.');
    return;
  }

   
  if (task.status === 'done' && currentUser.role !== 'manager') {
    alert('Completed tasks cannot be moved back. Only managers can modify completed tasks.');
    return;
  }

   
  if (newStatus === 'done') {
     
    draggedTask.style.opacity = '1';
    draggedTask = null;
    
     
    openCommentModal(taskId, 'complete');
    return;
  }

   
  const oldStatus = task.status;
  task.status = newStatus;
  task.lastEditedBy = currentUser.username;
  task.lastEditedAt = new Date().toISOString();

   
  if (oldStatus !== newStatus) {
    const statusNames = {
      todo: 'To Do',
      inprogress: 'In Progress',
      done: 'Done'
    };

    if (task.assignee && task.assignee !== currentUser.username) {
      addNotification(
        `Your task "${task.title}" has been moved to ${statusNames[newStatus]}.\nMoved by: ${currentUser.username}`,
        'task_status_change',
        [task.assignee],
        task.department
      );
    }
  }

  saveData();
  renderTasks();
  updateNotificationCount();
}

 
function moveToInProgress(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const canMove = currentUser.role === 'manager' || 
                  task.assignee === currentUser.username ||
                  task.createdBy === currentUser.username ||
                  task.department === currentUser.department;

  if (!canMove) {
    alert('You do not have permission to move this task.');
    return;
  }

  task.status = 'inprogress';
  task.lastEditedBy = currentUser.username;
  task.lastEditedAt = new Date().toISOString();
  
   
  if (task.assignee && task.assignee !== currentUser.username) {
    addNotification(
      `Your task "${task.title}" has been moved to In Progress.\nMoved by: ${currentUser.username}`,
      'task_status_change',
      [task.assignee],
      task.department
    );
  }

  saveData();
  renderTasks();
  updateNotificationCount();
}

 
function openCommentModal(taskId, type) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('commentTaskId').value = taskId;
  document.getElementById('commentType').value = type;
  document.getElementById('taskComment').value = '';
  
  const modal = document.getElementById('commentModal');
  const title = document.getElementById('commentModalTitle');
  
  if (type === 'complete') {
    title.textContent = `Complete Task: ${task.title}`;
  }

  modal.style.display = 'block';
}

function closeCommentModal() {
  document.getElementById('commentModal').style.display = 'none';
}

function saveComment() {
  const taskId = document.getElementById('commentTaskId').value;
  const type = document.getElementById('commentType').value;
  const comment = document.getElementById('taskComment').value.trim();

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (type === 'complete') {
    task.status = 'done';
    task.completedAt = new Date().toISOString();
    task.completedBy = currentUser.username;
    task.lastEditedBy = currentUser.username;
    task.lastEditedAt = new Date().toISOString();

    if (comment) {
      task.completionComment = comment;
    }

     
    addNotification(
      `Task "${task.title}" has been completed${comment ? ` with comment: "${comment}"` : ''}.\nCompleted by: ${currentUser.username}`,
      'task_completed',
      [],
      task.department
    );

     
    if (task.assignee && task.assignee !== currentUser.username) {
      addNotification(
        `Your task "${task.title}" has been marked as completed.`,
        'task_completed',
        [task.assignee],
        task.department
      );
    }
  }

  saveData();
  renderTasks();
  closeCommentModal();
  updateNotificationCount();
}

 
function selectAvatar(event) {
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  event.currentTarget.classList.add('selected');
  
  const avatarValue = event.currentTarget.getAttribute('data-avatar');
  const hiddenInput = document.getElementById('selectedAvatar') || document.getElementById('editUserAvatar');
  if (hiddenInput) {
    hiddenInput.value = avatarValue;
  }
}

function showAvatarModal() {
  document.getElementById('avatarModal').style.display = 'block';
}

function closeAvatarModal() {
  document.getElementById('avatarModal').style.display = 'none';
}

function saveAvatar() {
  const selectedAvatarElements = document.querySelectorAll('#avatarModal .avatar-option.selected');
  if (selectedAvatarElements.length > 0) {
    const newAvatar = selectedAvatarElements[0].getAttribute('data-avatar');
    currentUser.avatar = newAvatar;
    
     
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex > -1) {
      users[userIndex].avatar = newAvatar;
    }
    
    saveData();
    updateUserDisplay();
    closeAvatarModal();
  }
}

 
function openUserManagementModal() {
  document.getElementById('userManagementModal').style.display = 'block';
  loadUsersList();
}

function closeUserManagementModal() {
  document.getElementById('userManagementModal').style.display = 'none';
  document.getElementById('userEditForm').style.display = 'none';
}

function loadUsersList() {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = '';

  users.forEach(user => {
    if (user.username === 'admin') return;  

    const userDiv = document.createElement('div');
    userDiv.className = 'user-item';
    userDiv.innerHTML = `
      <div class="user-info">
        <div class="user-avatar-small">
          <i class="fas ${avatarIcons[user.avatar] || 'fa-user-circle'}"></i>
        </div>
        <div class="user-details">
          <strong>${user.username}</strong>
          <span class="user-role">${user.role}</span>
          <span class="user-department">${user.department}</span>
        </div>
      </div>
      <div class="user-actions">
        <button onclick="editUser('${user.username}')" class="edit-btn">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button onclick="deleteUser('${user.username}')" class="delete-btn">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    usersList.appendChild(userDiv);
  });
}

function editUser(username) {
  const user = users.find(u => u.username === username);
  if (!user) return;

  document.getElementById('editUserId').value = user.username;
  document.getElementById('editUserUsername').value = user.username;
  document.getElementById('editUserPassword').value = '';
  document.getElementById('editUserRole').value = user.role;
  document.getElementById('editUserDepartment').value = user.department;
  document.getElementById('editUserAvatar').value = user.avatar;

   
  document.querySelectorAll('#userManagementModal .avatar-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelector(`#userManagementModal .avatar-option[data-avatar="${user.avatar}"]`)?.classList.add('selected');

  document.getElementById('userEditForm').style.display = 'block';
}

function saveUserEdit() {
  const originalUsername = document.getElementById('editUserId').value;
  const newUsername = document.getElementById('editUserUsername').value.trim();
  const newPassword = document.getElementById('editUserPassword').value.trim();
  const newRole = document.getElementById('editUserRole').value;
  const newDepartment = document.getElementById('editUserDepartment').value;
  const newAvatar = document.getElementById('editUserAvatar').value;

  if (!newUsername) {
    alert('Username is required!');
    return;
  }

   
  if (newUsername !== originalUsername && users.some(u => u.username === newUsername)) {
    alert('This username already exists!');
    return;
  }

  const userIndex = users.findIndex(u => u.username === originalUsername);
  if (userIndex > -1) {
    users[userIndex].username = newUsername;
    users[userIndex].role = newRole;
    users[userIndex].department = newDepartment;
    users[userIndex].avatar = newAvatar;

    if (newPassword) {
      if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
      }
      users[userIndex].password = newPassword;
    }

    if (originalUsername !== newUsername) {
      tasks.forEach(task => {
        if (task.assignee === originalUsername) {
          task.assignee = newUsername;
        }
        if (task.createdBy === originalUsername) {
          task.createdBy = newUsername;
        }
      });
    }

    saveData();
    loadUsersList();
    cancelUserEdit();
    
    addNotification(
      `User ${newUsername} has been updated.`,
      'user_updated',
      [],
      null
    );
    updateNotificationCount();
  }
}

function cancelUserEdit() {
  document.getElementById('userEditForm').style.display = 'none';
}

function deleteUser(username) {
  if (username === currentUser.username) {
    alert('You cannot delete your own account!');
    return;
  }

  if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex > -1) {
      users.splice(userIndex, 1);

       
      tasks.forEach(task => {
        if (task.assignee === username) {
          task.assignee = '';
        }
      });

      saveData();
      loadUsersList();
      
      addNotification(
        `User ${username} has been deleted.`,
        'user_deleted',
        [],
        null
      );
      updateNotificationCount();
    }
  }
}

 
function filterTasks() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filterType = document.getElementById('filterType').value;

  const taskCards = document.querySelectorAll('.task-card');
  
  taskCards.forEach(card => {
    let shouldShow = true;

    if (searchTerm) {
      const title = card.querySelector('.task-title').textContent.toLowerCase();
      const description = card.querySelector('.task-description').textContent.toLowerCase();
      const dateText = card.querySelector('.task-meta-item span').textContent.toLowerCase();

      switch (filterType) {
        case 'title':
          shouldShow = title.includes(searchTerm);
          break;
        case 'description':
          shouldShow = description.includes(searchTerm);
          break;
        case 'dueDate':
          shouldShow = dateText.includes(searchTerm);
          break;
        default:
          shouldShow = title.includes(searchTerm) || description.includes(searchTerm) || dateText.includes(searchTerm);
      }
    }

    card.style.display = shouldShow ? 'block' : 'none';
  });
}

function filterByDepartment() {
  renderTasks();  
}

 
function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('notifications', JSON.stringify(notifications));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('taskComments', JSON.stringify(taskComments));
  localStorage.setItem('pendingCancellations', JSON.stringify(pendingCancellations));
}

 
window.addEventListener('click', function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

   
  const notificationDropdown = document.getElementById('notification-dropdown');
  const notificationArea = document.getElementById('notification-area');
  if (notificationDropdown && !notificationArea.contains(event.target)) {
    notificationDropdown.style.display = 'none';
  }
});

document.addEventListener('keydown', function(event) {
   
  if (event.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal[style*="block"]');
    openModals.forEach(modal => {
      modal.style.display = 'none';
    });
	
    const notificationDropdown = document.getElementById('notification-dropdown');
    if (notificationDropdown && notificationDropdown.style.display === 'block') {
      notificationDropdown.style.display = 'none';
    }
  }
});
