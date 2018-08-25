'use strict'

var canvas = new fabric.Canvas('c');
var canvasAsJSONString; // using canvasAsJSON string as a global variable for easy debugging, no probs even if not made local.

function objectIsEqual(obj1, obj2) {
  return (JSON.stringify(obj1) === JSON.stringify(obj2));
}

function initUndoList() {
  let emptyArray = [];
  sessionStorage.setItem("undoList", JSON.stringify(emptyArray));
  sessionStorage.setItem("undoListCurrentIndex", -1);
  sessionStorage.setItem("undoListLength", 0);  
}

function addToUndoList(imageAsJSON) {
  // take from undo list
  let undoList = JSON.parse(sessionStorage.getItem("undoList"));
  undoList.push(imageAsJSON);
  // increment length and current index
  let currentIndex = sessionStorage.getItem("undoListCurrentIndex");
  let listLength = sessionStorage.getItem("undoListLength");
  currentIndex++;
  listLength++;
  sessionStorage.setItem("undoListCurrentIndex", currentIndex);
  sessionStorage.setItem("undoListLength", listLength);
  // write back to undo list  
  sessionStorage.setItem("undoList", JSON.stringify(undoList));
}

function getFromUndoList(index) {
  // get undo list first.
  let undoList = JSON.parse(sessionStorage.getItem("undoList"));
  // then get item at index
  return undoList[index];
}

function undo(canvas) {
  // get current index and list length
  let currentIndex = parseInt(sessionStorage.getItem("undoListCurrentIndex"), 10);
  let listLength = parseInt(sessionStorage.getItem("undoListLength"), 10);  
  
  // check if the current index is less than zero, if so we can't undo
  if (currentIndex <= 0 || listLength < 1) {
    return;
  }
  
  // reduce current index
  // draw previous scene on to the canvas
  let previousCanvasJSONString = getFromUndoList(--currentIndex);
  // write the current index to sessionStorage
  sessionStorage.setItem("undoListCurrentIndex", currentIndex);
  canvas.loadFromJSON(previousCanvasJSONString, canvas.renderAll.bind(canvas));
}

function redo(canvas) {
  // get current index and list length
  let currentIndex = parseInt(sessionStorage.getItem("undoListCurrentIndex"), 10);
  let listLength = parseInt(sessionStorage.getItem("undoListLength"), 10);  

  // check if the current index is less than zero, if so we can't undo
  if (currentIndex >= listLength) {
    return;
  }
  // draw previous scene on to the canvas
  let previousCanvasJSONString = getFromUndoList(currentIndex);
  // write the reduced current index to sessionStorage
  sessionStorage.setItem("undoListCurrentIndex", ++currentIndex);
  canvas.loadFromJSON(previousCanvasJSONString, canvas.renderAll.bind(canvas));
}

function uploadImageToCanvas(canvas, imageFileObject) {
  let imgReader = new FileReader();

  imgReader.onload = function (event){
    var imgObj = new Image();
    imgObj.src = event.target.result;
    
    // image loading is asynchronous.
    imgObj.onload = function () {
      var image = new fabric.Image(imgObj);
      image.set({
        cornersize:10
      });
      canvas.centerObject(image);
      canvas.add(image);
      canvas.renderAll();
    }
  }
  imgReader.readAsDataURL(imageFileObject);
}

// script starts its real run here
// -------------------------------
initUndoList();

// TODO: upload image to canvas on button click
// onchange on the image may not work when you select the same image once again,
// or when you'd just like to insert a picture once again.
// uploading image
document.getElementById('image-input').onchange = function(e) {
  for (let i = 0; i < e.target.files.length; ++i) {
    uploadImageToCanvas(canvas, e.target.files[i])
  }
}

// inserting text
document.getElementById('insert-txt').onclick = function(e) {
  let textbox = new fabric.Textbox('Your text here', {
    left: 50,
    top: 50,
    width: 150,
    fontSize: 20
  });
  canvas.add(textbox).setActiveObject(textbox);
}

// save
document.getElementById('save').onclick = function(e) {
  canvasAsJSONString = JSON.stringify(canvas.toDatalessJSON());
  // send post request to /save
  let saveDataRequest = new XMLHttpRequest();

  saveDataRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      alert(this.responseText);
    }
  };
  saveDataRequest.open("POST", "/save", true);
  saveDataRequest.setRequestHeader("Content-Type", "application/json");  
  saveDataRequest.send(canvasAsJSONString);
}

// reopen
document.getElementById('reopen').onclick = function(e) {
  // get previous string from server
  // restore from saved json string
  let saveDataRequest = new XMLHttpRequest();

  saveDataRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // both the recieved response and response.jsonData are json, but they both need to be parsed
      // let previousCanvasJSONString = JSON.parse(JSON.parse(this.responseText).jsonData);
      // get buffer
      let previousCanvasJSONString = JSON.parse(this.responseText).jsonData;
      canvas.loadFromJSON(previousCanvasJSONString, canvas.renderAll.bind(canvas));
    }
  };
  saveDataRequest.open("GET", "/reopen", true);
  saveDataRequest.send();
}

// undo
document.getElementById("undo").addEventListener("click", function() {
  undo(canvas);
})

// redo
document.getElementById("redo").addEventListener("click", function() {
  redo(canvas);
})

// record mouse up events, and 
document.getElementById("wrapper").addEventListener("mouseup", function (event) {
  // get the previous object
  // check if it is the same as the current object
  // get the whole image as json
  canvasAsJSONString = JSON.stringify(canvas.toDatalessJSON());
  if (canvasAsJSONString == getFromUndoList(sessionStorage.getItem("undoListCurrenIndex"))) { console.log("same as before");
  ;return; }
  // and then add it to the session storage array
  addToUndoList(canvasAsJSONString);
});
