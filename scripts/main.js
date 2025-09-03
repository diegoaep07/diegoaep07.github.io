// Footer setting
let footer = document.getElementById('footer-text')
footer.innerHTML = 'Diego Enríquez<br/> Copyright© ' + new Date().getFullYear()

// Dark and Light mode management
let changeMode = document.getElementById('change-mode')
changeMode.addEventListener(
  'click',
  () => {
    if (document.body.className == 'dark-mode') {
      document.body.className = 'white-mode'
      changeMode.innerHTML = '🌙'
    } 
    else {
      document.body.className = 'dark-mode'
      changeMode.innerHTML = '☀️'
    }
  }
)

// Auto Dark or Ligth mode
let autoDarkOrLightMode = () => {
  let dayTime = new Date().getHours()
  if(dayTime < 20){
    document.body.className = 'white-mode'
    changeMode.innerHTML = '🌙'
  }
  else{
    document.body.className = 'dark-mode'
    changeMode.innerHTML = '☀️'
  }
}

autoDarkOrLightMode()

