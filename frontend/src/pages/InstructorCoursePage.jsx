import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { useToast } from '../hooks/useToast.js'
import { localQuizService } from '../services/localQuizService.js'
import { QuizBuilder } from '../components/quiz/QuizBuilder.jsx'

export const InstructorCoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Modal States
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form States
  const [videoForm, setVideoForm] = useState({ title: '', duration: '', file: null })
  const [resourceForm, setResourceForm] = useState({ title: '', file: null })

  // Data States
  const [quizzes, setQuizzes] = useState([])
  const [pendingStudents, setPendingStudents] = useState([])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const data = await instructorService.courseDetails(courseId)
      setCourse(data)
      setQuizzes(localQuizService.getQuizzes(courseId))
      const pending = await instructorService.getPendingStudents(courseId)
      setPendingStudents(pending || [])
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Unable to fetch course',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
  }, [courseId, showToast])

  const handleAddVideo = async (e) => {
    e.preventDefault()
    if (!videoForm.file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('files', videoForm.file)
      // Send arrays as backend expects
      formData.append('videoTitles', JSON.stringify([videoForm.title]))
      formData.append('videoDurations', JSON.stringify([videoForm.duration || '60']))

      await instructorService.addVideos(courseId, formData)
      showToast({ type: 'success', title: 'Success', message: 'Video added successfully' })
      setShowVideoModal(false)
      setVideoForm({ title: '', duration: '', file: null })
      loadCourse()
    } catch (err) {
      showToast({ type: 'error', title: 'Upload failed', message: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!resourceForm.file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('files', resourceForm.file)

      const resourceData = [{
        title: resourceForm.title,
        mediaType: 'pdf', // defaulting to pdf/file for now
        isFree: false
      }]

      formData.append('resources', JSON.stringify(resourceData))

      await instructorService.addResources(courseId, formData)
      showToast({ type: 'success', title: 'Success', message: 'Resource added successfully' })
      setShowResourceModal(false)
      setResourceForm({ title: '', file: null })
      loadCourse()
    } catch (err) {
      showToast({ type: 'error', title: 'Upload failed', message: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleSaveQuiz = (quizData) => {
    try {
      localQuizService.saveQuiz(courseId, quizData)
      showToast({ type: 'success', title: 'Quiz saved', message: 'The quiz has been added to the course.' })
      setShowQuizModal(false)
      setQuizzes(localQuizService.getQuizzes(courseId))
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Could not save quiz' })
    }
  }

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Delete this quiz?')) {
      localQuizService.deleteQuiz(courseId, quizId)
      setQuizzes(localQuizService.getQuizzes(courseId))
      showToast({ type: 'success', title: 'Deleted', message: 'Quiz removed.' })
    }
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course details...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please go back to your dashboard.
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard/instructor')}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Course management</p>
          <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">{course.description}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={!course.videos?.length}
            onClick={() =>
              course.videos?.length &&
              navigate(
                `/dashboard/instructor/course/${courseId}/video/${course.videos?.[0]?.videoId || course.videos?.[0]?._id
                }`,
              )
            }
          >
            Preview first lesson
          </Button>
          <Button onClick={() => navigate('/dashboard/instructor')}>Back to dashboard</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-8">

          {/* Pending Approvals Section */}
          {pendingStudents.length > 0 && (
            <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-rose-900 mb-4">Pending Approvals ({pendingStudents.length})</h2>
              <div className="space-y-3">
                {pendingStudents.map(txn => (
                  <div key={txn._id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">{txn.from_user?.fullName || 'Unknown Student'}</p>
                      <p className="text-xs text-slate-500">Paid: ${txn.amount}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white border-0"
                      onClick={async () => {
                        try {
                          await instructorService.approveEnrollment(txn._id)
                          showToast({ title: 'Approved', message: 'Student has been given access.' })
                          loadCourse()
                        } catch (e) {
                          showToast({ type: 'error', message: e.message })
                        }
                      }}
                    >
                      Approve Access
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Published lessons</h2>
                <p className="text-sm text-slate-500">{course.totalVideos || 0} videos</p>
              </div>
              <Button size="sm" onClick={() => setShowVideoModal(true)}>+ Add Video</Button>
            </div>

            <div className="space-y-4">
              {(course.videos || []).map((video) => (
                <div
                  key={video.videoId || video._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{video.title}</p>
                    <p className="text-xs text-slate-500">
                      Duration: {Math.round((video.duration || video.duration_seconds || 0) / 60)} mins
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      navigate(
                        `/dashboard/instructor/course/${courseId}/video/${video.videoId || video._id}`,
                      )
                    }
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Key metrics</h3>
          <dl className="mt-4 space-y-3 text-sm text-slate-500">
            <div className="flex items-center justify-between">
              <dt>Students enrolled</dt>
              <dd className="font-semibold text-slate-900">{course.totalEnrolled || course.studentsEnrolled || 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Total earnings</dt>
              <dd className="font-semibold text-slate-900">${course.instructorEarnings || 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Resources</dt>
              <dd className="font-semibold text-slate-900">{course.totalResources || 0}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
            <Button size="sm" variant="outline" onClick={() => setShowResourceModal(true)}>+ Add</Button>
          </div>
          {course.resources?.length ? (
            <div className="mt-4">
              <ResourceList resources={course.resources} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No resources uploaded.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quizzes</h3>
            <Button size="sm" variant="outline" onClick={() => setShowQuizModal(true)}>+ Add (Local)</Button>
          </div>
          {quizzes.length ? (
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{quiz.title}</p>
                    <p className="text-xs text-slate-500">{quiz.questions.length} questions</p>
                  </div>
                  <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-slate-400 hover:text-red-500">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No quizzes created.</p>
          )}
        </div>

        <div className="mt-8 text-center bg-gray-50 p-4 rounded-xl">
          <button
            className="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
            onClick={async () => {
              if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
                try {
                  await instructorService.deleteCourse(courseId)
                  showToast({ type: 'success', title: 'Course deleted', message: 'The course has been removed.' })
                  navigate('/dashboard/instructor')
                } catch (err) {
                  showToast({ type: 'error', title: 'Deletion failed', message: err.message })
                }
              }
            }}
          >
            Delete this course permanently
          </button>
        </div>
      </div>
    </div>

    {/* Add Video Modal */}
    <Modal
      open={showVideoModal}
      onClose={() => setShowVideoModal(false)}
      title="Add New Video"
      footer={
        <>
          <Button variant="ghost" onClick={() => setShowVideoModal(false)}>Cancel</Button>
          <Button disabled={uploading || !videoForm.duration} onClick={handleAddVideo}>
            {uploading ? 'Processing...' : 'Add Video'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Video Title</Label>
          <Input
            value={videoForm.title}
            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
            placeholder="e.g., Introduction to React"
          />
        </div>

        <div className="space-y-2">
          <Label>Video File</Label>
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                // Calculate duration
                setUploading(true); // temporary lock while calculating
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = function () {
                  window.URL.revokeObjectURL(video.src);
                  setVideoForm(prev => ({ ...prev, file: file, duration: Math.round(video.duration) }));
                  setUploading(false);
                }
                video.src = URL.createObjectURL(file);
              } else {
                setVideoForm(prev => ({ ...prev, file: null, duration: 0 }));
              }
            }}
          />
          {videoForm.duration > 0 && (
            <p className="text-xs text-slate-500">
              Detected duration: {Math.floor(videoForm.duration / 60)}m {videoForm.duration % 60}s
            </p>
          )}
        </div>
      </div>
    </Modal>

    {/* Add Resource Modal */}
    <Modal
      open={showResourceModal}
      onClose={() => setShowResourceModal(false)}
      title="Add New Resource"
      footer={
        <>
          <Button variant="ghost" onClick={() => setShowResourceModal(false)}>Cancel</Button>
          <Button disabled={uploading} onClick={handleAddResource}>
            {uploading ? 'Uploading...' : 'Add Resource'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Resource Title</Label>
          <Input
            value={resourceForm.title}
            onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
            placeholder="e.g., Course Slides"
          />
        </div>
        <div className="space-y-2">
          <Label>Resource File (PDF)</Label>
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files[0] })}
          />
        </div>
      </div>
    </Modal>

    {/* Quiz Modal */}
    <Modal
      open={showQuizModal}
      onClose={() => setShowQuizModal(false)}
      title="Create Quiz"
      footer={null} // Footer is handled inside QuizBuilder
    >
      <QuizBuilder
        onSave={handleSaveQuiz}
        onCancel={() => setShowQuizModal(false)}
      />
    </Modal>
    </>
  )
}
