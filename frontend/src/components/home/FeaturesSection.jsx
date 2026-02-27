import PropTypes from 'prop-types'

const features = [
    {
        icon: '🎓',
        title: 'Interactive Learning',
        description: 'Engage with dynamic content, quizzes, and hands-on exercises designed for maximum retention.',
    },
    {
        icon: '📊',
        title: 'Progress Tracking',
        description: 'Monitor your learning journey with detailed analytics and completion certificates.',
    },
    {
        icon: '👨‍🏫',
        title: 'Expert Instructors',
        description: 'Learn from industry professionals with years of real-world experience.',
    },
    {
        icon: '🏆',
        title: 'Certificates',
        description: 'Earn recognized certificates upon course completion to showcase your achievements.',
    },
    {
        icon: '💬',
        title: 'Community Support',
        description: 'Connect with fellow learners and instructors in our vibrant learning community.',
    },
    {
        icon: '📱',
        title: 'Mobile Access',
        description: 'Learn anywhere, anytime with our fully responsive platform on all devices.',
    },
]

export const FeaturesSection = () => (
    <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold bg-indigo-50 w-fit mx-auto px-4 py-1 rounded-full">Why Choose Us</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                Everything you need to <span className="text-indigo-600">succeed</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Our platform provides all the tools and resources you need for an exceptional learning experience.
            </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
                <div
                    key={feature.title}
                    className="card-clean p-8 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center text-3xl mb-6 text-indigo-600">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
            ))}
        </div>
    </section>
)

FeaturesSection.propTypes = {}
