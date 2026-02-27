import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Badge = ({ children, className, variant }) => {
  const base =
    'inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
  const variants = {
    default: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
    success: 'bg-green-50 text-green-700 ring-green-600/20',
    warning: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    outline: 'bg-white text-slate-700 ring-slate-200',
    danger: 'bg-red-50 text-red-700 ring-red-600/10',
  }

  return <span className={cn(base, variants[variant], className)}>{children}</span>
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'outline']),
}

Badge.defaultProps = {
  className: '',
  variant: 'default',
}


