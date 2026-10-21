import React, { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import { TodoListForm } from './TodoListForm'
import { useTodoLists } from '../useTodoLists'
import { useUnsavedChangesWarning } from '../useUnsavedChangesWarning'
import { isListCompleted, areTodosEqual } from '../utils'

export const TodoLists = ({ style }) => {
  const {
    lists,
    loading: isLoading,
    saving: isSaving,
    error: loadError,
    saveList,
    createList,
    renameList,
    deleteList,
    retry: retryLoadingLists,
  } = useTodoLists()
  const [listActionError, setListActionError] = useState('')
  const [activeListId, setActiveListId] = useState()
  const [draftTodos, setDraftTodos] = useState([])
  const selectedList = lists.find((list) => list.id === activeListId)
  const hasUnsavedChanges = selectedList ? !areTodosEqual(draftTodos, selectedList.todos) : false

  useUnsavedChangesWarning(hasUnsavedChanges)

  const confirmDiscardChanges = () => {
    if (!hasUnsavedChanges) return true
    return window.confirm('Discard unsaved changes?')
  }

  const selectList = (listId) => {
    const isAlreadySelected = listId === activeListId
    if (isAlreadySelected || isSaving) return
    if (!confirmDiscardChanges()) return

    const nextList = lists.find((list) => list.id === listId)
    if (!nextList) return

    setDraftTodos(nextList.todos)
    setActiveListId(listId)
  }
  const askForListName = (currentTitle = '') => {
    const enteredTitle = window.prompt('List name:', currentTitle)
    if (enteredTitle === null) return null
    const title = enteredTitle.trim()
    if (!title) {
      setListActionError('Enter a list name.')
      return null
    }
    return title
  }

  const handleCreateList = async () => {
    if (isSaving) return
    setListActionError('')
    const title = askForListName()
    if (!title || !confirmDiscardChanges()) return
    try {
      const createdList = await createList(title)
      setDraftTodos(createdList.todos)
      setActiveListId(createdList.id)
    } catch (error) {
      setListActionError(error.message)
    }
  }

  const handleRenameList = async () => {
    if (isSaving || !selectedList) return
    setListActionError('')
    const title = askForListName(selectedList.title)
    if (!title || title === selectedList.title) return
    try {
      await renameList(selectedList.id, title)
    } catch (error) {
      setListActionError(error.message)
    }
  }

  const handleDeleteList = async () => {
    if (isSaving || !selectedList) return
    const warning = `Delete "${selectedList.title}" and all its tasks? Unsaved changes will also be lost.`
    if (!window.confirm(warning)) return
    setListActionError('')
    try {
      await deleteList(selectedList.id)
      setActiveListId(undefined)
      setDraftTodos([])
    } catch (error) {
      setListActionError(error.message)
    }
  }

  if (isLoading) return <CircularProgress aria-label='Loading lists' sx={{ m: 2 }} />
  if (loadError)
    return (
      <Alert
        severity='error'
        sx={{ m: 2 }}
        action={
          <Button color='inherit' onClick={retryLoadingLists}>
            Try again
          </Button>
        }
      >
        {loadError}
      </Alert>
    )

  return (
    <>
      <Card style={style}>
        <CardContent>
          <Typography component='h2'>My Todo Lists</Typography>
          <Button disabled={isSaving} onClick={handleCreateList}>New list</Button>
          {selectedList && (
            <>
              <Button disabled={isSaving} onClick={handleRenameList}>Rename selected list</Button>
              <Button disabled={isSaving} color='error' onClick={handleDeleteList}>
                Delete selected list
              </Button>
            </>
          )}
          {listActionError && <Alert severity='error'>{listActionError}</Alert>}
          <List>
            {lists.map((list) => (
              <ListItemButton
                key={list.id}
                selected={activeListId === list.id}
                disabled={isSaving}
                onClick={() => selectList(list.id)}
              >
                <ListItemText primary={list.title} />
                {isListCompleted(list.todos) && (
                  <Chip label='Completed' color='success' size='small' />
                )}
              </ListItemButton>
            ))}
          </List>
          {lists.length === 0 && <Typography>No lists available.</Typography>}
        </CardContent>
      </Card>
      {selectedList && (
        <TodoListForm
          key={selectedList.id}
          todoList={selectedList}
          todos={draftTodos}
          onTodosChange={setDraftTodos}
          saveTodoList={saveList}
          isSaving={isSaving}
        />
      )}
    </>
  )
}
