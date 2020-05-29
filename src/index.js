//require the db and the connection settings in the mongoose file
require("./db/mongoose");

//require express
const express = require(`express`);

//require other files in the application
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

//instantiating express and creating a dynamic port because of deployment
const app = express();
const port = process.env.PORT;

//beinging in the task routes and the user routes
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

//port to run on and listen on
app.listen(port, () => {
  console.log(`server has started at port ${port}`);
});

console.log(process.env.SENDGRID_API_KEY, process.env.PORT);
