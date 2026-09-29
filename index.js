const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Temporary student data
let students = [
  {
    id: 1,
    fullName: "Yuvii",
    email: "student@example.com",
    phone: "9876543210",
    password: "123456"
  }
];

let nextStudentId = 2;

// Open website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ---------------- REGISTER STUDENT ----------------
app.post("/api/register", (req, res) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword
  } = req.body;

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({
      message: "Please fill all fields."
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must contain at least 6 characters."
    });
  }

  const existingStudent = students.find(
    student => student.email.toLowerCase() === email.toLowerCase()
  );

  if (existingStudent) {
    return res.status(400).json({
      message: "Email is already registered."
    });
  }

  const student = {
    id: nextStudentId++,
    fullName,
    email,
    phone,
    password
  };

  students.push(student);

  res.status(201).json({
    message: "Student registered successfully.",
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone
    }
  });
});

// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const student = students.find(
    item =>
      item.email.toLowerCase() === String(email || "").toLowerCase() &&
      item.password === password
  );

  if (!student) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  res.json({
    message: "Login successful.",
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone
    }
  });
});

// ---------------- GET STUDENTS ----------------
app.get("/api/students", (req, res) => {
  const studentList = students.map(student => ({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    phone: student.phone
  }));

  res.json(studentList);
});

// ---------------- GET SINGLE STUDENT ----------------
app.get("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  const student = students.find(student => student.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found."
    });
  }

  res.json({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    phone: student.phone
  });
});

// ---------------- UPDATE STUDENT ----------------
app.put("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  const student = students.find(student => student.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found."
    });
  }

  const { fullName, email, phone } = req.body;

  if (!fullName || !email || !phone) {
    return res.status(400).json({
      message: "Please fill all fields."
    });
  }

  const emailExists = students.find(
    item =>
      item.id !== id &&
      item.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExists) {
    return res.status(400).json({
      message: "Email is already registered."
    });
  }

  student.fullName = fullName;
  student.email = email;
  student.phone = phone;

  res.json({
    message: "Student updated successfully."
  });
});

// ---------------- DELETE STUDENT ----------------
app.delete("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = students.findIndex(student => student.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Student not found."
    });
  }

  students.splice(index, 1);

  res.json({
    message: "Student deleted successfully."
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});