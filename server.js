import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 4000;

// Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if it doesn't exist
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

// Multer storage
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Upload route
app.post("/upload", upload.array("images"), (req, res) => {
    const files = req.files;
    const captions = req.body.captions ? JSON.parse(req.body.captions) : [];

    const response = files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        caption: captions[index] || "Untitled"
    }));

    res.json(response);
});

// Delete image route
app.post("/delete", (req, res) => {
    const filePath = "./" + req.body.path;

    fs.unlink(filePath, err => {
        if (err) return res.status(500).json({ error: "Failed to delete" });
        res.json({ success: true });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
