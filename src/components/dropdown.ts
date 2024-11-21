type Option = { value: string; text: string; selected: boolean }
type Selected = Record<string, string>

const html = String.raw
const template = document.createElement('template')
template.innerHTML = html`
  <style>
    .wrapper {
      position: relative;
    }
    ul[role='listbox'] {
      --listbox-height: 370px;
      border: 1px solid #ccc;
      overflow-y: auto;
      max-height: var(--listbox-height);
    }
  </style>
  <div class="wrapper">
    <input type="text" />

    <label for="demo-simple-select">111111</label>

    <div
      tabindex="0"
      role="combobox"
      aria-controls=":R9alal9h9l6kud6:"
      aria-expanded="false"
      aria-haspopup="listbox"
      aria-labelledby="demo-simple-select-label demo-simple-select"
      id="demo-simple-select"
    >
      dededeed
    </div>

    <ul
      role="listbox"
      tabindex="-1"
      aria-labelledby="demo-multiple-name-label"
      aria-multiselectable="true"
      id=":Rilalbh9l6kud6:"
    ></ul>
  </div>
`

class NgSelect extends HTMLElement {
  input?: HTMLInputElement
  listbox?: HTMLUListElement
  combobox?: HTMLDivElement
  selected: Selected = {}

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    shadow.append(template.content.cloneNode(true))

    const id = this.id || self.crypto.randomUUID()
    const labelId = `${id}-label`

    this.input = shadow.querySelector('input')!
    this.listbox = shadow.querySelector('[role=listbox]')!
    this.combobox = shadow.querySelector('[role=combobox]')!

    this.input.setAttribute(
      'placeholder',
      this.getAttribute('placeholder') || ''
    )
    this.input.setAttribute('aria-labelledby', labelId)
    this.input.setAttribute('id', id)

    this.input.before(this.createLabel(labelId))

    this.setOptions(this.getOptions())

    this.setSelected(
      this.getOptions()
        .filter((o) => o.selected)
        .reduce((acc, o) => ({ ...acc, [o.value || '']: o.text }), {})
    )
  }

  private getOptions(): Option[] {
    return Array.from(this.querySelectorAll('option')).map((o) => ({
      value: o.getAttribute('value') || '',
      text: o.innerHTML,
      selected: o.hasAttribute('selected'),
    }))
  }

  private setOptions(options: Option[]) {
    this.listbox!.innerHTML = ''
    options.forEach((o) => {
      const li = document.createElement('li')
      li.setAttribute('role', 'option')
      li.setAttribute('tabindex', '-1')
      li.setAttribute('aria-selected', o.selected ? 'true' : 'false')
      li.setAttribute('data-value', o.value)
      li.innerHTML = o.text
      this.listbox!.append(li)
    })
  }

  private createLabel(id: string): HTMLLabelElement {
    const label = document.createElement('label')
    label.id = id
    label.setAttribute('for', this.input?.id || '')
    label.innerHTML = this.getAttribute('label') || ''
    return label
  }

  private setSelected(selected: Selected) {
    this.selected = { ...this.selected, ...selected }
    this.input!.value = Object.values(this.selected).join(', ')
  }

  private getSelected(): Selected[] {
    return []
  }

  connectedCallback() {
    // this.render()
  }

  //   static get observedAttributes() {
  //     return ['name', 'id', 'multiple', 'selected']
  //   }

  //   attributeChangedCallback(name, oldValue, newValue) {
  //     console.log(`Attribute ${name} has changed.`, { oldValue, newValue })
  //   }

  //   render() {
  //     // const name = this.getAttribute('name') || ''
  //     // const id = this.getAttribute('id') || ''
  //     // const multiple = this.hasAttribute('multiple') ? 'multiple' : ''
  //     // this.shadowRoot.innerHTML = `
  //     //         <style>
  //     //             select {
  //     //                 width: 100%;
  //     //                 padding: 8px;
  //     //                 font-size: 16px;
  //     //             }
  //     //         </style>
  //     //         <select name="${name}" id="${id}" ${multiple}>
  //     //             ${this.innerHTML}
  //     //         </select>
  //     //     `
  //   }
}

customElements.define('ng-select', NgSelect)
