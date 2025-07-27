import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import ReactDOM from "react-dom"
import Loader from "./Loader"
import ErrorView from "./ErrorView"

const UserList = () => {
  /* ----- filter state ----- */
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(new Set())

  const toggleCompany = useCallback((name) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }, [])

  /* ----- data fetching ----- */
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const abortRef = useRef()

  const loadUsers = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users", {
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setUsers(await res.json())
    } catch (err) {
      if (err.name !== "AbortError") setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
    return () => abortRef.current?.abort()
  }, [loadUsers])

  const companies = useMemo(() => {
    const uniq = new Set(users.map((u) => u.company.name))
    return [...uniq].sort((a, b) => a.localeCompare(b))
  }, [users])

  const visibleCompanies = useMemo(() => {
    const q = search.trim().toLowerCase()
    return !q ? companies : companies.filter((c) => c.toLowerCase().includes(q))
  }, [companies, search])

  const filteredUsers = useMemo(() => {
    if (selected.size === 0) return users
    return users.filter((u) => selected.has(u.company.name))
  }, [users, selected])

  if (loading) return <Loader />
  if (error) {
    return (
      <ErrorView
        message="Не удалось загрузить пользователей"
        onRetry={loadUsers}
      />
    )
  }

  const sidebarNode = document.getElementById("user-filters-slot")

  return (
    <>
      {sidebarNode &&
        ReactDOM.createPortal(
          <UserFilters
            search={search}
            setSearch={setSearch}
            companies={visibleCompanies}
            selected={selected}
            toggleCompany={toggleCompany}
          />,
          sidebarNode
        )}

      <section className="user-list">
        {filteredUsers.map((user) => (
          <article className="user-card" key={user.id}>
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Компания: {user.company.name}</p>
          </article>
        ))}
      </section>
    </>
  )
}

const UserFilters = ({
  search,
  setSearch,
  companies,
  selected,
  toggleCompany,
}) => (
  <div className="filter-section">
    <input
      type="text"
      placeholder="Поиск компании..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <div className="company-scroll">
      {companies.map((name) => (
        <label key={name}>
          <input
            type="checkbox"
            checked={selected.has(name)}
            onChange={() => toggleCompany(name)}
          />{" "}
          {name}
        </label>
      ))}
      {!companies.length && <span>Не найдено</span>}
    </div>
  </div>
)

export default UserList
