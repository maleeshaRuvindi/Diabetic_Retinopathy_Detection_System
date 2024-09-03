const express=require('express')
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const app=express()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); 
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); 
    }
});
const upload = multer({ storage: storage });
app.set('view engine','ejs')
app.get("/uploadImage",(req,res)=>{
    res.render("upload",{ predictedClass: null, image: null })
})
app.post("/uploadImage", upload.single('image'), (req, res) => {
    console.log(req.file); // File information will be logged to the console
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imgPath = req.file.path;
    const pythonProcess = spawn('python', ['classify.py',imgPath]);
    let responseSent = false;
    pythonProcess.stdout.on('data', (data) => {
        if (!responseSent) { // Send response only if it hasn't been sent yet
            console.log("Successful")
            const predictedClass = data.toString();
            console.log(predictedClass)
            responseSent = true;
            res.render('upload', { predictedClass: predictedClass ,image:req.file.filename});
            // res.redirect(`/results?image=${encodeURIComponent(req.file.filename)}&class=${encodeURIComponent(predictedClass)}`);
        }
        
    });
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        if (!responseSent) { // Send error response only if it hasn't been sent yet
            res.send("Error processing the image");
            responseSent = true;
        }
    });
    pythonProcess.on('close', (code) => {
        if (!responseSent) {
            res.send(`Process exited with code ${code}`);
            responseSent = true;
        }
    });



});
app.get('/results', (req, res) => {
    const image = req.query.image;
    const predictedClass = req.query.class;

    res.render('results', { image: image, predictedClass: predictedClass });
});

app.get("/viewHistory",(req,res)=>{
    res.render("history")
})
app.listen(3001)