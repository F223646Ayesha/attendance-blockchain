const express = require("express");
const app = express();
const cors = require("cors");
const attendanceRoutes = require("./routes/attendanceRoutes");

app.use(cors());
app.use(express.json());

app.use("/departments", require("./routes/departments"));
app.use("/classes", require("./routes/classes"));
app.use("/students", require("./routes/students"));
app.use("/attendance", require("./routes/attendance"));
app.use("/validate", require("./routes/validation"));
app.use("/attendance", attendanceRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
