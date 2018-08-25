var express     = require("express"),
    app         = express();
var bodyParser  = require('body-parser');
var fs          = require('fs');
var path        = require('path');


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ limit: "50mb" }));


app.get("/", (req, res) => {
    res.sendFile("/public/index.html");
});

app.post("/save", (req, res) => {
    // TODO: may be unsafe, find a way to make writig to a file safer. 
    // As there will always be one save, just using a file.
    fs.writeFile(path.join(__dirname, "public", "save.json"), JSON.stringify(req.body), function(err) {
        if (err) {
            return res.json({ error: "Error saving!" });
        }
        return res.json({ message: "Save Successful"});
    }); 
});

app.get("/reopen", (req, res) => {
    // open /public/save.json and send its data
    fs.readFile(path.join(__dirname, "public", "save.json"), function(err, jsonData) {
        if (err) {
            return res.json({ error: "Error retrieving saved file" });
        }
        return res.json({ jsonData: jsonData.toString() })
    });
});


app.listen(8000, function(){
    console.log("http://0.0.0.0:8000");
 });
