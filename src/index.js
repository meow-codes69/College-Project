import 'dotenv/config';
import connectDb from "./db/mongodbConnection.js";
import { app } from './app.js';

const Port= process.env.PORT

connectDb()
.then(()=>{
  app.on('error',(error)=>{
    console.log("Express error,", error)
  })  

  app.listen(Port || 8000 ,()=>{
    console.log(`Server is running on port ${Port}`);
  })
})
.catch(err=>{
  console.error("Mongodb connection failed : ", err)
})
