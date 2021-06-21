const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(
  'mongodb+srv://admin-aavaig:test123@cluster0.vkj51.mongodb.net/bankingAppDB',
  {
    useNewUrlParser: true,
  }
);

const balanceSchema = {
  balance: Number,
};

const Balance = mongoose.model('Balance', balanceSchema);

const balance = new Balance({
  balance: 50000000,
});

// balance.save();

const userSchema = {
  _id: {
    type: Number,
    required: true,
  },
  firstName: String,
  lastName: String,
  email: String,
  balance: Number,
  gender: String,
  age: Number,
};

const User = mongoose.model('User', userSchema);

const historySchema = {
  tFName: String,
  tLName: String,
  rFName: String,
  rLName: String,
  Amount: Number,
};

const History = mongoose.model('History', historySchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/transaction', (req, res) => {
  User.find({}, (err, user) => {
    // console.log(user);
    if (!err) {
      res.render('transaction', { userList: user });
    } else {
      console.log(err);
    }
  });
});

app.get('/history', async (req, res) => {
  let historyList;

  await History.find({}, (err, list) => {
    if (!err) {
      historyList = list;
      console.log(list);
    } else {
      console.log(err);
    }
  });

  // const numHistory = History.countDocuments({}, (err, count) => {
  //   if (!err) {
  //     console.log(count);
  //   } else {
  //     console.log(err);
  //   }
  // });

  // console.log(numHistory);
  res.render('history', {
    list: historyList,
  });
});

app.post('/transact', async (req, res) => {
  const id = req.body.id;
  let usersList;
  let curUser;
  console.log(id);

  await User.findById(id, (err, user) => {
    if (!err) {
      curUser = user;
    } else {
      console.log(err);
    }
  });

  await User.find({}, (err, userList) => {
    if (!err) {
      usersList = userList;
      // console.log(usersList);
    } else {
      console.log(err);
    }
  });

  res.render('transact', {
    usersList: usersList,
    curUserId: id,
    fName: curUser.firstName,
    lName: curUser.lastName,
    email: curUser.email,
    gender: curUser.gender,
    age: curUser.age,
    balance: curUser.balance,
  });
});

app.post('/transaction', async (req, res) => {
  console.log(req.body);
  let transferrer, receiver;

  await User.findById(req.body.transferrer, async (err, user) => {
    if (!err) {
      transferrer = user;
      console.log(transferrer);
      await User.findByIdAndUpdate(
        user._id,
        { balance: Number(user.balance - Number(req.body.amount)) },
        (err, user) => {
          if (!err) {
          } else {
            console.log(err);
          }
        }
      );

      await User.find({ firstName: req.body.user }, async (err, user) => {
        if (!err) {
          receiver = user[0];
          console.log(receiver);
          await User.findByIdAndUpdate(
            user[0]._id,
            { balance: Number(user[0].balance + Number(req.body.amount)) },
            (err, user) => {
              if (!err) {
              } else {
                console.log(err);
              }
            }
          );
        } else {
          console.log(err);
        }
      });

      const newTransaction = new History({
        tFName: transferrer.firstName,
        tLName: transferrer.lastName,
        rFName: receiver.firstName,
        rLName: receiver.lastName,
        Amount: req.body.amount,
      });

      newTransaction.save();
    } else {
      console.log(err);
    }
  });

  // Newtransaction.save();

  setTimeout(() => {
    res.redirect('/transaction');
  }, 3000);
});

app.listen(process.env.PORT || port, () => {
  console.log('App started at port');
});
