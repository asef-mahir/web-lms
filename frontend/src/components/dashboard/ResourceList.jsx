import { FileText, Music, Link as LinkIcon, FileImage, ExternalLink } from 'lucide-react'
import PropTypes from 'prop-types'
import { Badge } from '../ui/badge.jsx'

const getResourceIcon = (type) => {
  switch (type) {
    case 'pdf': return <FileText className="h-5 w-5 text-rose-500" />
    case 'audio': return <Music className="h-5 w-5 text-teal-500" />
    case 'image': return <FileImage className="h-5 w-5 text-emerald-500" />
    default: return <LinkIcon className="h-5 w-5 text-blue-500" />
  }
}

const getActionLabel = (type) => {
  if (['pdf', 'audio', 'image'].includes(type) || type?.includes('upload')) return 'Download'
  return 'Visit Link'
}

export const ResourceList = ({ resources }) => (
  <div className="space-y-3">
    {resources.map((resource) => {
      const isFile = ['pdf', 'audio', 'image'].includes(resource.mediaType);
      const finalUrl = resource.url.startsWith('/') ? `http://localhost:5000${resource.url}` : resource.url;

      return (
        <a
          key={resource.resourceId || resource.url}
          href={finalUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm transition-all hover:border-teal-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white">
              {getResourceIcon(resource.mediaType)}
            </div>
            <div>
              <p className="font-medium text-slate-900 group-hover:text-teal-600 transition-colors">{resource.title}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 capitalize">{resource.mediaType?.replace('_', ' ') || 'Resource'}</p>
                {isFile && <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500">File</span>}
              </div>
            </div>
          </div>

          {isFile ? (
            <Badge variant="secondary" className="group-hover:bg-teal-50 group-hover:text-teal-600">
              Download
            </Badge>
          ) : (
            <Badge variant="outline" className="group-hover:border-teal-200">
              <span className="flex items-center gap-1">Open <ExternalLink className="h-3 w-3" /></span>
            </Badge>
          )}
        </a>
      )
    })}
  </div>
)

ResourceList.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
}



