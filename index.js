const express = require('express');
// For logs of api call
// const fs = require('fs');
const cors = require('cors');
require('./DB/config');
const User = require('./DB/user');
const Product = require('./DB/product');
const app = express();

app.use(express.json());
app.use(cors());

// For logs of api call
// var logger = require('morgan');
// app.use(logger('common', {
//     stream: fs.createWriteStream('./access.log', { flags: 'a' })
// }));
// app.use(logger('dev'));

app.post('/register', async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    resp.send(result);
});

app.post('/login', async (req, resp) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select('-password');
        if (user) {
            resp.send(user);
        } else {
            resp.send({
                result: "No user found!!!"
            })
        }
    } else {
        resp.send({
            result: "No user found!!!"
        })
    }
})

app.post('/add-product', async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
})

app.get('/products', async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products);
    } else {
        resp.send({ result: 'No data found' })
    }
})

app.listen(5000);