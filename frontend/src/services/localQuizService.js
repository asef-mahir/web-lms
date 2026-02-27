export const localQuizService = {
    getQuizzes: (courseId) => {
        try {
            const storageKey = `frontend_quizzes_${courseId}`
            const data = localStorage.getItem(storageKey)
            return data ? JSON.parse(data) : []
        } catch (err) {
            console.error('Failed to load quizzes', err)
            return []
        }
    },

    saveQuiz: (courseId, quiz) => {
        try {
            const storageKey = `frontend_quizzes_${courseId}`
            const existing = localQuizService.getQuizzes(courseId)

            const newQuiz = {
                ...quiz,
                id: quiz.id || `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString()
            }

            // Update or Add
            const index = existing.findIndex(q => q.id === newQuiz.id)
            if (index >= 0) {
                existing[index] = newQuiz
            } else {
                existing.push(newQuiz)
            }

            localStorage.setItem(storageKey, JSON.stringify(existing))
            return newQuiz
        } catch (err) {
            console.error('Failed to save quiz', err)
            throw new Error('Could not save quiz locally')
        }
    },

    deleteQuiz: (courseId, quizId) => {
        try {
            const storageKey = `frontend_quizzes_${courseId}`
            const existing = localQuizService.getQuizzes(courseId)
            const filtered = existing.filter(q => q.id !== quizId)
            localStorage.setItem(storageKey, JSON.stringify(filtered))
        } catch (err) {
            console.error('Failed to delete quiz', err)
        }
    }
}
