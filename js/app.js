/*
  Import modules
*/
import Note from './modules/notes/note.js';
import {
  addNote,
  removeBasedOnIndex,
  removeFirstFoundBasedOnTitle,
  getNote,
  // getFavorites,
  getAllNotes,
  setPredefinedNotes,
  dateHowLongAgo,
  getTextFromContent
} from './modules/notes/note-list.js';
import {
  options as quillSettings
} from './modules/settings/quill-settings.js';
/*import {
  settings as userSettings,
  saveUserSettings
} from './modules/settings/user-settings.js';
*/
import {displayNotes} from './modules/page/loadnotes.js';

import {
  showEditButton,
  showEditor,
  showLandingPage
} from './modules/page/loadpageitems.js'

import {
  navbarSlide,
  noteListSlide
} from './modules/page/menu.js'

window.getNote = getNote;
/**
 * Quill Editor
 */
const editor = new Quill('#editor-code', quillSettings);

let searchPreviewLength = 0;

/*
  Initialize localStorage keys before usage.
*/
function initializeLocalStorage() {
  if (!localStorage.getItem('save-notes')) {
    localStorage.setItem('save-notes', '[]');
  } else {
    setPredefinedNotes(JSON.parse(localStorage.getItem('save-notes')));
  }
  if (!localStorage.getItem('edit-id')) {
    localStorage.setItem('edit-id', '0');
  }
  if (!localStorage.getItem('user-settings')) {
    localStorage.setItem('user-settings', JSON.stringify(userSettings));
  }
}
/**
 * 
 * @param {number} id 
 */
function saveEditID(id) {
  localStorage.setItem('edit-id', JSON.stringify(id))
}

/**
 * 
 */
function loadEditID() {
  const id = JSON.parse(localStorage.getItem('edit-id'));
  if (!id) {
    return 0;
  }
  return parseInt(id);
}

function getPreviewTextFromNote(note, from, to) {
  let previewText = `${getTextFromContent(note.content.ops).split('\n').join(' ').substr(from, to)}`;
  if (previewText.length > to) {
    return `${previewText}...`;
  }
  return previewText;
}

function loadItems(note) {
  //HTML Element that keeps our notes
  const elementNoteList = document.querySelector('.aside__note-list');

  //Creating div for a note list
  const noteList = document.createElement('li');

  //Creating two Div for note list
  const leftDiv = document.createElement('section');
  const rightDiv = document.createElement('section');

  //Create necessary buttons for a note
  const buttonRemove = document.createElement("button"),
    buttonEdit = document.createElement("button"),
    buttonFavorite = document.createElement("button");
  //Create div for favorite and remove buttons
  const groupButtonDiv = document.createElement('div');
  groupButtonDiv.classList.add('class_'+note.dateOfCreation);
  leftDiv.classList.add('class_' + note.dateOfCreation);
  rightDiv.classList.add('class','section-right');
  groupButtonDiv.style.setProperty('position', 'absolute');
  groupButtonDiv.style.setProperty('right', '-14rem');

  //Create necessary buttons (image) for a note
  const imgRemove = document.createElement('img'),
    imgFavorite = document.createElement('img'),
    imgPrint = document.createElement('img');

  //Inline styling for remove button
  imgRemove.src = './assets/icons/delete.svg';
  imgRemove.width = '30';
  imgRemove.height = '30';
  imgRemove.style.setProperty('margin-right', '0rem');

  //Inline styling for favorite button
  imgFavorite.src = note.isFavorite ? './assets/icons/star-filled.svg' : './assets/icons/star-outlined.svg'
  imgFavorite.width = '30';
  imgFavorite.height = '30';
  imgFavorite.style.setProperty('margin-right', '0rem');

  //Inline styling for print button
  imgPrint.src = './assets/icons/print.svg';
  imgPrint.width = '30';
  imgPrint.height = '30';
  imgPrint.style.setProperty('margin-right', '0rem');

  //Create pull button
  const button3Dot = document.createElement('img');
  button3Dot.setAttribute('src','assets/icons/drag-indicator.svg');
  button3Dot.setAttribute('class', 'note-button-group');

  //Elements for note text and content
  const previewText = document.createElement('p');
  const header2Title = document.createElement('h2');

  const dateParagraph = document.createElement("p");
  const newdateParagraph = document.createElement("p");
  newdateParagraph.style.setProperty('font-size', '1rem');
  newdateParagraph.style.setProperty('margin-top', '0.5rem');
  newdateParagraph.style.setProperty('font-weight','lighter');
  dateParagraph.style.setProperty('font-size', '1rem');
  dateParagraph.style.setProperty('margin-bottom','1rem');
  dateParagraph.style.setProperty('font-weight', 'lighter');

  //Setting visual text for every created element
  header2Title.innerHTML = note.title;
  dateParagraph.innerText = "Last edited " + dateHowLongAgo(note.lastChanged);
  newdateParagraph.innerText = "Created " + dateHowLongAgo(note.dateOfCreation);

  previewText.innerHTML = getPreviewTextFromNote(note, 0, 50);

  //Setting attribute for each button
  noteList.setAttribute('note-id', note.dateOfCreation);
  header2Title.setAttribute('note-id', note.dateOfCreation);
  previewText.setAttribute('note-id', note.dateOfCreation);

  //Setting event handlers
  imgRemove.onclick = removeNoteEventHandler;
  noteList.onclick = editNoteEventHandler;
  imgFavorite.onclick = setFavoriteNoteEventHandler;
  button3Dot.onclick = button3DotEventHandler;

  //Attach main elements to the list member
  leftDiv.append(header2Title);
  leftDiv.append(newdateParagraph);
  leftDiv.append(dateParagraph);
  leftDiv.append(previewText);
  rightDiv.append(button3Dot);

  //Attach groupped elements to the child div
  groupButtonDiv.appendChild(imgFavorite);
  groupButtonDiv.appendChild(imgPrint);
  groupButtonDiv.appendChild(imgRemove);

  //Attach the child div back to the parent div.
  rightDiv.append(groupButtonDiv);
  

  // Insert div in notelist
  noteList.append(leftDiv);
  noteList.append(rightDiv);

  //Attach child div to the parent div
  elementNoteList.append(noteList);
}

