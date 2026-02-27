import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const DashboardSection = ({ title, description, action, children, className }) => (
  <section className={cn('space-y-5 rounded-3xl border border-slate-100 card-bg-teal backdrop-blur-sm p-8 shadow-sm', className)}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>
      {action}
    </div>
    <div>{children}</div>
  </section>
)

DashboardSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

DashboardSection.defaultProps = {
  description: null,
  action: null,
  className: '',
}
