const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const { User, Course } = require("../db");

router.post("/signup", async (req, res) => {
  // Implement user signup logic
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({ username: username });
  if (user) {
    res.status(403).json({
      message: "User already exists",
    });
  } else {
    User.create({
      username: username,
      password: password,
    });

    res.json({ message: "User created successfully" });
  }
});

router.post("/signin", async (req, res) => {
  // Implement admin signup logic
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({
    username: username,
    password: password,
  });

  if (user) {
    const token = jwt.sign({
      username,
    }, secret);

    res.json({ token });
  } else {
    res.status(411).json({
      message: "Incorrect email or password",
    });
  }
});

router.get("/courses", async (req, res) => {
  const courses = await Course.find({});

  res.json({
    courses: courses,
  });
});

router.post("/courses/:courseId", userMiddleware, async (req, res) => {
  // Implement course purchase logic
  const courseId = req.params.courseId;
  const username = req.username;
  const user = await User.findOne({ username: username });
  if (user.purchasedCourses.includes(courseId)) {
    res.status(403).json({
      message: "Course already purchased",
    });
  } else {
    await User.updateOne({
      username: username,
    }, {
      $push: {
        purchasedCourses: courseId,
      },
    });

    res.json({
      message: "Course purchased successfully",
    });
  }
});

router.get("/purchasedCourses", userMiddleware, async (req, res) => {
  // Implement fetching purchased courses logic
  const username = req.username;
  const user = await User.findOne({ username: username });

  const courses = await Course.find({
    _id: {
      $in: user.purchasedCourses,
    },
  });

  res.json({ courses: courses });
});

module.exports = router;
