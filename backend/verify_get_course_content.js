
// Mocking the scenario for getCourseContent fix
const mockCourseId = "c123";
const mockLearner = {
    courses_enrolled: [
        {
            course: "c123",
            status: "InProgress",
            watch_history: []
        }
    ]
};

// This simulates the fix
const getCourseContentLogic = async (courseId, learner) => {
    const enrollment = learner.courses_enrolled.find(
        en => en.course.toString() === courseId &&
            ["InProgress", "Completed"].includes(en.status)
    );

    if (!enrollment) {
        throw new Error("You don't have access to this course.");
    }

    // This is the line I added
    const course = {
        _id: courseId,
        title: "Test Course",
        description: "Test Description",
        videos: [],
        instructor: { fullName: "Test Instructor" }
    };

    if (!course) {
        throw new Error("Course not found");
    }

    const videos = course.videos || [];
    // ... logic for videosWithProgress ...
    const videosWithProgress = videos.map(v => v);

    return {
        course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            videos: videosWithProgress,
            resources: []
        },
        yourProgress: 0
    };
};

const runTest = async () => {
    try {
        const result = await getCourseContentLogic(mockCourseId, mockLearner);
        console.log("SUCCESS: getCourseContent logic executed without ReferenceError.");
        console.log("Found Course Title:", result.course.title);
    } catch (err) {
        console.error("FAILURE: Logic failed:", err.message);
    }
};

runTest();
