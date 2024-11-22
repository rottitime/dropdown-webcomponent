type Option = { value: string; text: string; selected: boolean }
type Selected = Record<string, string>
// type Options = Record<string, { name: string; selected: boolean }>

const html = String.raw
const template = document.createElement('template')
template.innerHTML = html`
  <style>
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      padding: 5px;

      &:empty {
        display: none;
      }

      & li {
        background-color: #f1f1f1;
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

      /* chevron */
      &:after {
        content: '';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        border: solid #000;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 3px;
        transform: rotate(45deg);
      }

      &[aria-expanded='true']:after {
        transform: rotate(-135deg);
      }
    }

    ul {
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
        &:hover {
          background-color: #f1f1f1;
        }
        &[aria-selected='true'] {
          background-color: #666;
        }
      }
    }
  </style>
  <div class="wrapper">
    <ul class="tags"></ul>
    <div
      tabindex="0"
      role="combobox"
      aria-controls=":R9alal9h9l6kud6:"
      aria-expanded="false"
      aria-haspopup="listbox"
      aria-labelledby="demo-simple-select-label demo-simple-select"
      id="demo-simple-select"
    >
      <input type="text" />
    </div>

    <ul
      role="listbox"
      tabindex="-1"
      aria-hidden="true"
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
  tags?: HTMLDivElement
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
      o.selected && li.setAttribute('aria-selected', 'true')
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

  private setSelected(selected: Selected, remove?: boolean) {
    //check to remove selected if already exists in this.selected otherwise insert
    const key = Object.keys(selected)[0]

    if (remove) {
      delete this.selected[key]
    } else {
      this.selected = { ...this.selected, ...selected }
    }

    this.input!.value = Object.values(this.selected).join(', ')
    console.log(
      this.listbox!.querySelector(`[name=${key}]`),
      key,
      (!remove).toString()
    )
    this.listbox!.querySelector(`[data-value=${key}]`)?.setAttribute(
      'aria-selected',
      (!remove).toString()
    )

    this.renderTags()
  }

  private renderTags() {
    this.tags!.innerHTML = ''
    Object.entries(this.selected).forEach(([value, text]) => {
      const tag = document.createElement('li')
      tag.innerHTML = text
      tag.addEventListener('click', () => {
        this.setSelected({ [value]: text }, true)
        this.renderTags()
      })
      this.tags!.append(tag)
    })
  }

  // private getSelected(): Selected[] {
  //   return []
  // }

  connectedCallback() {
    this.render()
  }

  //   static get observedAttributes() {
  //     return ['name', 'id', 'multiple', 'selected']
  //   }

  //   attributeChangedCallback(name, oldValue, newValue) {
  //     console.log(`Attribute ${name} has changed.`, { oldValue, newValue })
  //   }

  render() {
    const id = this.id || self.crypto.randomUUID()
    const labelId = `${id}-label`
    const listboxId = `${id}-listbox`

    const { input, listbox, combobox } = this

    if (!input || !listbox || !combobox) return

    input.setAttribute('aria-autocomplete', 'list')
    input.setAttribute('aria-controls', listboxId)
    input.setAttribute('placeholder', this.getAttribute('placeholder') || '')
    input.setAttribute('aria-labelledby', labelId)
    input.setAttribute('id', id)
    combobox.before(this.createLabel(labelId))

    this.setAttribute(
      'aria-multiselectable',
      String(
        this.hasAttribute('multiple') &&
          this.getAttribute('multiple') !== String(false)
      )
    )
    listbox.setAttribute('id', listboxId)

    this.setOptions(this.getOptions())
    this.setSelected(
      this.getOptions()
        .filter((o) => o.selected)
        .reduce((acc, o) => ({ ...acc, [o.value || '']: o.text }), {})
    )

    // events
    this.addEventListener('focus', () => {
      combobox.setAttribute('aria-expanded', 'true')
      listbox.setAttribute('aria-hidden', 'false')
    })

    this.addEventListener('blur', () => {
      combobox.setAttribute('aria-expanded', 'false')
      listbox.setAttribute('aria-hidden', 'true')
    })

    listbox.addEventListener('click', (e) => {
      const target = e.target as HTMLElement

      if (target.tagName === 'LI') {
        const selected = {
          [target.getAttribute('data-value') || '']: target.innerHTML,
        }

        const isSelected = target.getAttribute('aria-selected') == 'true'
        this.setSelected(selected, isSelected)

        // this.dispatchEvent(
        //   new CustomEvent('change', {
        //     detail: { value, text },
        //   })
        // )
      }
    })
  }
}

customElements.define('ng-select', NgSelect)
