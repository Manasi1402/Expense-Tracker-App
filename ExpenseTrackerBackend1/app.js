const path = require('path');

const express = require('express');
var cors = require('cors')

const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');




const userRoutes = require('./routes/user')
const purchaseRoutes = require('./routes/purchase')
const resetPasswordRoutes = require('./routes/resetpassword')

const app = express();
const dotenv = require('dotenv');


dotenv.config();


app.use(cors());


app.use(express.json());  

app.use('/user', userRoutes)


app.use('/purchase', purchaseRoutes)

app.use('/password', resetPasswordRoutes);



User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })