import style from './style.css?raw'
type Selected = Record<string, string>

const template = document.createElement('template')
template.innerHTML = /* HTML */ `
  <style>
    ${style}
  </style>

  <div class="wrapper">
    <ul class="tags"></ul>
    <div role="combobox" aria-expanded="false" aria-haspopup="listbox">
      <input type="text" aria-autocomplete="list" />
    </div>
    <ul
      role="listbox"
      tabindex="-1"
      aria-hidden="true"
      aria-labelledby="demo-multiple-name-label"
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

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(template.content.cloneNode(true))
    this.input = shadow.querySelector('input')!
    this.combobox = shadow.querySelector('[role=combobox]')!
    this.listbox = shadow.querySelector('[role=listbox]')!
    this.tags = shadow.querySelector('.tags')!
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
    this.input.value = Object.values(this.selected).join(', ')
    this.listbox
      .querySelector(`[data-value=${key}]`)
      ?.setAttribute('aria-selected', (!remove).toString())
    this.renderTags()
  }

  private renderTags() {
    this.tags.innerHTML = ''
    Object.entries(this.selected).forEach(([value, text]) => {
      const tag = document.createElement('li')
      tag.innerHTML = text
      tag.addEventListener('click', () => {
        this.setSelected({ [value]: text }, true)
        this.renderTags()
      })
      this.tags.append(tag)
    })
  }

  private showListbox() {
    this.combobox.setAttribute('aria-expanded', 'true')
    this.listbox.setAttribute('aria-hidden', 'false')
  }

  private hideListbox() {
    this.combobox.setAttribute('aria-expanded', 'false')
    this.listbox.setAttribute('aria-hidden', 'true')
  }

  private render() {
    const { input, listbox, combobox } = this
    const id = this.id || self.crypto.randomUUID()
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
      const [k, v] = [o.getAttribute('value') || '', o.innerHTML]
      const li = document.createElement('li')
      li.setAttribute('role', 'option')
      li.setAttribute('tabindex', '-1')
      li.setAttribute('data-value', k)
      li.innerHTML = v
      listbox.append(li)
      if (o.hasAttribute('selected')) this.setSelected({ [k]: v })
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.showListbox()
        this.focusItem('current')
      }
    })

    input.addEventListener('click', () =>
      combobox.getAttribute('aria-expanded') === 'true'
        ? this.hideListbox()
        : this.showListbox()
    )
    this.addEventListener('blur', () => this.hideListbox())

    listbox.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'LI') {
        const selected = {
          [target.getAttribute('data-value') || '']: target.innerHTML,
        }
        const isSelected = target.getAttribute('aria-selected') == 'true'
        this.setSelected(selected, isSelected)
      }
    })

    listbox.addEventListener('keydown', (e) => {
      const target = e.target as HTMLLIElement
      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          const selected = {
            [target.getAttribute('data-value') || '']: target.innerHTML,
          }
          const isSelected = target.getAttribute('aria-selected') == 'true'
          this.setSelected(selected, isSelected)
          break
        case 'Escape':
          this.hideListbox()
          this.input.focus()
          break
        case 'ArrowDown':
          e.preventDefault()
          this.focusItem('next')
          break
        case 'ArrowUp':
          e.preventDefault()
          this.focusItem('previous')
          break
      }
    })
  }

  private focusItem(direction: 'next' | 'previous' | 'current') {
    const focused = this.listbox.querySelector('[tabindex="0"]')
    const items = Array.from(this.listbox.querySelectorAll('li'))
    let index = items.indexOf(focused as HTMLLIElement)

    if (direction === 'next' && index < items.length - 1) index++
    else if (direction === 'previous' && index > 0) index--
    else if (direction === 'current' && index < 0) index = 0

    items[index].focus()
    items[index].setAttribute('tabindex', '0')
    focused?.setAttribute('tabindex', '-1')
  }

  connectedCallback() {
    this.render()
  }
}

customElements.define('ng-select', NgSelect)
