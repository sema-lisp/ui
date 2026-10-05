import { describe, expect, it } from 'vitest'
import { preloadLanguage, highlightToHtmlSync } from '../src/internal/syntax-highlight.js'

describe('highlightToHtmlSync', () => {
  it('escapes and returns plain text before warmup (no throw)', () => {
    const out = highlightToHtmlSync('<x> & "y"', 'sema')
    expect(out).not.toContain('<x>')
    expect(out).toContain('&lt;x&gt;')
  })

  it('highlights sema synchronously once the grammar is preloaded', async () => {
    await preloadLanguage('sema')
    const out = highlightToHtmlSync('(define x 1)', 'sema')
    expect(out).toContain('tok-')
    expect(out).toContain('define')
    // same shared tokenizer as the async path — the keyword is classed
    expect(out).toMatch(/<span class="tok-\w+">define<\/span>/)
  })

  it('classifies workflow approval and policy forms', async () => {
    await preloadLanguage('sema')
    const out = highlightToHtmlSync(
      '(defpolicy safe {})\n(approval :ship {})\n(policy/without "test" #t)\n(workflow/approval :ship {})\n(tool/policy-subjects publish)',
      'sema',
    )
    expect(out).toContain('<span class="tok-keyword">defpolicy</span>')
    expect(out).toContain('<span class="tok-builtin">approval</span>')
    expect(out).toContain('<span class="tok-builtin">policy/without</span>')
    expect(out).toContain('<span class="tok-builtin">workflow/approval</span>')
    expect(out).toContain('<span class="tok-builtin">tool/policy-subjects</span>')
  })

  it('classifies complete raw regex literals and regex builtins', async () => {
    await preloadLanguage('sema')
    const out = highlightToHtmlSync(
      '(regex/match? #"\\d+" text)\n(regex/match #"\\\"[^\\\"]+\\\"" text)',
      'sema',
    )
    const normalized = out.replaceAll('</span><span class="tok-string">', '')
    expect(out).toContain('<span class="tok-builtin">regex/match?</span>')
    expect(out).toContain('<span class="tok-builtin">regex/match</span>')
    expect(normalized).toContain('<span class="tok-string">#"\\d+"</span>')
    expect(normalized).toContain('<span class="tok-string">#"\\"[^\\"]+\\""</span>')
  })

  it('supports non-sema languages too (json), unlike the old sema-only tokenizer', async () => {
    await preloadLanguage('json')
    const out = highlightToHtmlSync('{"a": 1}', 'json')
    expect(out).toContain('tok-')
  })
})
