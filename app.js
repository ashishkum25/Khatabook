const express = require("express");
const path = require('path');
const fs = require('fs');
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to list all files (hisaabs)
app.get("/", (req, res) => {
    fs.readdir("./hisaab", (err, files) => {
        if (err) return res.status(500).send(err.message);
        res.render("index.ejs", { files: files });
    });
});

// Route to render form for creating a new hisaab
app.get("/create", (req, res) => {
    res.render("create.ejs");
});

// Route to handle creation of new hisaabs
app.post("/createHisab", (req, res) => {
    const currentDate = new Date();
    const date = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const content = req.body.content;
    const directoryPath = path.join(__dirname, 'hisaab');

    // Create directory if it doesn't exist
    fs.mkdir(directoryPath, { recursive: true }, (err) => {
        if (err) return res.status(500).send(err.message);

        if (!content) return res.status(400).send("No content provided");

        fs.writeFile(`${directoryPath}/${date}.txt`, content, (err) => {
            if (err) return res.status(500).send(err.message);
            res.redirect("/");
        });
    });
});

// Route to view a specific hisaab file
app.get("/view/:filename", (req, res) => {
    fs.readFile(`./hisaab/${req.params.filename}`, 'utf8', (err, filedata) => {
        if (err) return res.status(500).send(err.message);
        res.render("view.ejs", { filedata, filename: req.params.filename });
    });
});

// Route to display the edit form for a specific file
app.get("/edit/:filename", (req, res) => {
    fs.readFile(`./hisaab/${req.params.filename}`, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.render("edit.ejs", { fileName: req.params.filename, data });
    });
});

// Route to handle updating the content of the file
app.post("/edit/:filename", (req, res) => {
    const filePath = path.join(__dirname, "hisaab", req.params.filename);
    const newFileName = req.body.newFileName || req.params.filename;
    const updatedData = req.body.fileData;

    if (!updatedData) return res.status(400).send("No content provided");

    fs.writeFile(filePath, updatedData, (err) => {
        if (err) return res.status(500).send(err.message);

        if (newFileName !== req.params.filename) {
            const newFilePath = path.join(__dirname, "hisaab", newFileName);
            fs.rename(filePath, newFilePath, (err) => {
                if (err) return res.status(500).send(err.message);
                res.redirect("/");
            });
        } else {
            res.redirect("/");
        }
    });
});

// Route to delete a specific file
app.get("/delete/:filename", (req, res) => {
    const filePath = `./hisaab/${req.params.filename}`;

    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect("/");
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