function makeAndStoreContent() {
  const allNotes = getAllNotes();
  const loadID = Number(loadEditID());
  let counter = 0;

  allNotes.forEach(function (note) {
    if (note.dateOfCreation === loadID) {
      note.content = editor.getContents();
      counter++;
      note.lastChanged = Date.now();
      note.title = document.getElementById('editorTitle').value;
      const h2TitleElement = document.querySelector(`h2[note-id='${loadID}']`);
      const previewTextElement = document.querySelector(`p[note-id='${loadID}']`);
      h2TitleElement.innerHTML = note.title;
      previewTextElement.innerHTML = getPreviewTextFromNote(note, 0, 50);
    }
  });

  if (counter === 0) {
    const newNote = new Note({
      title: document.getElementById('editorTitle').value,
      content: editor.getContents()
    });
    addNote(newNote);
    loadItems(newNote);
  }
  storeContent();
}

/**
 * Event handler for mouse click to remove a Note
 * @param {MouseEvent} event
 */
function removeNoteEventHandler(event) {
  const noteIdToRemove = event.target.parentNode.parentNode.parentNode.getAttribute('note-id');
  const indexToRemove = getAllNotes().findIndex(data => data.dateOfCreation === Number(noteIdToRemove));

  
  
  removeBasedOnIndex(indexToRemove);
  event.target.parentNode.parentNode.parentNode.remove();



  //Save our new content
  storeContent();
}

/**
 * Event handler to favorit selected note
 * @param {MouseEvent} event
 */
function setFavoriteNoteEventHandler(event) {
  const favoriteNote = event.target.parentNode.parentNode.parentNode.getAttribute('note-id');
  const index = getAllNotes().findIndex(note => note.dateOfCreation === Number(favoriteNote));
  const note = getNote(index);
  const isFavorited = note.setFavorite();
  this.src = isFavorited ? './assets/icons/star-filled.svg' : './assets/icons/star-outlined.svg'
  storeContent();
}

/**
 * Event handler for showing and hiding list member buttons
 * @param {MouseEvent} event 
 */
function button3DotEventHandler(event) {
  const classID = 'class_' + event.target.parentNode.parentNode.getAttribute('note-id');
  const element = document.getElementsByClassName(classID)[0];
  const element2 = document.getElementsByClassName(classID)[1];
  element2.classList.toggle('group-button-show');
  element2.style.setProperty('position', 'absolute');
  element.classList.toggle('group-button-show-section');
  this.classList.toggle('group-button-show');
}

/**
 * Event handler for editing selected note
 * @param {MouseEvent} event 
 */
function editNoteEventHandler(event) {
  let filterTarget = event.target.getAttribute('class');
  let buttonGroup = event.target.nodeName;
  if(filterTarget !== 'note-button-group group-button-show' && filterTarget !== 'note-button-group' && buttonGroup.toLowerCase() !== 'img') {
    const noteIdToEdit = event.target.getAttribute('note-id');
    const index = getAllNotes().findIndex(data => data.dateOfCreation === Number(noteIdToEdit));
    showEditor();
    setTimeout(() => { document.querySelector("#sidebar-notes").classList.remove("sidebar-show")}, 1000)
    if (index !== -1) {
      const note = getNote(index);
      const editorTitle = document.getElementById('editorTitle');
      editor.setContents(note.content);
      editorTitle.value = note.title;
    }
    saveEditID(noteIdToEdit);
    storeContent();
  }
}

/**
 * Opens last opened note from the landing page
 */
function editOpenedNoteButton() {
  const noteIdToEdit = JSON.parse(localStorage.getItem('edit-id'));
  const index = getAllNotes().findIndex(data => data.dateOfCreation === Number(noteIdToEdit));
  showEditor();
  setTimeout(() => { document.querySelector("#sidebar-notes").classList.remove("sidebar-show") }, 1000)
  if (index !== -1) {
    const note = getNote(index);
    const editorTitle = document.getElementById('editorTitle');
    editor.setContents(note.content);
    editorTitle.value = note.title;
  }
  saveEditID(noteIdToEdit);
  storeContent();
}

