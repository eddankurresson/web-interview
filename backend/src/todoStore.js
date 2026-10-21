import { randomUUID } from 'node:crypto'

const isValidDueDate = (value) => {
  if (value === undefined || value === '') return true
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const createTodoStore = () => {
  const lists = [
    {
      id: '0000000001',
      title: 'First List',
      todos: [{ id: randomUUID(), text: 'First todo of first list!', completed: false }],
    },
    {
      id: '0000000002',
      title: 'Second List',
      todos: [{ id: randomUUID(), text: 'First todo of second list!', completed: false }],
    },
  ]
  const getAllLists = () => lists

  const updateListTodos = (listId, todos) => {
    const selectedList = lists.find((list) => list.id === listId)
    if (!selectedList) return undefined

    selectedList.todos = todos
    return selectedList
  }

  const createList = (title) => {
    const newList = { id: randomUUID(), title, todos: [] }
    lists.push(newList)
    return newList
  }

  const renameList = (listId, title) => {
    const selectedList = lists.find((list) => list.id === listId)
    if (!selectedList) return undefined
    selectedList.title = title
    return selectedList
  }

  const deleteList = (listId) => {
    const listIndex = lists.findIndex((list) => list.id === listId)
    if (listIndex === -1) return false
    lists.splice(listIndex, 1)
    return true
  }

  return {
    create: createList,
    rename: renameList,
    delete: deleteList,
    getAll: getAllLists,
    update: updateListTodos,
  }
}

const isValidTodo = (todo) =>
  todo !== null &&
  typeof todo === 'object' &&
  !Array.isArray(todo) &&
  typeof todo.id === 'string' &&
  todo.id.trim().length > 0 &&
  typeof todo.text === 'string' &&
  todo.text.trim().length > 0 &&
  typeof todo.completed === 'boolean' &&
  isValidDueDate(todo.dueDate)

export const isValidTodos = (todos) =>
  Array.isArray(todos) &&
  todos.every(isValidTodo) &&
  new Set(todos.map((todo) => todo.id)).size === todos.length

export const isValidListTitle = (title) => typeof title === 'string' && title.trim().length > 0
