type Selected = Record<string, string>
type onChangeEvent = (v: Selected) => void

const template = document.createElement('template')
template.innerHTML = /* HTML */ `
  <style>
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      padding: 5px;
      list-style-type: none;
      border: 1px solid #ccc;
      background-color: #fff;
      &:empty {
        display: none;
      }
      & li {
        background-color: #666;
        padding: 5px;
        border-radius: 5px;
        cursor: pointer;
      }
    }

    .wrapper {
      position: relative;
      display: inline-block;
    }

    [role='combobox'] {
      position: relative;
      &:after {
        content: '';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
        border: solid #000;
        border-width: 0 2px 2px 0;
        padding: 3px;
        pointer-events: none;
      }
      &[aria-expanded='true']:after {
        transform: translateY(-50%) rotate(-135deg);
      }
    }

    ul[role='listbox'] {
      --listbox-height: 370px;
      margin: 0;
      border: 1px solid #ccc;
      padding: 10px;
      overflow-y: auto;
      max-height: var(--listbox-height);
      position: absolute;
      left: 0;
      width: 100%;
      background-color: #fff;
      color: #000;
      &[aria-hidden='true'] {
        display: none;
      }
      & li {
        cursor: pointer;
        list-style-type: none;
      }
      & li:hover {
        background-color: #f1f1f1;
      }
      & li[aria-selected='true'] {
        background-color: #666;
      }
    }
  </style>
  <div class="wrapper">
    <ul class="tags"></ul>
    <div role="combobox" aria-expanded="false" aria-haspopup="listbox">
      <input type="text" aria-autocomplete="list" autocomplete="off" />
    </div>
    <ul role="listbox" tabindex="-1" aria-hidden="true"></ul>
  </div>
`

class NgSelect extends HTMLElement {
  static formAssociated = true
  static observedAttributes = ['value']
  private _internals: ElementInternals

  input: HTMLInputElement
  listbox: HTMLUListElement
  combobox: HTMLDivElement
  tags: HTMLUListElement
  selected: Selected = {}
  isMultiple: boolean
  onChange: onChangeEvent

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })
    shadow.append(template.content.cloneNode(true))
    this.isMultiple =
      this.getAttribute('multiple') === 'true' ||
      this.getAttribute('multiple') === ''
    this.input = shadow.querySelector('input')!
    this.combobox = shadow.querySelector('[role=combobox]')!
    this.listbox = shadow.querySelector('[role=listbox]')!
    this.tags = shadow.querySelector('.tags')!
    this.onChange = new Function(
      'v',
      `return (${this.getAttribute('onchange') || '() => {}'})(v)`
    ) as onChangeEvent

    this._internals = this.attachInternals()
  }

  private setSelected(selected: Selected, remove?: boolean) {
    const key = Object.keys(selected)[0]

    if (this.isMultiple) {
      if (remove) delete this.selected[key]
      else this.selected = { ...this.selected, ...selected }
      this.input.placeholder = Object.values(this.selected).join(', ')
      this.listbox
        .querySelector(`[data-value=${key}]`)
        ?.setAttribute('aria-selected', (!remove).toString())

      this.renderTags()
    } else {
      this.selected = selected
      this.input.value = key
      this.toggleListbox(false)
    }

    this._internals.setFormValue(selected[key])
    this.setAttribute('value', selected[key])

    this.updateValidity(selected[key])
    this.onChange(this.selected)
    // Dispatch a change event
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
  }

  private renderTags() {
    if (!this.isMultiple) return
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

    const listboxId = `${id}-listbox`

    input.setAttribute('name', this.getAttribute('name') || '')
    input.setAttribute('aria-controls', listboxId)
    input.setAttribute('placeholder', this.getAttribute('placeholder') || '')

    input.setAttribute('id', id)

    listbox.setAttribute('aria-multiselectable', String(this.isMultiple))
    listbox.setAttribute('id', listboxId)

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

  private updateValidity(value: string) {
    if (value.length >= 2) {
      this._internals.setValidity({})
      return
    }

    this._internals.setValidity(
      { tooShort: true },
      'value is too short',
      this.input
    )
    this._internals.reportValidity()
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
    this._internals.setValidity({})
  }

  // attributeChangedCallback(_name: string, _oldValue: string, newValue: string) {
  //   this._internals.setFormValue(newValue)
  //   this.setAttribute('value', newValue)
  // }
}

customElements.define('ng-select', NgSelect)
