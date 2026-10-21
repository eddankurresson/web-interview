import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Card, CardContent, CardActions, Button, Chip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { TodoItem } from './TodoItem'
import { areTodosEqual, formatSavedTime, hasTaskName, isListCompleted } from '../utils'

export const TodoListForm = ({ todoList, todos, onTodosChange, saveTodoList, isSaving }) => {
  const [saveError, setSaveError] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const hasUnnamedTasks = todos.some((todo) => !hasTaskName(todo.text))

  const hasUnsavedChanges = !areTodosEqual(todos, todoList.todos)
  const isSaveDisabled = isSaving || hasUnnamedTasks
  const canAutosave = hasUnsavedChanges && !isSaveDisabled && !saveError
  const isEntireListCompleted = isListCompleted(todos)
  const isListEmpty = todos.length === 0
  const saveButtonText = isSaving ? 'Saving…' : 'Save'

  const changeTodos = (nextTodos) => {
    onTodosChange(nextTodos)
    setSavedAt(null)
    setSaveError('')
  }

  const updateTodo = (id, changes) => {
    changeTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)))
  }

  const deleteTodo = (id) => {
    changeTodos(todos.filter((todo) => todo.id !== id))
  }

  const addTodo = () => {
    changeTodos([...todos, { id: crypto.randomUUID(), text: '', completed: false }])
  }

  const saveChanges = useCallback(async () => {
    if (isSaveDisabled) return
    setSaveError('')
    setSavedAt(null)
    try {
      await saveTodoList(todoList.id, todos)
      setSavedAt(new Date())
    } catch (error) {
      setSaveError(error.message)
    }
  }, [isSaveDisabled, saveTodoList, todoList.id, todos])

  useEffect(() => {
    if (!canAutosave) return

    const timer = setTimeout(saveChanges, 3000)
    return () => clearTimeout(timer)
  }, [canAutosave, saveChanges])

  const handleSubmit = (event) => {
    event.preventDefault()
    saveChanges()
  }

  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2'>{todoList.title}</Typography>
        {isEntireListCompleted && <Chip label='All tasks completed' color='success' />}
        <Typography variant='body2'>Changes save automatically after 3 seconds when all tasks have names.</Typography>
        <form onSubmit={handleSubmit}>
          {todos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              index={index}
              isSaving={isSaving}
              onChange={(changes) => updateTodo(todo.id, changes)}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))}
          {isListEmpty && <Typography sx={{ mt: 2 }}>No tasks yet.</Typography>}
          {saveError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
          {savedAt && (
            <Alert severity='success' sx={{ mt: 2 }}>
              Saved at {formatSavedTime(savedAt)}
            </Alert>
          )}
          <CardActions>
            <Button disabled={isSaving} onClick={addTodo}>
              Add Todo <AddIcon />
            </Button>
            <Button type='submit' variant='contained' disabled={isSaveDisabled}>
              {saveButtonText}
            </Button>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  )
}
