const express = require(`express`);
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/account");

router.post("/users", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save(user);
    sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(500); //set status to  400
    res.send(err);
  }
});

router.post("/users/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user: user, token: token });
  } catch (err) {
    res.status(400).send(`error : there is a problem with your ligin details`); //set status to  400
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    //removes the currently authenticated token that was used to login
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    //removes all the user tokens and logout from all sessions
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/user/:id", async (req, res) => {
  const _id = req.params.id;
  const user = await User.findById({ _id });
  try {
    if (!user) {
      return res.status(404).send(`user with id cannot be found`);
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400); //set status to  400
    res.send(err);
  }
});

router.patch("/user/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [`name`, `age`, `password`, `email`];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res
      .status(404)
      .send(`you have Requested to update an invalid field`);
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.status(200).send(req.user);
  } catch (err) {
    res.status(500); //set status to  400
    res.send(err);
  }
});

router.delete("/user/me", auth, async (req, res) => {
  sendCancellationEmail(req.user.email, req.user.name);
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send(`err deleting user and tasks....try again`);
  }
});

// upload profile images for user
// upload file size and file type
const upload = multer({
  limits: {
    fileSize: 1000000, //1000000 is 1mb
  },
  fileFilter(req, file, cb) {
    //regular expression to check if the file extensiions contain .jpg or .jpeg
    if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
      return cb(new Error(`please upload a jpg or jpeg file`));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //resize the image and reduce a specific width and height
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("image upload Successful");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send("image deleted success");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//to get the image we can see http://localhost:5000/users/5ecd1114ac6e2f2bd4adfad4/avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new Error(`user does not have a profile picture`);
    }
    res.set("Content-Type", "image/png");
    res.status(200).send(user.avatar);
  } catch (error) {
    res.status(400).send;
  }
});

module.exports = router;
