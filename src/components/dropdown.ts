type Selected = Record<string, string>

const html = String.raw
const template = document.createElement('template')
template.innerHTML = html`
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
    label {
      display: block;
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
    <div
      role="combobox"
      aria-expanded="false"
      aria-haspopup="listbox"
      aria-labelledby="demo-simple-select-label demo-simple-select"
      id="demo-simple-select"
    >
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
      String(
        this.hasAttribute('multiple') &&
          this.getAttribute('multiple') !== 'false'
      )
    )
    listbox.setAttribute('id', listboxId)

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
        this.listbox.focus()
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
          this.focusNextListItem()
          break
        case 'ArrowUp':
          e.preventDefault()
          this.focusPreviousListItem()
          break
      }
    })
  }

  private focusNextListItem() {
    const focused = this.listbox.querySelector('[tabindex="0"]')
    const items = Array.from(this.listbox.querySelectorAll('li'))
    let index = items.indexOf(focused as HTMLLIElement)
    if (index < items.length - 1) {
      index++
      items[index].focus()
      items[index].setAttribute('tabindex', '0')
      focused?.setAttribute('tabindex', '-1')
    }
  }

  private focusPreviousListItem() {
    const focused = this.listbox.querySelector('[tabindex="0"]')
    const items = Array.from(this.listbox.querySelectorAll('li'))
    let index = items.indexOf(focused as HTMLLIElement)
    if (index > 0) {
      index--
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
