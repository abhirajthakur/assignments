const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");

// User Routes
router.post('/signup', (req, res) => {
    // Implement user signup logic
    const username = req.body.username;
    const password = req.body.password;

    User.create({
        username: username,
        password: password
    })

    res.json({ message: "User created successfully" });
});

router.get('/courses', async (req, res) => {
    const courses = await Course.find({});

    res.json({
        courses: courses
    })
});

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const courseId = req.params.courseId;
    const username = req.headers.username;

    const user = await User.findOne({ username: username });
    if (user.purchasedCourses.includes(courseId)) {
        res.status(403).json({
            message: "Course already purchased"
        })
        return;
    }

    await User.updateOne({
        username: username
    }, {
        $push: {
            purchasedCourses: courseId
        }
    })

    res.json({
        message: 'Course purchased successfully'
    })

});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const user = await User.findOne({ username: req.headers.username });

    const courses = await Course.find({
        _id: {
            $in: user.purchasedCourses
        }
    })

    res.json({
        courses: courses
    })
});

module.exports = router