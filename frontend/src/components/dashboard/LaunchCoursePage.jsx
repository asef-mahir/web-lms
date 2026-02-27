import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { instructorService } from '../../services/api.js'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Textarea } from '../ui/textarea.jsx'
import { useToast } from '../../hooks/useToast.js'
import { localQuizService } from '../../services/localQuizService.js'
import { QuizBuilder } from '../quiz/QuizBuilder.jsx'
import { Modal } from '../ui/modal.jsx'

export const LaunchCoursePage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: ""
  })

  const [numVideos, setNumVideos] = useState(0)
  const [videos, setVideos] = useState([])

  // Function to get video duration
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(Math.round(video.duration))
      }
      video.src = URL.createObjectURL(file)
    })
  }

  // 🔥 New Resource Fields
  const [resources, setResources] = useState([])

  // Quiz State
  const [quizzes, setQuizzes] = useState([])
  const [showQuizModal, setShowQuizModal] = useState(false)

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // ... inside LaunchCoursePage
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Check if user is authenticated
    const token = localStorage.getItem('frontend_token')
    if (!token) {
      setError('You need to be logged in to create a course. Please log in and try again.')
      navigate('/login')
      return
    }

    // Check if all videos have titles and files
    const allFilled = videos.every((v) => v.title && v.file)
    if (!allFilled) {
      setError("Please complete all video fields before submitting.")
      return
    }

    // Clean resources but allow file-based ones without URL
    const cleanedResources = resources
      .map((resource) => ({
        title: resource.title.trim(),
        mediaType: resource.mediaType.trim(),
        url: resource.url.trim(),
        file: resource.file, // Keep file ref for upload
        isUpload: !!resource.file
      }))
      .filter((resource) => resource.title && resource.mediaType && (resource.url || resource.file))

    const hasIncompleteResource = cleanedResources.length !== resources.filter(r => r.title || r.mediaType).length;
    if (hasIncompleteResource && resources.some(r => !r.title || !r.mediaType || (!r.url && !r.file))) {
      // Only error if user tried to fill something but left it incomplete
      setError("Please fill every resource field or remove the empty entries.")
      return
    }

    const fd = new FormData()
    fd.append("title", form.title)
    fd.append("description", form.description)
    fd.append("price", form.price)

    fd.append("videoTitles", JSON.stringify(videos.map(v => v.title)))
    fd.append("videoDurations", JSON.stringify(videos.map(v => Number(v.duration))))

    // Append Video Files
    videos.forEach((v) => fd.append("videos", v.file))

    // Append Resource Files and Data
    if (cleanedResources.length) {
      // Send metadata (exclude file object to avoid circular JSON)
      const resourcesMeta = cleanedResources.map(({ file, ...rest }) => rest);
      fd.append("resources", JSON.stringify(resourcesMeta))

      // Append actual files
      cleanedResources.forEach((r) => {
        if (r.file) {
          fd.append("resourceFiles", r.file)
        }
      })
    }

    try {
      console.log('Auth token:', token)
      const response = await instructorService.createCourse(fd)
      console.log('Course creation response:', response)

      // Save quizzes to localStorage with the new courseId
      if (quizzes.length > 0 && response._id) {
        quizzes.forEach(quiz => {
          localQuizService.saveQuiz(response._id, quiz)
        })
      }

      setSuccess("Course launched successfully!")
      showToast({
        type: 'success',
        title: 'Course created',
        message: 'Your course is live for learners.',
      })
      setTimeout(() => navigate('/dashboard/instructor'), 1500)
    } catch (err) {
      console.error('Error creating course:', err.response || err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create course. Please try again.'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Unable to launch course',
        message: errorMessage,
      })

      if (err.response?.status === 401) {
        localStorage.removeItem('frontend_token')
        navigate('/login')
      }
    }
  }

  const handleVideoUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const duration = await getVideoDuration(file)
      const updatedVideos = [...videos]
      updatedVideos[index] = {
        ...updatedVideos[index],
        file,
        duration: duration || 0
      }
      setVideos(updatedVideos)
    } catch (err) {
      console.error('Error getting video duration:', err)
      const updatedVideos = [...videos]
      updatedVideos[index] = {
        ...updatedVideos[index],
        file,
        duration: 0
      }
      setVideos(updatedVideos)
    }
  }

  const addResource = () => {
    setResources([...resources, { title: "", mediaType: "document_link", url: "", file: null, inputType: "link" }])
  }

  const handleResourceFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const c = [...resources];
    c[index].file = file;
    // Auto-set media type based on extension if possible
    if (file.type.includes('pdf')) c[index].mediaType = 'pdf';
    else if (file.type.includes('audio')) c[index].mediaType = 'audio';

    setResources(c);
  }

  const handleSaveQuiz = (quizData) => {
    try {
      // Add quiz to local state (will be saved to localStorage after course creation)
      const newQuiz = {
        ...quizData,
        id: quizData.id || `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      }
      setQuizzes([...quizzes, newQuiz])
      showToast({ type: 'success', title: 'Quiz added', message: 'Quiz will be saved with the course.' })
      setShowQuizModal(false)
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Could not add quiz' })
    }
  }

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Delete this quiz?')) {
      setQuizzes(quizzes.filter(q => q.id !== quizId))
      showToast({ type: 'success', title: 'Deleted', message: 'Quiz removed.' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Launch New Course</h1>
      <p className="text-slate-500 mb-6">Upload videos and publish your course.</p>

      {error && <div className="p-4 bg-rose-100 text-rose-700 rounded-lg mb-4">{error}</div>}
      {success && <div className="p-4 bg-emerald-100 text-emerald-700 rounded-lg mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">

        <Input placeholder="Course Title" required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <Textarea placeholder="Course Description" rows={3} required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Input type="number" placeholder="Price" required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />


        {/* Number of videos */}
        <div>
          <label className="font-medium">Number of Videos</label>
          <Input
            type="number"
            min="1"
            value={numVideos}
            onChange={(e) => {
              const count = Number(e.target.value)
              setNumVideos(count)
              setVideos(Array.from(
                { length: count },
                () => ({ title: "", duration: 0, file: null })
              ))
            }}
            className="mt-1"
          />
        </div>

        {/* Video Upload Boxes */}
        {videos.map((v, i) => (
          <div key={i} className="p-4 border rounded-xl bg-teal-50/40">
            <h3 className="font-semibold mb-2">Video {i + 1}</h3>

            <Input placeholder="Video Title"
              value={v.title}
              onChange={(e) => {
                const c = [...videos]
                c[i].title = e.target.value
                setVideos(c)
              }}
            />

            <div className="mt-2">
              <input
                type="file"
                accept="video/*"
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-teal-50 file:text-teal-700
                  hover:file:bg-teal-100"
                onChange={(e) => handleVideoUpload(e, i)}
              />
              {v.duration !== undefined && (
                <p className="text-xs text-slate-500 mt-1">
                  Duration: {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* 🔥 Resource Section */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Additional Resources (Optional)</h2>

          {resources.map((r, i) => (
            <div key={i} className="p-4 border rounded-xl bg-green-50/40 mb-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">Resource {i + 1}</h4>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg border ${r.inputType === 'link' ? 'bg-white border-green-500 text-green-700' : 'border-slate-300'}`}
                    onClick={() => {
                      const c = [...resources];
                      c[i].inputType = 'link';
                      setResources(c);
                    }}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg border ${r.inputType === 'file' ? 'bg-white border-green-500 text-green-700' : 'border-slate-300'}`}
                    onClick={() => {
                      const c = [...resources];
                      c[i].inputType = 'file';
                      c[i].mediaType = 'pdf'; // default
                      setResources(c);
                    }}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              <Input placeholder="Resource Title"
                value={r.title}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].title = e.target.value
                  setResources(c)
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="rounded-lg border border-slate-300 p-2 text-sm"
                  value={r.mediaType}
                  onChange={(e) => {
                    const c = [...resources];
                    c[i].mediaType = e.target.value;
                    setResources(c);
                  }}
                >
                  {r.inputType === 'file' ? (
                    <>
                      <option value="pdf">PDF Document</option>
                      <option value="audio">Audio (MP3)</option>
                    </>
                  ) : (
                    <>
                      <option value="document_link">Document Link</option>
                      <option value="image">Image URL</option>
                      <option value="text">External Page</option>
                    </>
                  )}
                </select>

                {r.inputType === 'file' ? (
                  <input
                    type="file"
                    accept={r.mediaType === 'audio' ? 'audio/*' : '.pdf'}
                    className="block w-full text-sm text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-green-100 file:text-green-700"
                    onChange={(e) => handleResourceFileChange(e, i)}
                  />
                ) : (
                  <Input placeholder="https://..."
                    value={r.url}
                    onChange={(e) => {
                      const c = [...resources]
                      c[i].url = e.target.value
                      setResources(c)
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          <Button type="button" onClick={addResource}>
            + Add Resource
          </Button>
        </div>

        {/* 🔥 Quiz Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Quizzes (Optional)</h2>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowQuizModal(true)}>
              + Add Quiz
            </Button>
          </div>

          {quizzes.length ? (
            <div className="space-y-2">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between rounded-xl bg-purple-50/40 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{quiz.title}</p>
                    <p className="text-xs text-slate-500">{quiz.questions?.length || 0} questions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No quizzes added yet.</p>
          )}
        </div>

        <Button type="submit" className="w-full">Launch Course</Button>
      </form>

      {/* Quiz Modal */}
      <Modal
        open={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        title="Create Quiz"
      >
        <QuizBuilder onSave={handleSaveQuiz} onCancel={() => setShowQuizModal(false)} />
      </Modal>
    </div>
  )
}
