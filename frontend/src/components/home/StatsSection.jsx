import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge.jsx'

const stats = [
    { label: 'Active Courses', value: 150, suffix: '+' },
    { label: 'Happy Learners', value: 5000, suffix: '+' },
    { label: 'Completion Rate', value: 94, suffix: '%' },
    { label: 'Expert Instructors', value: 50, suffix: '+' },
]

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime
        let animationFrame

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            setCount(Math.floor(progress * end))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
        }
    }, [end, duration])

    return (
        <span>
            {count.toLocaleString()}{suffix}
        </span>
    )
}

export const StatsSection = () => (
    <section className="bg-slate-900 text-white py-24">
        <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div className="space-y-6">
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Growth & Impact</Badge>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Trusted by thousands of learners worldwide
                    </h2>
                    <p className="text-slate-400 text-lg max-w-lg">
                        Our platform has helped students and professionals alike achieve their goals through structured learning paths and expert guidance.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm"
                        >
                            <div className="text-4xl font-bold text-white mb-2">
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
)
