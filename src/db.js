import mongo from 'mongodb';

// let connection_string = 'mongodb+srv://admin:admin@nt-cluster-jmi8g.mongodb.net/fipugram?retryWrites=true&w=majority';
let connection_string = 'mongodb+srv://Rino:WebApp123@rm-cluster.l1jtr2i.mongodb.net/ecomedico?retryWrites=true&w=majority';

let client = new mongo.MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db = null;

// eksportamo Promise koji resolva na konekciju
export default () => {
    return new Promise((resolve, reject) => {
        // ako smo inicijalizirali bazu i klijent je još uvijek spojen
        if (db && client.isConnected()) {
            resolve(db);
        } else {
            client.connect((err) => {
                if (err) {
                    reject('Spajanje na bazu nije uspjelo:' + err);
                } else {
                    console.log('Database connected successfully!');
                    db = client.db('fipugram');
                    resolve(db);
                }
            });
        }
    });
};

/*const mongoose = require ("mongoose");

const uri =
  "mongodb+srv://Rino:WebApp123@rm-cluster.l1jtr2i.mongodb.net/ecomedico?retryWrites=true&w=majority";

  async function connect(){
    try{
      await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
      console.log("connected to mongodb");
    }catch (error){
      console.log(error);
    }
  }

connect();

const ProductSchema = mongoose.Schema ({
  name: String,
  img: String,
  price: String,
  quantity: Number
})

module.exports = mongoose.model("Product", ProductSchema)

let db = null

export default {}*/