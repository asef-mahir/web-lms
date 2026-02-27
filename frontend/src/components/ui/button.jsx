import { cva } from 'class-variance-authority'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
        outline:
          'border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50',
        soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1 text-xs',
        lg: 'px-8 py-3 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const Button = ({ className, variant, size, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
)

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'soft']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
}

Button.defaultProps = {
  className: '',
  variant: 'default',
  size: 'default',
}


