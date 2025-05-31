const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

let dataBuffer = fs.readFileSync("report1.pdf");
pdfParse(dataBuffer).then((data) => {
  console.log(data.text); // extract text from PDF
});

Tesseract.recognize("report.jpg", "eng").then(({ data: { text } }) => {
  console.log(text); // extracted text from image
});

const extractParameters = (text) => {
  const results = {};
  const lines = text.split("\n");

  const regex = /(\w[\w\s\-\/]+):?\s*([\d.]+)\s*(\w+)?/i;

  lines.forEach((line) => {
    const match = line.match(regex);
    if (match) {
      const key = match[1].trim();
      const value = parseFloat(match[2]);
      results[key] = value;
    }
  });

  return results;
};

const referenceRanges = {
  Hemoglobin: { min: 12, max: 16 },
  WBC: { min: 4000, max: 11000 },
  Platelets: { min: 150000, max: 450000 },
  // Add more as needed
};

const checkAbnormal = (params) => {
  const abnormalities = {};
  for (let key in params) {
    if (referenceRanges[key]) {
      const value = params[key];
      const { min, max } = referenceRanges[key];
      if (value < min || value > max) {
        abnormalities[key] = { value, status: "out of range", min, max };
      }
    }
  }
  return abnormalities;
};
