const express = require(`express`);
const router = express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save(task);
    res.status(201).send(task);
  } catch (error) {
    res.status(400); //set status to  400
    res.send(err);
  }
});


// completed is false or true
// limit=10 pagination skip=10
// sorting by CreatedAt
router.get("/tasks", auth, async (req, res) => {
  let match = {}
  let sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === `true`
  }
  if (req.query.sortBy) {
    const parts =  req.query.sortBy.split(`:`)
    // sorting returns {sort:1} or {sort:-1}
    sort[parts[0]] = parts[0] == "desc" ? -1 : 1
  }
  try {
    await req.user.populate({
path: 'tasks',
match,
options: {
    limit: parseInt(req.query.limit),
    skip: parseInt(req.query.skip),
    sort: sort
    }
}).execPopulate()
    
    res.send(req.user.tasks)
  } catch (err) {
    res.status(400); //set status to  400
    res.send(err);
  }
});



router.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id: _id, owner: req.user._id });
    if (!task) {
      console.log(req.body);
      return res.status(404).send(`task with id cannot be found`);
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400); //set status to  400
    res.send(err);
  }
});

router.patch("/task/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [`description`, `completed`];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res
      .status(404)
      .send(`you have Requested to update an invalid field`);
  }
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id: _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send(`task with id cannot be found`);
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();

    res.status(200).send(task);
  } catch (err) {
    res.status(400); //set status to  400
    res.send(err);
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({_id:_id, owner:req.user._id});
    if (!task) {
      return res.status(404).send(`task with id cannot be found`);
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(err);
  }
});

module.exports = router;
