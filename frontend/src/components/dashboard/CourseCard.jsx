import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Progress } from '../ui/progress.jsx'
import { Badge } from '../ui/badge.jsx'
import { currency } from '../../utils/formatters.js'

const gradients = [
  'from-teal-400 to-emerald-400',
  'from-purple-400 to-indigo-400',
  'from-orange-400 to-red-400',
  'from-blue-400 to-cyan-400',
  'from-pink-400 to-rose-400',
  'from-amber-400 to-yellow-400',
]

export const CourseCard = ({ course, onPrimary, primaryLabel, meta, secondaryAction }) => {
  const gradientIndex = Math.abs(course.title?.charCodeAt(0) || 0) % gradients.length

  return (
    <div className="card-elevated rounded-3xl card-bg-white p-6 hover:scale-105 transition-smooth flex flex-col h-full">
      {/* Course thumbnail */}
      <div className={`h-32 rounded-2xl bg-gradient-to-br ${gradients[gradientIndex]} mb-4 flex items-center justify-center relative overflow-hidden shrink-0`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-white text-4xl font-bold opacity-20">
          {course.title?.charAt(0) || '📚'}
        </div>
        {course.status && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-white/90 text-slate-900 border-0 text-xs">
              {course.status}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 mb-2 flex-grow">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-slate-900 line-clamp-1">{course.title}</h4>
          <p className="text-sm text-slate-500 line-clamp-2 mt-1">
            {course.description || 'Details coming soon.'}
          </p>
        </div>
      </div>

      {typeof course.progress_percentage === 'number' && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase tracking-wider">Progress</span>
            <span className="font-semibold text-teal-600">{course.progress_percentage}%</span>
          </div>
          <Progress value={course.progress_percentage} className="h-2" />
        </div>
      )}

      {meta && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {meta.students !== undefined && (
            <div className="rounded-xl bg-teal-50 p-3">
              <p className="text-xs text-teal-600 uppercase tracking-wider">Students</p>
              <p className="font-bold text-teal-700 text-lg">{meta.students}</p>
            </div>
          )}
          {meta.earnings !== undefined && (
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600 uppercase tracking-wider">Earnings</p>
              <p className="font-bold text-emerald-700 text-lg">{currency(meta.earnings)}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 space-y-2 mt-auto">
        <Button
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0"
          onClick={() => onPrimary(course)}
        >
          {primaryLabel}
        </Button>
        {secondaryAction}
      </div>
    </div>
  )
}

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  onPrimary: PropTypes.func.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    students: PropTypes.number,
    earnings: PropTypes.number,
  }),
  secondaryAction: PropTypes.node,
}

CourseCard.defaultProps = {
  meta: null,
}
