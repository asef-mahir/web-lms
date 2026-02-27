import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Badge } from '../ui/badge.jsx'

export const HeroSection = ({ onExplore }) => (
  <section className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">

      {/* Left Column: Text Content */}
      <div className="flex flex-col items-start space-y-8 animate-fade-in">
        <Badge variant="default" className="w-fit">
          🚀 The #1 Learning Platform
        </Badge>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-4">
          Elevate Your <br />
          <span className="text-indigo-600">Professional Skills</span>
        </h1>

        <p className="max-w-xl text-lg text-slate-600 leading-relaxed">
          Unlock your potential with our expert-led courses. From coding to design,
          we provide the tools you need to succeed in today&apos;s digital world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <Button size="lg" onClick={onExplore} className="w-full sm:w-auto">
            Start Learning
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            View Syllabus
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-100 w-full">
          <p className="text-sm font-medium text-slate-500 mb-4">Trusted by students from</p>
          <div className="flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple logo placeholders using text for now */}
            <span className="font-bold text-slate-400 text-xl">Harvard</span>
            <span className="font-bold text-slate-400 text-xl">MIT</span>
            <span className="font-bold text-slate-400 text-xl">Stanford</span>
            <span className="font-bold text-slate-400 text-xl">Google</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visual/Image Area */}
      <div className="relative hidden lg:block animate-fade-in delay-200">
        {/* Placeholder for an actual hero image or 3D element */}
        <div className="relative rounded-2xl bg-indigo-50 border border-indigo-100 p-8 h-[600px] w-full flex items-center justify-center overflow-hidden">

          {/* Abstract geometric composition */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center space-y-4">
            <div className="w-24 h-24 bg-indigo-600 rounded-2xl mx-auto shadow-xl shadow-indigo-200 flex items-center justify-center text-white text-4xl mb-6 transform -rotate-6">
              📚
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 max-w-xs mx-auto transform rotate-2 transition-transform hover:rotate-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JD</div>
                <div>
                  <div className="font-bold text-slate-900">John Doe</div>
                  <div className="text-xs text-slate-500">Web Developer</div>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-indigo-500 rounded-full"></div>
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium">
                <span>Progress</span>
                <span className="text-indigo-600">75%</span>
              </div>
            </div>
          </div>

          {/* Floating UI Elements indicating activity */}
          <div className="absolute top-20 right-10 bg-white p-4 rounded-lg shadow-md border border-slate-100 animate-pulse-slow">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm font-semibold text-slate-700">New Course Added</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
)

HeroSection.propTypes = {
  onExplore: PropTypes.func.isRequired,
}
