const express = require('express');
// For logs of api call
// const fs = require('fs');
const cors = require('cors');
require('./DB/config');
const User = require('./DB/user');
const Product = require('./DB/product');
const JWT = require('jsonwebtoken');
const jwtKey = 'e-comm';
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
    JWT.sign({ result }, jwtKey, { expiresIn: '2h' }, (err, token) => {
        if (err) {
            resp.send({ result: "Something Went wrong...!" });
        }
        resp.send({ result, auth: token });
    })
});

app.post('/login', async (req, resp) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select('-password');
        if (user) {
            JWT.sign({ user }, jwtKey, { expiresIn: '2h' }, (err, token) => {
                if (err) {
                    resp.send({ result: "Something Went wrong...!" });
                }
                resp.send({ user, auth: token });
            })
        } else {
            resp.send({ result: "No user found!!!" });
        }
    } else {
        resp.send({
            result: "No user found!!!"
        });
    }
});

app.post('/add-product', varifyToken, async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
});

app.get('/products', varifyToken, async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products);
    } else {
        resp.send({ result: 'No data found' });
    }
});

app.delete('/product/:id', varifyToken, async (req, resp) => {
    let result = await Product.deleteOne({ _id: req.params.id });
    resp.send(result);
});

app.get('/product/:id', varifyToken, async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result)
    } else {
        resp.send({ result: "No match found" });
    }
});

app.put('/product/:id', varifyToken, async (req, resp) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    );
    resp.send(result);
});

app.get('/search/:key', varifyToken, async (req, resp) => {
    let result = await Product.find({
        $or: [
            { name: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { company: { $regex: req.params.key } }
        ]
    });
    resp.send(result)
});

function varifyToken(req, resp, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        JWT.verify(token, jwtKey, (err, valid) => {
            if (err) {
                resp.status(401).send({ result: "please provide valid token in header..!" })
            } else {
                next();
            }
        })
    } else {
        resp.status(403).send({ result: "please send token in header..!" })
    }
}

app.listen(5000);