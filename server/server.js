const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//console.log(openai);
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  let mimeType = "image/png";

  if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
  else if (ext === ".pdf") mimeType = "application/pdf"; // Not supported by GPT-4o yet

  try {
    const fileData = await fs.promises.readFile(filePath);
    const base64Image = fileData.toString("base64");

    if (mimeType === "application/pdf") {
      return res
        .status(400)
        .json({ error: "PDF not supported. Please upload an image." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",

      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all medical test parameters and values from this report and return as structured JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    res.json({ data: response.choices[0].message.content });
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to process the file" });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
