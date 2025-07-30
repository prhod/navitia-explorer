class TitleBar extends HTMLElement {
  constructor() {
    super();
    // attaches shadow tree and returns shadow root reference
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
    const shadow = this.attachShadow({ mode: 'open' });
        
    const TitleBarContainer = document.createElement('div');
    const title = this.title;
    const configs = this.configs;
    const currentUrl = new URL(document.location);
    let params = new URLSearchParams(document.location.search);
    let selectedConfig = params.get("config") || [];
    let configsHTML = '';
    if (configs.length  == 0) {
      //no config, one is requested
      if (currentUrl.pathname != '/config.html') {
        currentUrl.pathname = '/config.html';
        window.location = currentUrl.toString();
      }
    } else {
      //at least one element, checking its validity
      if (! configs.some(obj => obj.Name === selectedConfig)) {
        currentUrl.searchParams.set('config', configs[0].Name);
        window.location = currentUrl.toString();
      }
    } 
    for (const c of configs) {
      var selected = (selectedConfig == c.Name) ? "selected" : "";
      configsHTML += `<option ${selected} >` + c.Name + "</option>";
    }
    configsHTML = '<select class="select-title-config">' + configsHTML + '</select>';
          

    TitleBarContainer.innerHTML = `
        <style>
          div > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .icon {
            background-color: #fff;
            border: none;
            cursor: pointer;
            float: right;
            font-size: 1.8rem;
          }
          
          .app-name {
            background-color: #333333;
            color : white;
            font-size: 1.2rem;
            max-width: 90px;
            text-align: center;
          }

          .app-header {
            background-color: grey;
            width: 100%;
          }

          nav ul{
            padding: 0px;
            margin: 0px;
            list-style-type: none;
            font-family: calibri, serif;
          }

          nav li{
            float:left;
            width : 100px;
            height : 30px;
            text-align  :center;
            line-height : 30px;  
            border-right : 1px solid #cccccc;          
          }
          nav li a{
            display : block ;
            text-decoration : none ;
            color : white ;
            background-color : #333333 ;
          }
          nav li :hover{
            background-color : #2c4858ff;
          }               
        </style>
        <div class="app-header">
          <span class="app-name">Navitia Explorer</span>
          <nav>
            <ul>
              <li><a href="#" class="titlebar-config">Config</a></li>
              <li><a href="#" class="titlebar-ptref">PTRef</a></li>
              <li><a href="#" class="titlebar-places">Places</a></li>
              <li><a href="#" class="titlebar-journeys">Journeys</a></li>
              <li><a href="#" class="titlebar-route_schedules">Route Schedules</a></li>
              <li><a href="#" class="titlebar-stop_schedules">Stop Schedules</a></li>
              <li><a href="#" class="titlebar-places_nearby">Nearby</a></li>
            </ul>
          </nav>
          ${configsHTML}
        </div>
      `;

      shadow.appendChild(TitleBarContainer);      
  }
  // Element functionality written in here
    connectedCallback() {
      let selectConfigElement = this.shadowRoot.querySelector('.select-title-config');
      this.itemList = this.shadowRoot.querySelector('.item-list');
      selectConfigElement.addEventListener('change', this.selectConfigElement, false);

      const currentUrl = new URL(document.location);
      currentUrl.pathname = "/config.html"
      const config = currentUrl.searchParams.get('config');
      currentUrl.search = '';
      currentUrl.searchParams.set('config', config);
      this.shadowRoot.querySelector(`.titlebar-config`).setAttribute("href", currentUrl.toString());

      currentUrl.pathname = "/places.html"
      this.shadowRoot.querySelector(`.titlebar-places`).setAttribute("href", currentUrl.toString());

      currentUrl.pathname = "/journey.html"
      this.shadowRoot.querySelector(`.titlebar-journeys`).setAttribute("href", currentUrl.toString());

      currentUrl.pathname = "/route_schedules.html"
      this.shadowRoot.querySelector(`.titlebar-route_schedules`).setAttribute("href", currentUrl.toString());

      currentUrl.pathname = "/stop_schedules.html"
      this.shadowRoot.querySelector(`.titlebar-stop_schedules`).setAttribute("href", currentUrl.toString());

      currentUrl.pathname = "/places_nearby.html"
      this.shadowRoot.querySelector(`.titlebar-places_nearby`).setAttribute("href", currentUrl.toString());

      currentUrl.pathname = "/ptref.html"
      currentUrl.searchParams.set('uri', '/networks/');
      this.shadowRoot.querySelector(`.titlebar-ptref`).setAttribute("href", currentUrl.toString());
    }

  get title() {
    return this.getAttribute('title') || '';
  }

  get configs() {
    return JSON.parse(localStorage.getItem('config')) || [];
  }

  selectConfigElement(event) {
    console.log(this);
    let selectedConf = this.selectedOptions[0].label;  
    const currentUrl = new URL(document.location);
    currentUrl.searchParams.set('config', selectedConf);
    window.location.href = currentUrl.toString();

  }


}

customElements.define("title-bar", TitleBar);
