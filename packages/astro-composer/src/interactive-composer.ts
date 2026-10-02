import { composerClipboardImages, createComposer, pasteComposerField } from '@refraction-ui/composer'
import type { ComposerAPI, ComposerState, ComposerSubmission } from '@refraction-ui/composer'

export interface RefractionComposerImagePasteDetail {
  images: File[]
  /** Host stages/uploads via this same core; bytes never enter serialized drafts. */
  api: ComposerAPI
}

export interface RefractionInteractiveComposerElement extends HTMLElement {
  readonly api: ComposerAPI | undefined
}

/** Install once; custom-element lifecycle also supports Astro view transitions. */
export function registerRefractionInteractiveComposer(): void {
  if (customElements.get('refraction-interactive-composer')) return
  customElements.define('refraction-interactive-composer', class extends HTMLElement {
    api?: ComposerAPI
    private controller?: AbortController
    private unsubscribe?: () => void
    private pasting = false

    connectedCallback(): void {
      if (this.api) return
      const field = this.querySelector('textarea')!
      const send = this.querySelector<HTMLButtonElement>('[data-send]')!
      const tray = this.querySelector<HTMLElement>('[data-tray]')!
      const notice = this.querySelector<HTMLElement>('[data-notice]')!
      const emit = (name: string, detail: unknown) => this.dispatchEvent(new CustomEvent(`refraction:${name}`, { bubbles: true, detail }))
      const number = (name: string) => this.hasAttribute(name) ? Number(this.getAttribute(name)) : undefined
      const api = createComposer({
        initialValue: field.value,
        maxLength: number('max-length'),
        maxAttachments: number('max-attachments'),
        maxAttachmentSizeBytes: number('max-image-bytes'),
        onEvent: event => {
          if (event.type === 'paste-trimmed') notice.textContent = this.dataset.trimmedNotice ?? ''
          emit('composer-event', event)
        },
      })
      this.api = api
      const controller = new AbortController()
      this.controller = controller
      const options = { signal: controller.signal }
      const render = (state: ComposerState) => {
        if (!this.pasting && field.value !== state.value) field.value = state.value
        field.disabled = state.disabled
        field.readOnly = state.readOnly
        send.disabled = !state.canSend
        send.setAttribute('aria-busy', String(state.isBusy))
        tray.replaceChildren()
        for (const attachment of state.attachments) {
          const chip = document.createElement('span')
          chip.className = 'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm'
          const label = document.createElement('span')
          label.textContent = `${attachment.name} · ${attachment.status}`
          chip.append(label)
          const remove = document.createElement('button')
          remove.type = 'button'
          remove.textContent = '×'
          remove.setAttribute('aria-label', `${this.dataset.removeLabel} ${attachment.name}`)
          remove.disabled = state.disabled || state.readOnly || state.isBusy
          remove.dataset.attachmentId = attachment.id
          chip.append(remove)
          tray.append(chip)
        }
      }
      tray.addEventListener('click', event => {
        const button = (event.target as Element).closest<HTMLButtonElement>('[data-attachment-id]')
        if (!button || button.disabled) return
        const attachment = api.getState().attachments.find(item => item.id === button.dataset.attachmentId)
        if (!attachment) return
        api.removeAttachment(attachment.id)
        emit('attachment-remove', attachment)
      }, options)
      const selection = () => api.setSelection({ start: field.selectionStart, end: field.selectionEnd })
      this.unsubscribe = api.subscribe(render)
      field.addEventListener('input', () => {
        if (!this.pasting) api.setValue(field.value, { start: field.selectionStart, end: field.selectionEnd })
      }, options)
      field.addEventListener('select', () => { if (!this.pasting) selection() }, options)
      field.addEventListener('compositionstart', () => api.setComposing(true), options)
      field.addEventListener('compositionend', () => api.setComposing(false), options)
      field.addEventListener('paste', event => {
        event.preventDefault()
        const state = api.getState()
        if (state.disabled || state.readOnly || state.isComposing) return
        notice.textContent = ''
        let images: File[]
        let text: string
        try {
          images = composerClipboardImages(Array.from(event.clipboardData?.files ?? []), number('max-image-bytes'))
          text = event.clipboardData?.getData('text/plain') ?? ''
        } catch (error) {
          notice.textContent = this.dataset.pasteFailedNotice ?? ''
          emit('paste-error', { error })
          return
        }
        this.pasting = true
        try {
          pasteComposerField(api, field, text, inserted => typeof document.execCommand === 'function' && document.execCommand('insertText', false, inserted))
        } finally {
          this.pasting = false
        }
        if (images.length > 0) emit('images-pasted', { images, api } satisfies RefractionComposerImagePasteDetail)
      }, options)
      const submit = () => {
        const submission = api.submit()
        if (submission) emit('submit', submission satisfies ComposerSubmission)
      }
      send.addEventListener('click', submit, options)
      field.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && this.hasAttribute('submit-on-enter')) {
          event.preventDefault()
          submit()
        }
      }, options)
      this.syncFlags()
      render(api.getState())
      emit('composer-ready', { api })
    }

    static get observedAttributes(): string[] { return ['disabled', 'read-only', 'busy'] }
    attributeChangedCallback(): void { this.syncFlags() }
    private syncFlags(): void {
      this.api?.setDisabled(this.hasAttribute('disabled'))
      this.api?.setReadOnly(this.hasAttribute('read-only'))
      this.api?.setBusy(this.hasAttribute('busy'))
    }
    disconnectedCallback(): void {
      this.controller?.abort()
      this.unsubscribe?.()
      this.api?.destroy()
      this.api = undefined
    }
  })
}
