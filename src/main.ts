import './style.css'
import './components/dropdown'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    		<ng-select name="cars" id="cars" placeholder="someting working" multiple label="This is my label">
          <option value="volvo">Volvo</option>
          <option value="saab" selected>Saab</option>
          <option value="opel">Opel</option>
          <option value="audi" selected>Audi</option>
			</ng-select>
  </div>
`
