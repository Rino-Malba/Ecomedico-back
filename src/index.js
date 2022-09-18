import express from 'express'
import storage from './memory_storage'
import cors from 'cors'

app.use(cors())
console.log(storage)

const app = express()
const port = 3000

app.get('/products',(req, res)=>{
    
    let products = storage.products

    res.json(products)
    
});

app.listen(port, ()=> console.log(`Slušam na portu ${port}!`))