MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log(error, `unable to connect to db`);
    }
    const db = client.db(databaseName);
    db.collection(`users`).insertMany(
      [
        {
          name: `maleem`,
          age: 28,
        },
        {
          name: `fisayo`,
          age: 25,
        },
      ],
      (err, result) => {
        if (err) {
          return console.log(err, `unable to insert document`);
        }
        console.log(result.ops);
      }
    );
  }
);

//     db.collection(`users`).insertOne(
//       {
//         name: `vector`,
//        age: 24,
//       },
//    (err, result) => {
//        if (err) {
//         return console.log(err,`unable to select user`);
//       }
//      console.log(result.ops)
//     }
//   );

db.collection(`tasks`).insertMany(
  [
    {
      description: `code`,
      completed: true,
    },
    {
      description: `test`,
      completed: false,
    },
    {
      description: `deploy`,
      completed: false,
    },
  ],
  (error, result) => {
    if (error) {
      return console.log(error);
    }
    console.log(result.ops);
  }
);

db.collection(`users`).findOne(
  { _id: new ObjectID("5ec62be64d97624ce317f89a") },
  (err, result) => {
    if (err) {
      return console.log(err, `unable to fetch`);
    }
    console.log(result);
  }
);

db.collection(`tasks`)
      .find({ completed: true })
      .toArray((err, tasks) => {
        console.log(tasks);
      });

      db.collection(`tasks`)
      .find({ completed: true})
      .count((err, tasks) => {
        console.log(tasks);
      });


      db.collection(`users`).updateOne({
        _id : new ObjectID("5ec4f3eecd635831d1558c0c")
      }, {
          $inc: {
          age: 2
        }
      }).then((res) => {
        console.log(res)
      }).catch(
        err => console.log(err)
      )
    }


    const User = mongoose.model("User", {
      name: {
        type: String,
      },
      age: {
        type: Number,
      },
    });

    const me = new User({ name: `Alsaheem`, age: 22 });
    me.save()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });



      const me = new User({ name: `   Semnut`, email: `sem@gmail.COM `, password: `al` });
      me.save()
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err.message);
        });

        const Task = mongoose.model("Task", {
          description: {
            type: String,
            trin: true,
            required: true,
          },
          completed: {
            type: Boolean,
            default: false,
          },
        });

        const task = new Task({ description: `  Learn Firebase` });
        task
          .save()
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err.message);
          });


          const myFunction = async () => {
            const token = jwt.sign({ _id: `123dsc` }, `thisisanid`, {
              expiresIn: `7 days`,
            });
            console.log(token);
            const data = jwt.verify(token, `thisisanid`);
            console.log(data);
          };

myFunction();


router.patch("/user/:id", async (req, res) => {
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
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    if (!user) {
      return res.status(404).send(`user with id cannot be found`);
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500); //set status to  400
    res.send(err);
  }
});