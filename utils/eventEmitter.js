const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

eventEmitter.on("examCreated", (exam) => {
    console.log(`New examination created: ${exam.title}`);
});

eventEmitter.on("examSubmitted", (attempt) => {
    console.log(`Examination submitted by student: ${attempt.student}`);
});

eventEmitter.on("resultGenerated", (result) => {
    console.log(`Result generated for student: ${result.student}`);
});

module.exports = eventEmitter;
