const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secret = "VINAY";

const generateJwt = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        res.send(403);
      }
      res.user = user;
      console.log("auth" + user);
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find((u) => u.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    const token = generateJwt(admin);
    res.json({ message: "Admin created successfully", token });
  }
});

app.post("/admin/login", (req, res) => {
  // logic to log in admin
  const admin = req.body;
  const existingAdmin = ADMINS.find(
    (u) => u.username === admin.username && u.password === admin.password
  );

  if (existingAdmin) {
    const token = generateJwt(admin);
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

app.post("/admin/courses", authenticateJwt, (req, res) => {
  const course = req.body;
  course.id = COURSES.length + 1;
  // course.vini = COURSES.length + 10;
  // course.vinay = "vinay";
  COURSES.push(course);
  res.json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", authenticateJwt, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);

  const courseIndex = COURSES.findIndex((c) => c.id === courseId);

  if (courseIndex > -1) {
    const updatedCourse = { ...COURSES[courseIndex], ...req.body };
    COURSES[courseIndex] = updatedCourse;
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/admin/courses/:courseId", authenticateJwt, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  console.log(courseId);
  if (courseId) {
    var newCourse = [];
    for (var i = 0; i < COURSES.length; i++) {
      if (COURSES[i].id === courseId) {
        newCourse.push(COURSES[i]);
      }
    }
    res.json(newCourse);
  } else {
    res.sendStatus(403);
  }
});

app.get("/admin/courses", authenticateJwt, (req, res) => {
  res.json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const user = req.body;
  const existingUser = USERS.find((u) => u.username === user.username);
  if (!existingUser) {
    USERS.push(user);
    const token = generateJwt(user);
    res.json({ message: "Successfully User Created", token });
  } else {
    res.sendStatus(401).json({ message: "User Already Created" });
  }
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const user = req.body;
  const checkUser = USERS.find(
    (u) => u.username === user.username && u.password === user.password
  );
  if (checkUser) {
    const token = generateJwt(user);
    res.json({ message: "Successfully Login Created", token });
  } else {
    res.sendStatus(401).json({ message: "User Already Created" });
  }
});

app.get("/users/courses", authenticateJwt, (req, res) => {
  // logic to list all courses
  const publishedCourses = [];
  for (var i = 0; i < COURSES.length; i++) {
    if (COURSES[i].published) {
      publishedCourses.push(COURSES[i]);
    }
  }
  if (publishedCourses) {
    res.json(publishedCourses);
  } else {
    res.sendStatus(401).json({ message: "No Current Courses" });
  }
});

app.post("/users/courses/:courseId", authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    const user = USERS.find((u) => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: "Course purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/users/purchasedCourses", (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
