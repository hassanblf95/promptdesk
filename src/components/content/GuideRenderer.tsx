import { AlertCircle, Lightbulb, Info } from 'lucide-react'
import type { GuideSection } from '@/types'

interface GuideRendererProps {
  sections: GuideSection[]
}

export function GuideRenderer({ sections }: GuideRendererProps) {
  if (!sections || sections.length === 0) return null

  return (
    <div className="guide-content space-y-6">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'intro':
            return (
              <div key={index}>
                {section.heading && (
                  <h2 className="text-2xl font-bold text-[#0F1F3D] mb-3">{section.heading}</h2>
                )}
                {section.body && (
                  <p className="text-gray-700 leading-relaxed text-lg">{section.body}</p>
                )}
              </div>
            )

          case 'section':
            return (
              <div key={index}>
                {section.heading && (
                  <h2 className="text-xl font-bold text-[#0F1F3D] mb-3">{section.heading}</h2>
                )}
                {section.body && (
                  <p className="text-gray-700 leading-relaxed mb-3">{section.body}</p>
                )}
                {section.items && section.items.length > 0 && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1A56A0] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )

          case 'steps':
            return (
              <div key={index}>
                {section.heading && (
                  <h2 className="text-xl font-bold text-[#0F1F3D] mb-3">{section.heading}</h2>
                )}
                {section.items && section.items.length > 0 && (
                  <ol className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1A56A0] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )

          case 'callout': {
            const variantConfig = {
              tip: {
                icon: <Lightbulb className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />,
                className: 'bg-green-50 border-green-200',
                headingClass: 'text-green-800',
                textClass: 'text-green-700',
              },
              warning: {
                icon: <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />,
                className: 'bg-amber-50 border-amber-200',
                headingClass: 'text-amber-800',
                textClass: 'text-amber-700',
              },
              note: {
                icon: <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />,
                className: 'bg-blue-50 border-blue-200',
                headingClass: 'text-blue-800',
                textClass: 'text-blue-700',
              },
            }
            const config = variantConfig[section.variant || 'note']
            return (
              <div key={index} className={`flex gap-3 rounded-lg border p-4 ${config.className}`}>
                {config.icon}
                <div>
                  {section.heading && (
                    <p className={`font-semibold mb-1 ${config.headingClass}`}>{section.heading}</p>
                  )}
                  {section.content && (
                    <p className={`text-sm leading-relaxed ${config.textClass}`}>{section.content}</p>
                  )}
                </div>
              </div>
            )
          }

          case 'example':
            return (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                {section.heading && (
                  <h3 className="font-semibold text-[#0F1F3D] mb-2">{section.heading}</h3>
                )}
                {section.content && (
                  <div className="rounded-md bg-gray-950 p-3">
                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                      {section.content}
                    </pre>
                  </div>
                )}
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
