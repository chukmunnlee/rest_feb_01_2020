//Load all the required libraries
const morgan = require('morgan');
const cors = require('cors');
const uuid = require('uuid');
const express = require('express');

//Load fake database
const db = require('./data/restaurant');

// Create an instance of express application
const app = express();

// Log all incoming requests
app.use(morgan('tiny'))
// Set CORS headers
app.use(cors())

// GET /api/restaurants?offset=num&limit=num  - get a list of 10 restaurants
app.get(
    '/api/restaurants',
    (req, resp) => {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const result = db.slice(offset, offset + limit)
            .map(v => {
                return {
                    id: v._id.$oid,
                    name: v.name
                }
            })
        resp.status(200)
        resp.type('application/json')
        resp.json({ offset, limit, result, timestamp: (new Date()).toString() });
    }
)

// GET /api/restaurant/<id>
app.get(
    '/api/restaurant/:rId',
    (req, resp) => {
        const rId = req.params.rId;
        const result = db.find(v => (v._id.$oid == rId))
        if (result) {
            resp.status(200)
            resp.type('application/json')
            resp.json(result);
        } else {
            resp.status(404)
            resp.type('application/json')
            resp.json({ message: `key not found ${rId}`});
        }
    }
)

/*
    {"URL":"http://www.just-eat.co.uk/restaurants-cn-chinese-cardiff/menu",
    "_id":{"$oid":"55f14312c7447c3da7051b26"},
    "address":"228 City Road",
    "address line 2":"Cardiff",
    "name":".CN Chinese",
    "outcode":"CF24", "postcode":"3JH",
    "rating":5, "type_of_food":"Chinese"},
*/

// POST /api/restaurant
app.post(
    '/api/restaurant',
    // applicaiton/x-www-form-urlencoded
    express.urlencoded({ extended: true}),
    (req, resp) => {
        const id = uuid().replace(/-/g, '')
        const newRec = {
            _id: { $oid: id },
            name: req.body.name, 
            address: req.body.address
        }
        db.unshift(newRec);
        resp.status(201)
        resp.type('application/json')
        resp.json(id)
    }
)

// Handle errors
app.use(
    (req, resp) => {
        resp.status(404)
        resp.format({
            'text/html': () => {
                resp.type('text/html')
                resp.send('<h2>Not found</h2>')
            },
            'application/json': () => {
                resp.type('application/json')
                resp.json({ message: `resource not found: ${req.originalUrl}`})
            },
            'default': () => {
                resp.type('text/plain')
                resp.send('cannot process your request')

            }
        })
    }
)

// Start the express server
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT,
    () => { console.info(`Application started on port ${PORT} at ${new Date()}`); }
)