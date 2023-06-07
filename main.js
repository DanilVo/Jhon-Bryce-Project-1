// Event listener to render elements on page on load
addEventListener('load', renderTasksFromLs);

// Todays Date
addEventListener('load', () => {
  let today = new Date();
  document.querySelector('#footerDate').textContent = `${today.getDate()}-${
    today.getMonth() + 1
  }-${today.getFullYear()}`;
});

// Declare variables
const textAreaInput = document.querySelector('.textarea');
const dateInput = document.querySelector('.date');
const timeInput = document.querySelector('.time');
const saveTask = document.querySelector('.savetask');
const resetTask = document.querySelector('.resettask');
const notes = document.querySelector('ul');

saveTask.addEventListener('click', saveValuesToLocalStorage);

// Function to save values to local storage
function saveValuesToLocalStorage() {
  // Remove existing notes from the list
  while (notes.childElementCount != 0) {
    notes.removeChild(notes.firstChild);
  }
  if (textAreaInput.value && dateInput.value && timeInput.value) {
    let arrayOfTasks = getArrayFromLocalStorage() || [];
    saveToLocalStorage([
      ...arrayOfTasks,
      {
        textAreaInput: textAreaInput.value,
        dateInput: dateInput.value,
        timeInput: timeInput.value,
        id: crypto.randomUUID(),
      },
    ]);
  } else {
    renderTasksFromLs();
    throw new Error(alert('Enter all fields please!'));
  }
  clearFields();
  renderTasksFromLs();
}

const clearFields = () => {
  textAreaInput.value = '';
  dateInput.value = '';
  timeInput.value = '';
};
resetTask.addEventListener('click', clearFields);

// Function to render tasks from local storage
function renderTasksFromLs() {
  let arrayOfTasks = getArrayFromLocalStorage();
  if (arrayOfTasks) {
    arrayOfTasks.forEach((task) => {
      // Create and append task elements to the DOM
      const liTag = document.createElement('li');
      liTag.ondragstart = (event) => {
        event.dataTransfer.setData('id', arrayOfTasks.indexOf(task));
      };
      liTag.classList.add('window');

      const titleBar = document.createElement('div');
      titleBar.classList.add('title-bar');
      liTag.appendChild(titleBar);

      const titleBarText = document.createElement('div');
      titleBarText.classList.add('title-bar-text');
      titleBarText.innerHTML = 'Note';
      titleBar.appendChild(titleBarText);

      const titleBarControls = document.createElement('div');
      titleBarControls.classList.add('title-bar-controls');
      titleBar.appendChild(titleBarControls);

      const deleteTask = document.createElement('button');
      deleteTask.setAttribute('aria-label', 'Close');
      titleBarControls.appendChild(deleteTask);

      const editTask = document.createElement('button');
      editTask.classList.add('edittask');
      editTask.textContent = 'Edit note';

      const expiredText = document.createElement('span');
      expiredText.textContent = 'Expired!';
      expiredText.style.setProperty('display', 'none');

      const windowBody = document.createElement('div');
      windowBody.classList.add('window-body');

      const textNote = document.createElement('textarea');
      textNote.setAttribute('readonly', 'readonly');
      windowBody.appendChild(textNote);
      liTag.appendChild(windowBody);

      const sectionTag = document.createElement('div');
      sectionTag.classList.add('status-bar');
      const timeTag = document.createElement('p');
      timeTag.classList.add('status-bar-field');

      const dateTag = document.createElement('p');
      dateTag.classList.add('status-bar-field');

      textNote.value = task.textAreaInput;
      timeTag.innerHTML = task.timeInput;
      dateTag.innerHTML = task.dateInput;

      textNote.classList.add('note');
      liTag.setAttribute('id', task.id);

      liTag.setAttribute('draggable', 'true');

      windowBody.appendChild(editTask);
      windowBody.appendChild(expiredText);
      sectionTag.appendChild(dateTag);
      sectionTag.appendChild(timeTag);
      liTag.appendChild(sectionTag);
      notes.appendChild(liTag);

      deleteTask.addEventListener('click', () => {
        let indexOfTask = arrayOfTasks.indexOf(task);
        let reWriteLs = getArrayFromLocalStorage();
        reWriteLs.splice(notes.children[indexOfTask], 1);
        notes.removeChild(liTag);
        saveToLocalStorage(reWriteLs);
      });

      editTask.addEventListener('click', () => {
        const reWriteLs = getArrayFromLocalStorage();
        if (editTask.textContent == 'Edit note') {
          textNote.focus();
          textNote.removeAttribute('readonly');
          editTask.textContent = 'Save';
        } else {
          let indexOfTask = arrayOfTasks.indexOf(task);
          let editedTask = {
            textAreaInput: textNote.value,
            dateInput: reWriteLs[indexOfTask].dateInput,
            timeInput: reWriteLs[indexOfTask].timeInput,
            id: reWriteLs[indexOfTask].id,
          };
          reWriteLs.fill(editedTask, indexOfTask, indexOfTask + 1);
          saveToLocalStorage(reWriteLs);
          editTask.textContent = 'Edit note';
          textNote.setAttribute('readonly', 'readonly');
        }
      });
      checkEndTask(expiredText, task);
    });
  }
}

function saveToLocalStorage(arrayOfTasks) {
  localStorage.removeItem('tasks');
  localStorage.setItem('tasks', JSON.stringify(arrayOfTasks));
}

function getArrayFromLocalStorage() {
  let arrayOfTasks = localStorage.getItem('tasks');
  return JSON.parse(arrayOfTasks);
}

// Function to check if there are tasks expired
function checkEndTask(expiredText, task) {
  const today = new Date();
  let year = today.getFullYear().toString();
  let month = (today.getMonth() + 1).toString();
  let day = today.getDate().toString();
  if (month.length == 1) {
    month = `0${month}`;
  }
  if (day.length == 1) {
    day = `0${day}`;
  }
  let dateNow = year + '-' + month + '-' + day;
  let hour = today.getHours();
  let minute = today.getMinutes();
  if (minute.length == 1) {
    minute = `0${minute}`;
  }
  let timeNow = `${hour}:${minute}`;
  if (
    dateNow.slice(8, 2) == task.dateInput.slice(8, 2) &&
    timeNow.slice(0, 2) >= task.timeInput.slice(0, 2)
  ) {
    expiredText.style.display = 'inline';
  }
}

// Adding event handler to trash bin
const recycleBinDrop = document.querySelector('.recycleBin');
recycleBinDrop.ondrop = (event) => {
  const localStorageData = getArrayFromLocalStorage();
  const itemIndex = parseInt(event.dataTransfer.getData('id'));
  localStorageData.splice(itemIndex, 1);
  notes.removeChild(notes.childNodes[itemIndex]);
  saveToLocalStorage(localStorageData);
};

recycleBinDrop.addEventListener('dragover', (el) => el.preventDefault());
