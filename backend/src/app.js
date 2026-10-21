import express from 'express'
import cors from 'cors'
import { createTodoStore, isValidListTitle, isValidTodos } from './todoStore.js'

const copyTodoFields = ({ id, text, completed, dueDate }) => {
  const todo = { id, text, completed }
  if (dueDate !== undefined) todo.dueDate = dueDate
  return todo
}

export const createApp = (store = createTodoStore()) => {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const sendApiInfo = (req, res) => {
    res.send('Todo API')
  }

  const getTodoLists = (req, res) => {
    const lists = store.getAll()
    res.json(lists)
  }

  const updateTodoList = (req, res) => {
    const submittedTodos = req.body?.todos
    if (!isValidTodos(submittedTodos)) {
      return res.status(400).json({ message: 'Invalid todo items' })
    }

    const todos = submittedTodos.map(copyTodoFields)
    const updatedList = store.update(req.params.id, todos)
    if (!updatedList) {
      return res.status(404).json({ message: 'List not found' })
    }

    return res.json(updatedList)
  }

  const createTodoList = (req, res) => {
    const title = req.body?.title
    if (!isValidListTitle(title)) {
      return res.status(400).json({ message: 'A list name is required' })
    }
    const createdList = store.create(title.trim())
    return res.status(201).json(createdList)
  }

  const renameTodoList = (req, res) => {
    const title = req.body?.title
    if (!isValidListTitle(title)) {
      return res.status(400).json({ message: 'A list name is required' })
    }
    const renamedList = store.rename(req.params.id, title.trim())
    if (!renamedList) return res.status(404).json({ message: 'List not found' })
    return res.json(renamedList)
  }

  const deleteTodoList = (req, res) => {
    const wasDeleted = store.delete(req.params.id)
    if (!wasDeleted) return res.status(404).json({ message: 'List not found' })
    return res.json({ id: req.params.id })
  }

  app.post('/api/todo-lists', createTodoList)
  app.patch('/api/todo-lists/:id', renameTodoList)
  app.delete('/api/todo-lists/:id', deleteTodoList)
  app.get('/', sendApiInfo)
  app.get('/api/todo-lists', getTodoLists)
  app.put('/api/todo-lists/:id', updateTodoList)

  return app
}
