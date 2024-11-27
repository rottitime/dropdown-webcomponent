import style from './style.css?raw'
type Selected = Record<string, string>
type onChangeEvent = (v: Selected) => void

const template = document.createElement('template')
template.innerHTML = /* HTML */ `
  <style>
    ${style}
  </style>
  <div class="wrapper">
    <ul class="tags"></ul>
    <div role="combobox" aria-expanded="false" aria-haspopup="listbox">
      <input type="text" aria-autocomplete="list" autocomplete="off" />
    </div>
    <ul
      role="listbox"
      tabindex="-1"
      aria-hidden="true"
      aria-multiselectable="true"
    ></ul>
  </div>
`

class NgSelect extends HTMLElement {
  input: HTMLInputElement
  listbox: HTMLUListElement
  combobox: HTMLDivElement
  tags: HTMLUListElement
  selected: Selected = {}
  onChange: onChangeEvent

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(template.content.cloneNode(true))
    this.input = shadow.querySelector('input')!
    this.combobox = shadow.querySelector('[role=combobox]')!
    this.listbox = shadow.querySelector('[role=listbox]')!
    this.tags = shadow.querySelector('.tags')!
    this.onChange = new Function(
      'v',
      `return (${this.getAttribute('onchange') || '() => {}'})(v)`
    ) as onChangeEvent
  }

  private createLabel(id: string): HTMLLabelElement {
    const label = document.createElement('label')
    label.id = id
    label.setAttribute('for', this.input.id)
    label.innerHTML = this.getAttribute('label') || ''
    return label
  }

  private setSelected(selected: Selected, remove?: boolean) {
    const key = Object.keys(selected)[0]
    if (remove) delete this.selected[key]
    else this.selected = { ...this.selected, ...selected }

    this.input.placeholder = Object.values(this.selected).join(', ')
    this.listbox
      .querySelector(`[data-value=${key}]`)
      ?.setAttribute('aria-selected', (!remove).toString())
    this.renderTags()
    this.onChange(this.selected)
  }

  private renderTags() {
    this.tags.innerHTML = ''
    Object.entries(this.selected).forEach(([value, text]) => {
      const tag = document.createElement('li')
      tag.innerText = text
      tag.addEventListener('click', () =>
        this.setSelected({ [value]: text }, true)
      )
      this.tags.append(tag)
    })
  }

  private toggleListbox(show: boolean) {
    this.combobox.setAttribute('aria-expanded', show.toString())
    this.listbox.setAttribute('aria-hidden', (!show).toString())
  }

  private highlightTextInOptions(text: string) {
    Array.from(this.listbox.querySelectorAll('li')).forEach((item) => {
      item.hidden = false
      item
        .querySelectorAll('mark')
        .forEach((EL) => EL.replaceWith(...EL.childNodes))
      const hasText = item.innerText.toLowerCase().includes(text)
      if (hasText) {
        item.innerHTML = item.innerHTML.replace(
          new RegExp(text, 'gi'),
          (x) => `<mark>${x}</mark>`
        )
      }
      item.hidden = !hasText
    })
  }

  private render() {
    const { input, listbox, combobox } = this
    const id = this.id || `d${self.crypto.randomUUID()}`
    const labelId = `${id}-label`
    const listboxId = `${id}-listbox`

    input.setAttribute('aria-controls', listboxId)
    input.setAttribute('placeholder', this.getAttribute('placeholder') || '')
    input.setAttribute('aria-labelledby', labelId)
    input.setAttribute('id', id)
    combobox.before(this.createLabel(labelId))

    this.setAttribute(
      'aria-multiselectable',
      String(this.getAttribute('multiple') !== 'false' || null)
    )
    listbox.setAttribute('id', listboxId)
    listbox.setAttribute('aria-labelledby', labelId)

    this.querySelectorAll('option').forEach((o) => {
      const [k, v] = [o.getAttribute('value') || '', o.innerText]
      const li = document.createElement('li')
      li.setAttribute('role', 'option')
      li.setAttribute('tabindex', '-1')
      li.setAttribute('data-value', k)
      li.innerHTML = v
      listbox.append(li)
      if (o.hasAttribute('selected')) this.setSelected({ [k]: v })
    })

    input.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value.toLowerCase()
      this.toggleListbox(true)
      this.highlightTextInOptions(value)
    })

    input.addEventListener('click', () =>
      this.toggleListbox(combobox.getAttribute('aria-expanded') !== 'true')
    )
    this.addEventListener('blur', () => this.toggleListbox(false))

    listbox.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'LI') {
        const selected = {
          [target.getAttribute('data-value') || '']: target.innerText,
        }
        this.setSelected(
          selected,
          target.getAttribute('aria-selected') === 'true'
        )
      }
    })

    input.addEventListener('keydown', this.handleKeydown.bind(this))
    listbox.addEventListener('keydown', this.handleKeydown.bind(this))
  }

  private handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLLIElement
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (target.tagName === 'INPUT') {
          this.toggleListbox(true)
          this.focusItem('current')
        } else {
          const selected = {
            [target.getAttribute('data-value') || '']: target.innerText,
          }
          this.setSelected(
            selected,
            target.getAttribute('aria-selected') == 'true'
          )
        }
        break
      case 'Escape':
        this.toggleListbox(false)
        this.input.focus()
        break
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault()
        this.toggleListbox(true)
        this.focusItem(e.key === 'ArrowDown' ? 'next' : 'previous')
        break
      default:
        if (target.tagName === 'LI') this.input.focus()
    }
  }

  private focusItem(direction: 'next' | 'previous' | 'current') {
    const focused = this.listbox.querySelector('[tabindex="0"]')
    const items: HTMLLIElement[] = Array.from(
      this.listbox.querySelectorAll('li:not([hidden])')
    )
    let index = items.indexOf(focused as HTMLLIElement)

    if (direction === 'next' && index < items.length - 1) index++
    else if (direction === 'previous' && index > 0) index--
    else if (direction === 'current' && index < 0) index = 0

    if (items[index]) {
      items[index].focus()
      items[index].setAttribute('tabindex', '0')
      focused?.setAttribute('tabindex', '-1')
    }
  }

  connectedCallback() {
    this.render()
  }
}

customElements.define('ng-select', NgSelect)
