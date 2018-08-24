'use strict'

var canvas = new fabric.Canvas('c');        

document.getElementById('image-input').onchange = function uploadToCanvas(e) {
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