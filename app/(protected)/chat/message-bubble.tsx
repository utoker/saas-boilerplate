'use client'

import type { UIMessage } from 'ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const code = String(children).replace(/\n$/, '')
    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: '0.5rem 0',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      )
    }
    return (
      <code
        className="rounded bg-zinc-700 px-1.5 py-0.5 text-[0.8125rem] text-zinc-200"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre({ children }) {
    return <>{children}</>
  },
  p({ children }) {
    return <p className="mb-2 last:mb-0">{children}</p>
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300"
      >
        {children}
      </a>
    )
  },
  ul({ children }) {
    return <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  },
  ol({ children }) {
    return <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>
  },
  blockquote({ children }) {
    return (
      <blockquote className="mb-2 border-l-2 border-zinc-500 pl-3 italic text-zinc-400 last:mb-0">
        {children}
      </blockquote>
    )
  },
  table({ children }) {
    return (
      <div className="mb-2 overflow-x-auto last:mb-0">
        <table className="min-w-full text-sm">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return (
      <th className="border-b border-zinc-600 px-3 py-1.5 text-left font-semibold">
        {children}
      </th>
    )
  },
  td({ children }) {
    return (
      <td className="border-b border-zinc-700 px-3 py-1.5">{children}</td>
    )
  },
}

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'whitespace-pre-wrap bg-blue-600 text-white'
            : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            if (isUser) {
              return <span key={i}>{part.text}</span>
            }
            return (
              <ReactMarkdown
                key={i}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {part.text}
              </ReactMarkdown>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