document.querySelector('#new-document').addEventListener('click', preNewNote);

/**
* Resets the edit-id and the editor of its content
*/
function preNewNote(){
  localStorage.setItem('edit-id', JSON.stringify(0));
  clearContents();
  document.getElementById('editorTitle').value = '';
}

function clearAllChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function renderItems(notes = getAllNotes()) {
  clearAllChildren(document.querySelector('.aside__note-list'));
  notes.forEach(note => loadItems(note));
}

//save button
document.querySelector('#save-btn').addEventListener('click', saveFunction);

function saveEventAnimation() {
  // Change text to Saved! 
  // 
  document.querySelector('#save-btn').textContent = "Saved!";
  document.querySelector('#save-btn').style.backgroundColor = "var(--green)";
  document.querySelector('#save-btn').style.color = "white"
}


function saveFunction() {
  setTimeout(saveEventAnimation, 1000);
  makeAndStoreContent();
}

function editorLoad() {
  const allNotes = getAllNotes();
  const noteIdToLoad = allNotes.findIndex(data => data.dateOfCreation === Number(localStorage.getItem('edit-id')));
  if (noteIdToLoad !== -1) {
    editor.setContents(getNote(noteIdToLoad).content);
  }
  
}

function clearContents() {
  editor.setContents(); //clear all text;
}

function storeContent() {
  localStorage.setItem('save-notes', JSON.stringify(getAllNotes()))
}


document.getElementById('main-page-content').addEventListener("click", (event) => {
  const settingsList = document.querySelector('#sidebar-settings');
  const noteList = document.querySelector('#sidebar-notes');
  
  const targetName = event.target.id;
  if ((targetName !== "sidebar-notes") && (targetName !== "nav-note"))
    noteList.classList.remove("sidebar-show")

  if ((targetName !== "sidebar-settings") && (targetName !== "nav-settings"))
    settingsList.classList.remove("sidebar-show")
});

/**
 * Sort saved notes by latest edited note
 */
let sortedNotesByLastEdit;


/**
 * Decides what to display if there is any notes in LocalStorage
 */
function displayLatestNoteList() {
  const savedNotes = JSON.parse(localStorage.getItem("save-notes"));
  if (savedNotes.length === 0) {
    document.querySelector("#landing-page__note-list").innerHTML = "No notes, why not write your first note?"
  } else { 
    sortedNotesByLastEdit = savedNotes.sort((a, b) => b.lastChanged - a.lastChanged);
    displayNotes(sortedNotesByLastEdit.slice(0, 3));
  }
}

document.querySelector("#add-new-note-button").addEventListener("click", () => {
  preNewNote();
  showEditor();
});

document.querySelector("#quire-logo").addEventListener("click", () => {
  showLandingPage();
  displayLatestNoteList();
})

function main() {
  initializeLocalStorage();
  navbarSlide();
  noteListSlide();
  renderItems();
  editorLoad();
  displayLatestNoteList();
  showEditButton(editOpenedNoteButton);
  const latestNotes = document.querySelectorAll("#landing-page__note-list");
  latestNotes.forEach((event) => {
    event.onclick = editNoteEventHandler;
  });

}

function searchText(text, word) {
  text = text.toLowerCase();
  word = word.toLowerCase().replace(/([()[{*+.$^\\|?])/g, '\\$1');

  const index = text.search(word);

  if (index !== -1) {
      let start = index - searchPreviewLength < 0 ? 0 : index - searchPreviewLength;
      let end = start === 0 ? index : searchPreviewLength;
      return { start, end, index }
  }

  return false;
}

document.getElementById('search').addEventListener('input', function() {
  if(getAllNotes().length > 0) {
    clearAllChildren(document.querySelector('.aside__note-list'));

    getAllNotes().filter((note, index) => {
      const word = this.value;
      const text = getTextFromContent(note.content.ops);
      const title = note.title;

      const textData = searchText(text, word);
      const titleData = searchText(title, word);

      if(titleData || textData) {
        loadItems(note);
      }

      const previewTemplate = (t, q) => `${t.substr(q.start, q.end)}<span class='preview-highlight'>${t.substr(q.index, word.length)}</span>${t.substr(q.index + word.length, searchPreviewLength)}`;
      
      if(titleData) {
        const titleTextElement = document.querySelector(`h2[note-id='${getNote(index).dateOfCreation}']`);
        if(titleTextElement) {
          titleTextElement.innerHTML = previewTemplate(title, titleData);
        }
      } else if(textData) {
        const previewTextElement = document.querySelector(`p[note-id='${getNote(index).dateOfCreation}']`);
        if(previewTextElement) {
          previewTextElement.innerHTML = previewTemplate(text, textData);
        }
      }

      return textData || titleData;
    });
  }
});

/**
 * Print button
 */
document.getElementById('printerButton').addEventListener('click', function () {
    window.print();
  });


window.addEventListener("load", main);