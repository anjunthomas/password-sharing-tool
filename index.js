require('dotenv').config();
const express = require('express')
const app = express();

const courses = [
    {id: 1, name: 'course1'},
    {id: 2, name: 'course2'},
    {id: 3, name: 'course3'},
];

app.get('/', (req, res) => {
    res.send('Hello World!!');
});


app.get('/api/courses', (req, res) => {
    res.send(courses);
});


// Ex. http://localhost:5000/api/courses/1
// Express sees that this matches the pattern /api/courses/:id
// grabs the part of the URl in place of :id
// stores it in req.params.id - an object
// { id: '1' } this is an object
// res.send('1') = 1
app.get('/api/courses/:id', (req, res) => {
    let course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send('The course with the given ID was not found');
    res.send(course);
});

// http://localhost:5000/api/posts/2018/1
// we will see {"year":"2018","month":"1"}
app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
});

// query string parameters = ?key=value part of URL 
// http://localhost:5000/api/posts/2018/1?sortBy=name

app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.query)
})


//app.post('/', (req, res))
//app.patch('/', ())
//app.delete()

// PORT

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`listening on ${PORT}!!`)
});
