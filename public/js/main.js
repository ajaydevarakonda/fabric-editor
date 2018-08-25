'use strict'

var canvas = new fabric.Canvas('c');
var canvasAsJSONString;     

// uploading image
document.getElementById('image-input').onchange = function(e) {
  var reader = new FileReader();

  reader.onload = function (event){
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
  reader.readAsDataURL(e.target.files[0]);
}

// inserting text
document.getElementById('insert-txt').onclick = function(e) {
  let textbox = new fabric.Textbox('Lorum ipsum dolor sit amet', {
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
