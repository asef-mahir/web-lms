import PropTypes from 'prop-types'
import { currency, formatNumber } from '../../utils/formatters.js'

const icons = {
  courses: '📚',
  students: '👥',
  earnings: '💰',
  progress: '📊',
  completed: '✅',
  active: '🔥',
  learners: '🎓',
  instructors: '👨‍🏫',
  revenue: '💵',
  balance: '🏦',
  enrollments: '📝',
}

const getIcon = (label) => {
  const lowerLabel = label.toLowerCase()
  if (lowerLabel.includes('course')) return icons.courses
  if (lowerLabel.includes('student') || lowerLabel.includes('learner')) return icons.students
  if (lowerLabel.includes('earning') || lowerLabel.includes('revenue')) return icons.earnings
  if (lowerLabel.includes('progress')) return icons.progress
  if (lowerLabel.includes('completed')) return icons.completed
  if (lowerLabel.includes('active')) return icons.active
  if (lowerLabel.includes('instructor')) return icons.instructors
  if (lowerLabel.includes('balance')) return icons.balance
  if (lowerLabel.includes('enrollment')) return icons.enrollments
  return '📊'
}

export const StatsGrid = ({ stats }) => (
  <div className="grid gap-5 md:grid-cols-3">
    {stats.map((stat, index) => (
      <div
        key={stat.label}
        className={`card-elevated rounded-3xl ${index % 3 === 0 ? 'bg-teal-gradient' : index % 3 === 1 ? 'bg-purple-gradient' : 'bg-blue-gradient'} p-6 animate-slide-up delay-${index}00`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="icon-container text-3xl">
            {getIcon(stat.label)}
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">{stat.label}</p>
        <p className="text-3xl font-bold gradient-text">
          {stat.format === 'currency'
            ? currency(stat.value)
            : formatNumber(stat.value)}
        </p>
        {stat.subtext && <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>}
      </div>
    ))}
  </div>
)

StatsGrid.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      subtext: PropTypes.string,
      format: PropTypes.oneOf(['currency', 'number']),
    }),
  ).isRequired,
}
