const mongoose = require(`mongoose`);
const validator = require(`validator`);
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`Email is invalid`);
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error(
            `age cannot be a negative number , you provide ${value}`
          );
        }
      },
    },
    password: {
      type: String,
      minlength: 7,
      trim: true,
      required: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error(`This password cannot contain password`);
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual(`tasks`, {
  ref: `Task`,
  localField: `_id`,
  foreignField: `owner`,
});

//creating a new public profile by tweaking the user
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar
  console.log("logging", userObject);
  return userObject;
};

//creating a new public profile by tweaking the user
userSchema.methods.getPublicProfile = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  console.log("logging", userObject);
  return userObject;
};

//creating a new function on the user Instance to generate jwt tokens
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token: token });
  await user.save();
  return token;
};
//creating a new function on the User model to enable login
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`unable to login`);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error(`unable to login`);
  }
  return user;
};

//before hashing the password
userSchema.pre("save", async function (next) {
  const user = this;
  console.log(`just before  saving`);
  if (user.isModified(`password`)) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//When a user is deleted , all his tasks shooould be edeleted too
userSchema.pre("remove", async function (next) {
  const user = this;
  console.log(`just before  deleting`);
  console.log(user);
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
