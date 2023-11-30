const express = require('express')
const app = express();
const {PrismaClient}= require('@prisma/client')
const  { z,ZodError}= require("zod")

app.use(express.json())

const prisma = new PrismaClient();

app.get("/professores", async function(req, res){
  const professores = await prisma.professor.findMany();
  res.status(200).json(professores)
})

app.post("/professores", async function(req, res){

  try {
    const createProfessorSchema = z.object({
      nome: z.string(),
      email: z.string().email(),
    })
    const {nome, email} =createProfessorSchema.parse(req.body)
    const professor = await prisma.professor.create({
      data: {
        nome,
        email,
      }
    })
    res.status(201).json({...professor})

  }catch(err){
    if (err instanceof ZodError) {
     res.status(422).send(err.message)
     return
    }

    res.status(500).send(err.message)
  }
 

})

app.listen(Number(process.env.PORT || 3333), 
  ()=> console.log("Http server running")
)