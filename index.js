const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');

const app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://ask:ask@cluster0.5nfwu.mongodb.net/student-mentor?retryWrites=true&w=majority";




app
.use(bodyParser.json())

.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })
.get('/students',(req,res)=>
{



    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student-mentor");
       
        dbo.collection("students").find().toArray(function(err, result) {
          
          if(err){res.status(400).json({status:"fail"});throw err;}
        else{res.json(result)}

          db.close();
        });
      });
 



})


.get('/students/:studentName',(req,res)=>
{

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student-mentor");
       query = {name:req.params.studentName}
        dbo.collection("students").find(query).toArray(function(err, result) {
          
          if(err){res.status(400).json({status:"fail"});throw err;}
        else{res.json(result[0])}

          db.close();
        });
      });
})


.get('/mentors',(req,res)=>
{

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student-mentor");
       
        dbo.collection("mentors").find().toArray(function(err, result) {
          
          if(err){res.status(400).json({status:"fail"});throw err;}
        else{res.json(result)}

          db.close();
        });
      });


})


.post("/students",(req,res)=>{
    console.log(typeof req.body.name !="string"||typeof req.body.age !="number"||typeof req.body.batch !="number"||typeof req.body.contact !="number"||typeof req.body.email !="string")
    if(typeof req.body.name !="string"||typeof req.body.age !="number"||typeof req.body.batch !="number"||typeof req.body.contact !="number"||typeof req.body.email !="string")
    {res.status(400).json({status:"fail",reason:"request body invalid"});return;}

    
    else{
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("student-mentor");
           query={name:req.body.name}
            dbo.collection("students").find(query).toArray(function(err, result) {
              
              if(err){res.status(400).json({status:"fail"});throw err;}
              if(result.length>0){res.status(400).json({status:"fail",reason:"user already exists"});return;}


            dbo.collection("students").insertOne({name:req.body.name,age:req.body.age,batch:req.body.batch,contact:req.body.contact,email:req.body.email,mentor_name:""},(err,result)=>{
                if(err){res.status(400).json({status:"fail"});throw err;}
                else{res.json({status:"success"})}
            })
    
              db.close();
            });
          });
    }
})



.post("/mentors",(req,res)=>{
    if(typeof req.body.name !="string"||typeof req.body.age !="number"||typeof req.body.contact !="number"||typeof req.body.email !="string")
    {res.status(400).json({status:"fail",reason:"request body invalid"});return;}

    

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student-mentor");
       query={name:req.body.name}
        dbo.collection("mentors").find(query).toArray(function(err, result) {
          
          if(err){res.status(400).json({status:"fail"});throw err;}
          if(result.length>0){res.status(400).json({status:"fail",reason:"user already exists"});return;}


        dbo.collection("mentors").insertOne({name:req.body.name,age:req.body.age,contact:req.body.contact,email:req.body.email,students:[]},(err,result)=>{
            if(err){res.status(400).json({status:"fail"});throw err;}
            else{res.json({status:"success"})}
        })

          db.close();
        });
      });

})



.post("/assignMentor",(req,res)=>{
    if(typeof req.body.student_name !="string"||typeof req.body.mentor_name !="string")
    {res.json({status:"fail",reason:"request body invalid"});return;}

    

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student-mentor");
       
        dbo.collection("mentors").find({name:req.body.mentor_name}).toArray(function(err, result) {
          
          if(err){res.status(400).json({status:"fail"});throw err;}
          if(result.length==0){res.status(400).json({status:"fail",reason:"mentor does not exist"});return;}

          dbo.collection("students").find({name:req.body.student_name}).toArray(function(err, result) {
            if(err){res.status(400).json({status:"fail"});throw err;}
            if(result.length==0){res.status(400).json({status:"fail",reason:"student does not exist"});return;}

            dbo.collection("students").updateOne({name:req.body.student_name},{$set:{mentor_name:req.body.mentor_name}},(err,result)=>{
                if(err){res.status(400).json({status:"fail"});throw err;}

            dbo.collection("mentors").updateOne({name:req.body.mentor_name},{$push:{students:req.body.student_name}},(err,result)=>{
                if(err){res.status(400).json({status:"fail"});throw err;}
                res.json({status:"Success"})
                db.close()
            })

            })



          })
            

          
        });
      });

})

.post("/removeMentor",(req,res)=>{
    if(typeof req.body.student_name !="string")
    {res.json({status:"fail",reason:"request body invalid"});return;}

    

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student-mentor");
       
     

          dbo.collection("students").find({name:req.body.student_name}).toArray(function(err, result) {
            if(err){res.status(400).json({status:"fail"});throw err;}
            if(result.length==0){res.status(400).json({status:"fail",reason:"student does not exist"});return;}

            dbo.collection("students").updateOne({name:req.body.student_name},{$set:{mentor_name:""}},(err,result)=>{
                if(err){res.status(400).json({status:"fail"});throw err;}

            dbo.collection("mentors").updateOne({students:req.body.student_name},{$pull:{students:req.body.student_name}},(err,result)=>{
                if(err){res.status(400).json({status:"fail"});throw err;}
                res.json({status:"Success"})
                db.close()
            })

            })



          
            

          
        });
      });



})

.post("/removeMentor",(req,res)=>{
    if(typeof req.body.student_name !="string")
    {res.json({status:"fail",reason:"request body invalid"});return;}

    

        fs.readFile("students.json",(err,data)=>{
    
            if(err){res.json({status:"fail"});throw err;}
            else{
                data=JSON.parse(data);

                if(!data.some((e)=>e.name==req.body.student_name)){res.status(400).json({status:"fail",reason:"user does not exist"});return;}

                fs.readFile("mentors.json",(err,data2)=>{if(err){res.status(400).json({status:"fail",reason:"unable to read mentors file"})}else{
                    
                    mentorData=JSON.parse(data2);
                    if(true){

                        if(mentorData.some((e)=>e.students.includes(req.body.student_name))){mentorData.find((e)=>e.students.includes(req.body.student_name)).students.remove(req.body.student_name)}

                        
                       
                        fs.writeFile("mentors.json",JSON.stringify(mentorData),(err)=>{
                            
                            if(err){res.status(400).json({status:"fail",reason:"unable to write mentors file"});return}
                            data.find((e)=>e.name==req.body.student_name).mentor_name="";

                
                            fs.writeFile("students.json",JSON.stringify(data),(err)=>{res.json(data)})
                            })


                }}})


            
            }
    
        })

})



app.listen(process.env.PORT || 5000)