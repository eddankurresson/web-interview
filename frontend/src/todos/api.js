import { isTodoList, isTodoLists } from './validation'

const API_URL = 'http://localhost:3001/api/todo-lists'
const REQUEST_TIMEOUT_MS = 10000

const request = async (url, options, validate, errorMessage) => {
  const controller = new AbortController()
  const cancelRequest = () => controller.abort()
  const cancellationSignal = options.signal
  if (cancellationSignal?.aborted) cancelRequest()
  cancellationSignal?.addEventListener('abort', cancelRequest)
  const timer = setTimeout(cancelRequest, REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) throw new Error('Request failed')
    const data = await response.json()
    if (!validate(data)) throw new Error('Invalid response')
    return data
  } catch (error) {
    // Unmount cancellation stays silent; timeout is shown as a retryable failure.
    if (cancellationSignal?.aborted) throw error
    throw new Error(errorMessage)
  } finally {
    clearTimeout(timer)
    cancellationSignal?.removeEventListener('abort', cancelRequest)
  }
}

export const fetchTodoLists = (signal) =>
  request(API_URL, { signal }, isTodoLists, 'We couldn’t load your lists. Please try again.')

export const updateTodoList = (id, todos) =>
  request(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todos }),
    },
    (list) => isTodoList(list) && list.id === id,
    'We couldn’t save your changes. Your edits are still here, please try again.',
  )

export const createTodoList = (title) =>
  request(
    API_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    },
    isTodoList,
    'We couldn’t confirm creation. Reload the lists before trying again.',
  )

export const renameTodoList = (id, title) =>
  request(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    },
    (list) => isTodoList(list) && list.id === id,
    'We couldn’t rename this list. Please try again.',
  )

export const deleteTodoList = (id) =>
  request(
    `${API_URL}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    (result) => result !== null && result.id === id,
    'We couldn’t confirm deletion. Reload the lists before trying again.',
  )
