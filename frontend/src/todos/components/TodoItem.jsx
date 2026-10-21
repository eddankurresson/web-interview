import React from 'react'
import { Checkbox, IconButton, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { getDueDateLabel, hasTaskName } from '../utils'

export const TodoItem = ({ todo, index, isSaving, onChange, onDelete }) => {
  const taskNumber = index + 1
  const isNameMissing = !hasTaskName(todo.text)
  const nameHelpText = isNameMissing ? 'Enter a task name.' : ''
  const dueDateHelpText = getDueDateLabel(todo.dueDate, todo.completed)
  const textDecoration = todo.completed ? 'line-through' : 'none'

  const handleCompletionChange = (event) => {
    onChange({ completed: event.target.checked })
  }

  const handleNameChange = (event) => {
    onChange({ text: event.target.value })
  }

  const handleDueDateChange = (event) => {
    onChange({ dueDate: event.target.value })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
      <Checkbox
        checked={todo.completed}
        disabled={isSaving}
        inputProps={{ 'aria-label': `Mark task ${taskNumber} as complete` }}
        onChange={handleCompletionChange}
      />
      <TextField
        sx={{ flexGrow: 1, '& input': { textDecoration } }}
        label={`Task ${taskNumber}`}
        value={todo.text}
        required
        error={isNameMissing}
        helperText={nameHelpText}
        disabled={isSaving}
        onChange={handleNameChange}
      />
      <TextField
        type='date'
        label='Due date'
        value={todo.dueDate || ''}
        disabled={isSaving}
        InputLabelProps={{ shrink: true }}
        inputProps={{ 'aria-label': `Due date for task ${taskNumber}`, max: '9999-12-31' }}
        helperText={dueDateHelpText}
        onChange={handleDueDateChange}
      />
      <IconButton aria-label={`Delete task ${taskNumber}`} disabled={isSaving} onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </div>
  )
}
