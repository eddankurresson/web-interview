export const hasTaskName = (text) => typeof text === 'string' && text.trim().length > 0

export const isListCompleted = (todos) => todos.length > 0 && todos.every((todo) => todo.completed)

// Order matters because it determines the displayed task order.
export const areTodosEqual = (left, right) =>
  left.length === right.length &&
  left.every(
    (todo, index) =>
      todo.id === right[index].id &&
      todo.text === right[index].text &&
      todo.completed === right[index].completed &&
      (todo.dueDate || '') === (right[index].dueDate || ''),
  )

// Compare calendar dates, so daylight-saving changes do not affect the day count.
export const getDueDateLabel = (dueDate, completed, today = new Date()) => {
  if (!dueDate || completed) return ''
  const todayAsUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const dueAsUtc = new Date(`${dueDate}T00:00:00Z`).getTime()
  const days = Math.round((dueAsUtc - todayAsUtc) / 86400000)
  if (days === 0) return 'Due today'
  const count = Math.abs(days)
  const unit = count === 1 ? 'day' : 'days'
  return days > 0 ? `${count} ${unit} remaining` : `${count} ${unit} overdue`
}

export const formatSavedTime = (date) => date.toLocaleTimeString('sv-SE', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
