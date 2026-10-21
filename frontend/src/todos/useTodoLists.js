import { useCallback, useEffect, useState } from 'react'
import { createTodoList, deleteTodoList, fetchTodoLists, renameTodoList, updateTodoList } from './api'

export const useTodoLists = () => {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const applyLoadedLists = (loadedLists) => {
      setLists(loadedLists)
    }

    fetchTodoLists(controller.signal)
      .then(applyLoadedLists)
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [loadAttempt])

  const replaceSavedList = useCallback((savedList) => {
    setLists((currentLists) =>
      currentLists.map((list) => (list.id === savedList.id ? savedList : list)),
    )
  }, [])

  const retryLoadingLists = () => {
    setLoadAttempt((currentAttempt) => currentAttempt + 1)
  }

  const saveList = useCallback(async (id, todos) => {
    setSaving(true)
    try {
      const savedList = await updateTodoList(id, todos)
      replaceSavedList(savedList)
    } finally {
      setSaving(false)
    }
  }, [replaceSavedList])

  const createList = async (title) => {
    setSaving(true)
    try {
      const createdList = await createTodoList(title)
      setLists((currentLists) => [...currentLists, createdList])
      return createdList
    } finally {
      setSaving(false)
    }
  }

  const renameList = async (id, title) => {
    setSaving(true)
    try {
      const renamedList = await renameTodoList(id, title)
      replaceSavedList(renamedList)
    } finally {
      setSaving(false)
    }
  }

  const deleteList = async (id) => {
    setSaving(true)
    try {
      await deleteTodoList(id)
      setLists((currentLists) => currentLists.filter((list) => list.id !== id))
    } finally {
      setSaving(false)
    }
  }

  return {
    createList,
    renameList,
    deleteList,
    lists,
    loading,
    saving,
    error,
    saveList,
    retry: retryLoadingLists,
  }
}
