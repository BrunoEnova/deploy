const express = require('express')
const app = express();
const {PrismaClient}= require('@prisma/client')
const  { z,ZodError}= require("zod")

app.use(express.json())

const prisma = new PrismaClient();

app.get("/", async function(req, res){

  try{
    await prisma.$queryRaw("SELECT 1")
    res.status(200).json({status: "ok", postgres: "ok" })
  
  }catch(err){
    res.status(200).json({status: "parcial", postgres: "bad" })
  }


})

app.get("/professores", async function(req, res){
  const professores = await prisma.professor.findMany();
  res.status(200).json(professores)
})

app.get("/professores/:id/demitidos", async function (req, res){
  const id = req.params.id

  const professores = await prisma.professor.findMany({where: {demitido: true }});
  res.status(200).json(professores)

})

app.put("/professores/:id/demitidos", async function (req, res){
  const id = req.params.id

  const professor = await prisma.professor.findUnique({where: {id}});

  if(professor==null) {
    res.status(404).send()
    return
  }

  if(professor.demitido){
    res.status(422).send("Professor já está demitido")
    return
  }

  await prisma.professor.update({where: {id}, data: {...professor, demitido: true}})

  res.status(204).send()

})

app.get("/professores/:id", async function(req, res){
  const id = req.params.id

  const professor = await prisma.professor.findUnique({where: {id, }});

  if(professor==null) {
    res.status(404).send()
    return
  }


  res.status(200).json(professor)
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