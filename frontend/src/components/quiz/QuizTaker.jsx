import { useState } from 'react'
import { Button } from '../ui/button.jsx'

export const QuizTaker = ({ quiz, onComplete, onClose }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({}) // { questionId: selectedIndex }
    const [showResults, setShowResults] = useState(false)

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const totalQuestions = quiz.questions.length

    const handleSelectOption = (optionIndex) => {
        // Prevent changing answer if already answered
        if (answers[currentQuestion.id] !== undefined) return

        setAnswers({
            ...answers,
            [currentQuestion.id]: optionIndex
        })
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            setShowResults(true)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const calculateScore = () => {
        let correct = 0
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctIndex) {
                correct++
            }
        })
        return Math.round((correct / totalQuestions) * 100)
    }

    if (showResults) {
        const score = calculateScore()
        return (
            <div className="text-center py-8 space-y-6 bg-white text-slate-900 rounded-xl">
                <div>
                    <div className="text-5xl mb-4">{score >= 70 ? '🎉' : '📚'}</div>
                    <h2 className="text-2xl font-bold text-slate-900">Quiz Completed!</h2>
                    <p className="text-slate-500 mt-2">You scored</p>
                    <div className={`text-5xl font-bold mt-2 ${score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {score}%
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-700 hover:bg-slate-50">Close</Button>
                    <Button onClick={() => {
                        setAnswers({})
                        setCurrentQuestionIndex(0)
                        setShowResults(false)
                    }} className="bg-indigo-600 text-white hover:bg-indigo-700">Retake Quiz</Button>
                </div>
            </div>
        )
    }

    const isAnswered = answers[currentQuestion.id] !== undefined
    const selectedAnswer = answers[currentQuestion.id]

    return (
        <div className="space-y-6 bg-white p-6 rounded-2xl text-slate-900 shadow-sm relative z-10">
            <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% completed</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
            </div>

            <div className="py-4">
                <h3 className="text-lg font-medium text-slate-900 mb-6">{currentQuestion.text}</h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((opt, index) => {
                        let optionClass = "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700"
                        let indicatorClass = "border-slate-300 text-slate-500"

                        if (isAnswered) {
                            if (index === currentQuestion.correctIndex) {
                                // Correct Answer (Green)
                                optionClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                                indicatorClass = "border-emerald-500 bg-emerald-500 text-white"
                            } else if (index === selectedAnswer) {
                                // Wrong Answer Selected (Red)
                                optionClass = "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                                indicatorClass = "border-rose-500 bg-rose-500 text-white"
                            } else {
                                // Others dimmed
                                optionClass = "border-slate-100 opacity-50 text-slate-400"
                            }
                        } else if (selectedAnswer === index) {
                            // Selected state (before confirmation if we weren't doing immediate)
                            // But since we do immediate, this block might be redundant if we don't allow re-selection
                            // However, keeping for potential future toggle
                            optionClass = "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                            indicatorClass = "border-indigo-500 bg-indigo-500 text-white"
                        }

                        return (
                            <button
                                key={index}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass}`}
                                onClick={() => handleSelectOption(index)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${indicatorClass}`}>
                                        {isAnswered && index === currentQuestion.correctIndex ? '✓' :
                                            isAnswered && index === selectedAnswer && index !== currentQuestion.correctIndex ? '✕' :
                                                String.fromCharCode(65 + index)}
                                    </div>
                                    {opt}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                    Previous
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                >
                    {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
            </div>
        </div>
    )
}
