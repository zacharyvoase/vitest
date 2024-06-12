const moduleCache = new Map()

function wrapModule(module) {
  if (typeof module === 'function') {
    const promise = new Promise((resolve, reject) => {
      if (typeof __vitest_mocker__ === 'undefined')
        return module().then(resolve, reject)
      __vitest_mocker__.prepare().finally(() => {
        module().then(resolve, reject)
      })
    })
    moduleCache.set(promise, { promise, evaluated: false })
    return promise.finally(() => moduleCache.delete(promise))
  }
  return module
}

window.__vitest_browser_runner__ = {
  wrapModule,
  moduleCache,
  config: { __VITEST_CONFIG__ },
  viteConfig: { __VITEST_VITE_CONFIG__ },
  files: { __VITEST_FILES__ },
  type: { __VITEST_TYPE__ },
  contextId: { __VITEST_CONTEXT_ID__ },
}

const config = __vitest_browser_runner__.config

if (config.testNamePattern)
  config.testNamePattern = parseRegexp(config.testNamePattern)

function parseRegexp(input) {
  // Parse input
  const m = input.match(/(\/?)(.+)\1([a-z]*)/i)

  // match nothing
  if (!m)
    return /$^/

  // Invalid flags
  if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3]))
    return RegExp(input)

  // Create the regular expression
  return new RegExp(m[2], m[3])
}
