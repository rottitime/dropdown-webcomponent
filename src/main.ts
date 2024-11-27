import './style.css'
import './components/dropdown'

const html = String.raw

function getFormDetails(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  formData.forEach((value, key) => {
    console.log({ key, value })
  })
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <div>
    <h1>ng-select</h1>

    <script>
      function getFormDetails(e) {
        e.preventDefault()
        const formData = new FormData(e.target)
        formData.forEach((value, key) => {
          console.log({ key, value })
        })
      }
    </script>

    <form>
      <ng-select
        name="cars1nomultiple"
        placeholder="single only"
        label="Single option only"
        onchange="(v)=>console.log(v)"
      >
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="opel">Opel</option>
        <option value="audi">Audi</option>
        <option value="bmw">BMW</option>
        <option value="mercedes">Mercedes</option>
        <option value="fiat">Fiat</option>
        <option value="ford">Ford</option>
        <option value="toyota">Toyota</option>
        <option value="nissan">Nissan</option>
        <option value="honda">Honda</option>
        <option value="mazda">Mazda</option>
        <option value="mitsubishi">Mitsubishi</option>
        <option value="subaru">Subaru</option>
        <option value="hyundai">Hyundai</option>
        <option value="kia">Kia</option>
        <option value="chevrolet">Chevrolet</option>
        <option value="chrysler">Chrysler</option>
        <option value="dodge">Dodge</option>
        <option value="jeep">Jeep</option>
        <option value="ram">Ram</option>
        <option value="buick">Buick</option>
        <option value="cadillac">Cadillac</option>
      </ng-select>

      <ng-select
        name="cars2withmultiplke"
        placeholder="someting working"
        multiple
        label="This is my label"
        onchange="(v)=>console.log(v)"
      >
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="opel">Opel</option>
        <option value="audi">Audi</option>
        <option value="bmw">BMW</option>
        <option value="mercedes">Mercedes</option>
        <option value="fiat">Fiat</option>
        <option value="ford">Ford</option>
        <option value="toyota">Toyota</option>
        <option value="nissan">Nissan</option>
        <option value="honda">Honda</option>
        <option value="mazda">Mazda</option>
        <option value="mitsubishi">Mitsubishi</option>
        <option value="subaru">Subaru</option>
        <option value="hyundai">Hyundai</option>
        <option value="kia">Kia</option>
        <option value="chevrolet">Chevrolet</option>
        <option value="chrysler">Chrysler</option>
        <option value="dodge">Dodge</option>
        <option value="jeep">Jeep</option>
        <option value="ram">Ram</option>
        <option value="buick">Buick</option>
        <option value="cadillac">Cadillac</option>
      </ng-select>

      <button>submit</button>
    </form>

    <p>
      Lorem ipsum odor amet, consectetuer adipiscing elit. Habitant feugiat
      conubia sodales hac turpis dignissim dui. Sapien cubilia senectus
      hendrerit; hac suspendisse dui.
    </p>
  </div>
`

document
  .querySelector<HTMLDivElement>('#app form')!
  .addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    formData.forEach((value, key) => {
      console.log({ key, value })
    })
  })
