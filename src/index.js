import express from 'express'
import storage from './memory_storage.js'
import connect from './db.js'
import cors from 'cors'
import auth from './auth.js';


const app = express()
const port = 3000


app.use(cors())
app.use(express.json());

app.patch('/user', [auth.verify], async (req, res) => {
    let changes = req.body;
    if (changes.new_password && changes.old_password) {
        let result = await auth.changeUserPassword(req.jwt.username, changes.old_password, changes.new_password);
        if (result) {
            res.status(201).send();
        } else {
            res.status(500).json({ error: 'cannot change password' });
        }
    } else {
        res.status(400).json({ error: 'unrecognized request' });
    }
});

app.post('/auth', async (req, res) => {
    let user = req.body;
    let username = user.username;
    let password = user.password;

    try {
        let result = await auth.authenticateUser(username, password);
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

app.post('/user', async (req, res) => {
    let user = req.body;

    try {
        let result = await auth.registerUser(user);
        res.status(201).send();
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

let primjer_middleware = (res, req, next) => {
    console.log('Ja se izvršavam prije ostatka handlera za rutu');
    res.varijabla_1 = 'OK';
    next();
};
let primjer_middleware_2 = (res, req, next) => {
    console.log('I ja se isto izvršavam prije ostatka handlera za rutu');
    res.varijabla_2 = 'isto OK';
    next();
};
app.get('/primjer', [primjer_middleware, primjer_middleware_2], (req, res) => {
    console.log('.. a tek onda se ja izvršavam.');
    console.log(req.varijabla_1);
    console.log(req.varijabla_2);

    res.send('OK');
});



app.get('/products', async (req, res) => {

    let db = await connect()

    let cursor = await db.collection("produkt").find().sort({postedAt: -1})
    let results = await cursor.toArray()

    res.json(results)
})

app.get('/products/:id', async (req, res) => {
    
    let id = req.params.id;
    let db = await connect();

    let doc = await db.collection("produkt").findOne({_id: mongo.ObjectId(id)})
    console.log(doc)
    res.json(doc)
})

let checkAttributes = (data) => {
    if (!data.name || !data.img || !data.price){
        return false
    }
    return true
}

app.put('/products/:id', async (req, res) => {
    let doc = req.body;
    delete doc._id;
    let id = req.params.id;
    let db = await connect();

    let result = await db.collection('products').replaceOne({ _id: mongo.ObjectId(id) }, doc);
    if (result.modifiedCount == 1) {
        res.json({
            status: 'success',
            id: result.insertedId,
        });
    } else {
        res.status(500).json({
            status: 'fail',
        });
    }
});

app.patch('/products/:id', async (req, res) => {
    let doc = req.body;
    delete doc._id;
    let id = req.params.id;
    let db = await connect();

    let result = await db.collection('produkt').updateOne(
        { _id: mongo.ObjectId(id) },
        {
            $set: doc,
        }
    );
    if (result.modifiedCount == 1) {
        res.json({
            status: 'success',
            id: result.insertedId,
        });
    } else {
        res.status(500).json({
            status: 'fail',
        });
    }
});

app.get('/products', async (req, res) => {

    let db = await connect()
    let query = req.query;

    let selekcija = {}
    if(query.title) {
        selekcija.title = new RegExp(query.title)
    }

    console.log ("Selekcija", selekcija)

    let cursor = await db.getCollection("produkt").find(selekcija)
    let results = await cursor.toArray()

    res.json(results)

})

app.get('/products', [auth.verify], async (req, res) => {
    let db = await connect();
    let query = req.query;

    let selekcija = {};

    if (query._any) {
       
        let pretraga = query._any;
        let terms = pretraga.split(' ');

        let atributi = ['title', 'createdBy'];

        selekcija = {
            $and: [],
        };

        terms.forEach((term) => {
            let or = {
                $or: [],
            };

            atributi.forEach((atribut) => {
                or.$or.push({ [atribut]: new RegExp(term) });
            });

            selekcija.$and.push(or);
        });
    }

    let cursor = await db.collection('posts').find(selekcija);
    let results = await cursor.toArray();

    res.json(results);
});

app.get('/products_memory',(req, res)=>{
    
    let product = storage.products
    let query = req.query
    
    if (query.name){
        product = product.filter (e => e.title.indexOf(query.title) >= 0)
    }

    if(query._any){
        let terms = query._any.split(" ")
        product = product.filter (doc => {
            let info = doc.name + " "
            return terms.every (term => info.indexOf(term) >= 0)
        })
    }
    
    res.json(product)
    
})

app.listen(port, ()=> console.log(`Slušam na portu ${port}!`));