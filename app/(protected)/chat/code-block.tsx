'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <SyntaxHighlighter
      style={oneDark}
      language={language}
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
