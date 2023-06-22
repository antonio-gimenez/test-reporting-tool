import { useEffect } from 'react'

// uses the documentElement property of the document to refer to the html element instead of the body element. It sets the overflow and paddingRight properties of the html element instead of the body element.

// When the useScrollLock hook is called, it calculates the width of the scrollbar as before and checks if the height of the html element is less than its scrollHeight.If so, it stores the value of the paddingRight property of the html element in the paddingRight property of the entry, sets the overflow property of the html element to 'hidden', and sets the paddingRight property of the html element to the width of the scrollbar.

// When the useScrollLock hook is unmounted, it finds the entry for the document in the overflows array, decrements the count property of the entry, and restores the overflow and paddingRight properties of the html element to their original values if the count property is zero.

interface DocumentEntry {
  doc: Document
  count: number
  paddingRight?: string
}

const overflows: DocumentEntry[] = []

function useScrollLock(doc: Document | null, shouldBeLocked: boolean) {
  const entry = doc ? overflows.find(e => e.doc === doc) : undefined
  const locked = entry ? entry.count > 0 : false

  useEffect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    let entry = overflows.find(e => e.doc === doc)
    if (!entry) {
      entry = { doc, count: 0 }
      overflows.push(entry)
    }

    entry.count++

    const { documentElement: html } = doc
    const scrollbarWidth = window.innerWidth - html.clientWidth

    if (html.clientHeight < html.scrollHeight) {
      entry.paddingRight = html.style.paddingRight
      Object.assign(html.style, {
        overflow: 'hidden',
        paddingRight: `${scrollbarWidth}px`
      })
    } else {
      Object.assign(html.style, {
        overflow: 'hidden'
      })
    }

    return () => {
      let entry = overflows.find(e => e.doc === doc)
      if (!entry) {
        return
      }

      entry.count--

      if (entry.count === 0) {
        Object.assign(html.style, {
          overflow: '',
          paddingRight: entry.paddingRight || ''
        })
      }
    }
  }, [shouldBeLocked, doc])

  return locked
}

export default useScrollLock
