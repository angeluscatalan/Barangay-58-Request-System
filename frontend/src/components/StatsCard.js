import { ArrowUp, ArrowDown } from "lucide-react"

function StatsCard({ title, value, icon, change = null, changeType = "neutral", changeText = "", color = "blue" }) {
  const getColorClass = () => {
    switch (color) {
      case "blue":
        return "stats-card-blue"
      case "green":
        return "stats-card-green"
      case "red":
        return "stats-card-red"
      case "orange":
        return "stats-card-orange"
      case "purple":
        return "stats-card-purple"
      default:
        return "stats-card-blue"
    }
  }

  const getChangeIcon = () => {
    if (changeType === "increase") return <ArrowUp size={14} />
    if (changeType === "decrease") return <ArrowDown size={14} />
    return null
  }

  const getChangeClass = () => {
    if (changeType === "increase") return "stats-change-increase"
    if (changeType === "decrease") return "stats-change-decrease"
    return "stats-change-neutral"
  }

  return (
    <div className={`stats-card ${getColorClass()}`}>
      <div className="stats-icon">{icon}</div>

      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-value">{value}</div>

        {change !== null && (
          <div className={`stats-change ${getChangeClass()}`}>
            {getChangeIcon()}
            <span>{change}</span>
            {changeText && <span className="stats-change-text">{changeText}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard
 