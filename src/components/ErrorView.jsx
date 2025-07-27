import React from "react"

const ErrorView = ({ message, onRetry }) => {
  return (
    <div className="error-card">
      <h3>Ошибка</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="back-btn" onClick={onRetry}>
          Повторить запрос
        </button>
      )}
    </div>
  )
}

export default ErrorView
