import React, { useState, useEffect, useCallback, useRef } from "react"
import Loader from "./Loader"
import ErrorView from "./ErrorView"

const PostDetail = ({ postId, onBack }) => {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const ctrlRef = useRef()

  const fetchPost = useCallback(async () => {
    ctrlRef.current?.abort()
    ctrlRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const [postRes, commRes] = await Promise.all([
        fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
          signal: ctrlRef.current.signal,
        }),
        fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`, {
          signal: ctrlRef.current.signal,
        }),
      ])
      if (!postRes.ok || !commRes.ok) {
        throw new Error(`HTTP ${!postRes.ok ? postRes.status : commRes.status}`)
      }
      setPost(await postRes.json())
      setComments(await commRes.json())
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      if (err.name !== "AbortError") setError(err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchPost()
    return () => ctrlRef.current?.abort()
  }, [fetchPost])

  if (loading) return <Loader />
  if (error) {
    return <ErrorView message="Ошибка загрузки поста" onRetry={fetchPost} />
  }

  return (
    <section className="post-detail">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>
      <h2>{post.title}</h2>
      <p className="post-full-text">{post.body}</p>
      <h3 style={{ marginBottom: "var(--g-1)" }}>Комментарии</h3>
      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <strong>{c.name}</strong>
          <p>{c.body}</p>
        </div>
      ))}
    </section>
  )
}

export default PostDetail
