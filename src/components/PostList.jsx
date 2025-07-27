import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useRef,
} from "react"

import InfiniteScroll from "react-infinite-scroll-component"
import ErrorView from "./ErrorView"
import Loader from "./Loader"
import PostDetail from "./PostDetail.jsx"

const PAGE_LIMIT = 10

function buildUrl({ page, query, field }) {
  const params = new URLSearchParams({
    _limit: PAGE_LIMIT,
    _page: page,
  })
  if (query.trim()) {
    params.append(`${field}_like`, query.trim())
  }
  return `https://jsonplaceholder.typicode.com/posts?${params.toString()}`
}

const initialState = {
  items: [],
  page: 1,
  hasMore: true,
  status: "idle",
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialState
    case "start":
      return { ...state, status: "loading" }
    case "success":
      return {
        ...state,
        status: "idle",
        items: [...state.items, ...action.payload.items],
        page: state.page + 1,
        hasMore: action.payload.hasMore,
      }
    case "error":
      return { ...state, status: "error" }
    default:
      return state
  }
}

const PostList = () => {
  const [search, setSearch] = useState("")
  const [field, setField] = useState("title")
  const [selectedPostId, setSelectedPostId] = useState(null)

  const [{ items, page, hasMore, status }, dispatch] = useReducer(
    reducer,
    initialState
  )
  const abortRef = useRef()

  const fetchPage = useCallback(async () => {
    if (!hasMore || status === "loading") return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    dispatch({ type: "start" })

    try {
      const res = await fetch(buildUrl({ page, query: search, field }), {
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const total = Number(res.headers.get("X-Total-Count"))

      dispatch({
        type: "success",
        payload: {
          items: data,
          hasMore: items.length + data.length < total,
        },
      })
    } catch (err) {
      if (err.name === "AbortError") return
      dispatch({ type: "error" })
    }
  }, [page, search, field, hasMore, status, items])

  useEffect(() => {
    abortRef.current?.abort()
    dispatch({ type: "reset" })
  }, [search, field])

  useEffect(() => {
    if (page === 1) fetchPage()
  }, [page, fetchPage])

  useEffect(() => () => abortRef.current?.abort(), [])

  if (status === "error") {
    return (
      <ErrorView
        message="Не удалось загрузить посты"
        onRetry={() => fetchPage()}
      ></ErrorView>
    )
  }

  if (selectedPostId !== null) {
    return (
      <PostDetail
        postId={selectedPostId}
        onBack={() => setSelectedPostId(null)}
      ></PostDetail>
    )
  }

  return (
    <>
      <div className="search-section">
        <input
          className="search-input"
          placeholder={
            field === "title" ? "Поиск по заголовку" : "Поиск по содержанию"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="sort-select"
          value={field}
          onChange={(e) => setField(e.target.value)}
        >
          <option value="title">По заголовку</option>
          <option value="body">По содержанию</option>
        </select>
      </div>

      <InfiniteScroll
        dataLength={items.length}
        next={fetchPage}
        hasMore={hasMore}
        loader={<Loader />}
        scrollThreshold={0.9}
      >
        <section className="post-list">
          {items.length ? (
            items.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelect={() => setSelectedPostId(post.id)}
              />
            ))
          ) : (
            <p style={{ textAlign: "center" }}>
              {status !== "loading" && "Постов не найдено"}
            </p>
          )}
        </section>
      </InfiniteScroll>
    </>
  )
}

export default PostList

const PostItem = ({ post, onSelect }) => (
  <article className="post-card" onClick={onSelect}>
    <h2 className="post-title">{post.title}</h2>
    <p className="post-preview">
      {post.body.slice(0, 50)}
      {post.body.length > 50 && "..."}
    </p>
  </article>
)
