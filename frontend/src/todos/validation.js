import { hasTaskName } from './utils'

const isValidDueDate = (value) => {
  if (value === undefined || value === '') return true
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const hasId = (value) => typeof value === 'string' && value.trim().length > 0
const hasUniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length

const isTodo = (todo) =>
  todo !== null &&
  typeof todo === 'object' &&
  hasId(todo.id) &&
  hasTaskName(todo.text) &&
  typeof todo.completed === 'boolean' &&
  isValidDueDate(todo.dueDate)

export const isTodoList = (list) =>
  list !== null &&
  typeof list === 'object' &&
  hasId(list.id) &&
  typeof list.title === 'string' &&
  Array.isArray(list.todos) &&
  list.todos.every(isTodo) &&
  hasUniqueIds(list.todos)

export const isTodoLists = (lists) =>
  Array.isArray(lists) && lists.every(isTodoList) && hasUniqueIds(lists)
