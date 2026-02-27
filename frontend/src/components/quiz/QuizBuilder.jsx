import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'

export const QuizBuilder = ({ initialData, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '')
    const [questions, setQuestions] = useState(initialData?.questions || [])

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now(),
                text: '',
                options: ['', '', '', ''],
                correctIndex: 0
            }
        ])
    }

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ))
    }

    const updateOption = (qId, optionIndex, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options]
                newOptions[optionIndex] = value
                return { ...q, options: newOptions }
            }
            return q
        }))
    }

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const handleSubmit = () => {
        if (!title.trim()) return alert('Please enter a quiz title')
        if (questions.length === 0) return alert('Please add at least one question')
        if (questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
            return alert('Please fill in all question fields')
        }

        onSave({
            id: initialData?.id,
            title,
            questions
        })
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-2xl text-slate-900">
            <div className="space-y-2">
                <Label>Quiz Title</Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Final Assessment"
                />
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {questions.map((q, qIndex) => (
                    <div key={q.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50 relative group">
                        <button
                            onClick={() => removeQuestion(q.id)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>

                        <div className="mb-3">
                            <Label className="text-xs uppercase text-slate-400 mb-1 block">Question {qIndex + 1}</Label>
                            <Input
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                placeholder="Enter question text..."
                                className="bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${q.correctIndex === oIndex ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}
                                        onClick={() => updateQuestion(q.id, 'correctIndex', oIndex)}
                                    >
                                        {q.correctIndex === oIndex && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                    </div>
                                    <Input
                                        value={opt}
                                        onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                                        placeholder={`Option ${oIndex + 1}`}
                                        className={`pl-10 ${q.correctIndex === oIndex ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right">Click the circle to mark correct answer</p>
                    </div>
                ))}

                <Button
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-slate-700 hover:border-slate-400"
                >
                    + Add Question
                </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Quiz</Button>
            </div>
        </div>
    )
}
