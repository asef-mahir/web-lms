import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Badge } from '../ui/badge.jsx'
import { Progress } from '../ui/progress.jsx'
import { currency } from '../../utils/formatters.js'

const gradients = [
  'from-indigo-400 to-violet-400',
  'from-blue-400 to-indigo-400',
  'from-violet-400 to-fuchsia-400',
]

export const MostViewedGrid = ({ courses, onSelectCourse, onViewAll }) => (
  <section id="courses" className="mx-auto max-w-6xl px-6 py-16">
    <div className="mb-12 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold bg-indigo-50 w-fit px-3 py-1 rounded-full">Trending</p>
        <h2 className="text-3xl md:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Most Viewed Courses</h2>
      </div>
      <Button variant="outline" className="font-medium" onClick={onViewAll}>
        View all courses
      </Button>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <div
          key={course._id}
          className="card-clean p-0 overflow-hidden flex flex-col h-full animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Card Header/Thumbnail */}
          <div className={`h-48 bg-gradient-to-br ${gradients[index % gradients.length]} p-6 relative`}>
            <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white backdrop-blur-md border-transparent">
                {course.title ? course.title.split(' ')[0] : 'Course'}
              </Badge>
              <div className="mt-4 text-white font-bold text-3xl opacity-80">
                {course.title?.substring(0, 2).toUpperCase() || 'CS'}
              </div>
            </div>
            {index === 0 && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-400 text-yellow-900 border-yellow-500/20">★ Top Pick</Badge>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">
                  {course.title || 'Untitled Course'}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {course.instructor?.fullName || 'Expert Instructor'}
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">
              {course.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-medium border-t border-slate-100 pt-4">
                <span className="text-indigo-600 font-bold text-lg">{currency(course.price)}</span>
                <span className="text-slate-500 flex items-center gap-1">
                  👥 {course.enrolledCount || 0}
                </span>
              </div>

              <Button className="w-full" onClick={() => onSelectCourse(course)}>
                View Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

MostViewedGrid.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelectCourse: PropTypes.func.isRequired,
  onViewAll: PropTypes.func,
}

MostViewedGrid.defaultProps = {
  onViewAll: () => { },
}
