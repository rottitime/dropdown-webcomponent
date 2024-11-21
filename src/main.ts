import './style.css'
import './components/dropdown'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    		<ng-select name="cars" id="cars" placeholder="someting working" multiple label="This is my label">
          <option value="volvo">Volvo</option>
          <option value="saab" selected>Saab</option>
          <option value="opel">Opel</option>
          <option value="audi" selected>Audi</option>
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
  </div>
`
