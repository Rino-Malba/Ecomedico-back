import express from 'express'
import storage from './memory_storage.js'
import connect from './db.js'
import cors from 'cors'
const mongoose = require("mongoose")


const app = express()
const port = 3000


app.use(cors())
app.use(express.json());

async function run() {
    const pro = new Product({
        name: "Hodalica", 
        img: "https://www.eistra.info/ljekarne_mm/2016-11-2_ortopedska-pomagala.jpg",
        price: "484, 05 kn",
        quantity: 0
    })
    await pro.save().then(() => console.log("Product saved"))
    console.log (pro)
}



app.post('/products', (req, res) => {
    let data = req.body;

    data.postedAt = new Date().getTime();

    delete data._id

    let db = connect()

    storage.posts.push(data);

    // vrati ono što je spremljeno
    res.json(data); // vrati podatke za referencu
});

app.get('/produkt', async (req, res) => {

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

app.get('/products',(req, res)=>{
    
    let product = storage.products

    res.json(product)
    
});

app.listen(port, ()=> console.log(`Slušam na portu ${port}!`))