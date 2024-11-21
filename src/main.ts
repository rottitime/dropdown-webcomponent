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


			</ng-select>
  </div>
`
