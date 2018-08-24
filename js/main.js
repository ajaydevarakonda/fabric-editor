'use strict'

var canvas = new fabric.Canvas('c');
var canvasAsJSONString;        

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

document.getElementById('insert-txt').onclick = function(e) {
  let textbox = new fabric.Textbox('Lorum ipsum dolor sit amet', {
    left: 50,
    top: 50,
    width: 150,
    fontSize: 20
  });
  canvas.add(textbox).setActiveObject(textbox);
}

document.getElementById('save').onclick = function(e) {
  canvasAsJSONString = JSON.stringify(canvas.toDatalessJSON());
  // send it to server
}

document.getElementById('reopen').onclick = function(e) {
  // get previous string from server
  // restore from saved json string
  let previousCanvasJSONString = JSON.parse(canvasAsJSONString)
  canvas.loadFromJSON(previousCanvasJSONString, canvas.renderAll.bind(canvas));
}
