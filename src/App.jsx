import React, { useState, useEffect } from "react"
import PostList from "./components/PostList"
import UserList from "./components/UserList"

const App = () => {
  const [view, setView] = useState("posts")
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle("no-scroll", drawerOpen)
  }, [drawerOpen])

  return (
    <>
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setDrawerOpen((prev) => !prev)}
        >
          ☰
        </button>
        <span className="mobile-title">🍆Ruddit</span>
      </header>

      <div
        className={drawerOpen ? "overlay show" : "overlay"}
        onClick={() => setDrawerOpen(false)}
      ></div>

      <div className="layout">
        <aside className={drawerOpen ? "sidebar open" : "sidebar"}>
          <div className="logo">🍆 Ruddit</div>
          <nav className="nav">
            <button
              className={`nav-item ${view === "posts" ? "active" : ""}`}
              onClick={() => {
                setView("posts")
                setDrawerOpen(false)
              }}
            >
              📄 Посты
            </button>
            <button
              className={`nav-item ${view === "users" && "active"}`}
              onClick={() => {
                setView("users")
                setDrawerOpen(false)
              }}
            >
              👤 Пользователи
            </button>
          </nav>
          {view === "users" && <div id="user-filters-slot" />}
        </aside>
        <main className="main">
          {view === "posts" ? <PostList /> : <UserList />}
        </main>
      </div>
    </>
  )
}

export default App
