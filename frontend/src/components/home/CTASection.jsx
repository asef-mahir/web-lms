import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'

export const CTASection = ({ onGetStarted }) => (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="relative rounded-2xl bg-indigo-600 p-12 md:p-20 overflow-hidden text-center shadow-2xl shadow-indigo-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="relative z-10 space-y-8 animate-fade-in">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    Ready to start your journey?
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-indigo-100 font-light leading-relaxed">
                    Join thousands of learners already advancing their careers with our platform.
                    Access world-class content today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        className="bg-white text-indigo-600 hover:bg-indigo-50 border-0"
                        onClick={onGetStarted}
                    >
                        Get Started Now
                    </Button>
                    <Button
                        size="lg"
                        className="bg-indigo-700 text-white hover:bg-indigo-800 border-0 inset-ring ring-1 ring-indigo-500"
                        onClick={onGetStarted}
                    >
                        View Pricing
                    </Button>
                </div>
            </div>
        </div>
    </section>
)

CTASection.propTypes = {
    onGetStarted: PropTypes.func.isRequired,
}
