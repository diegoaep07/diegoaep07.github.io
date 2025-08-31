// Footer setting
let footer = document.getElementById('footer-text')
footer.innerHTML = 'Diego Enríquez<br/> Copyright© ' + new Date().getFullYear()

// Function to open a link(url) when a button(id) is clicked
let open_link = (id, url) => {
  let obj = document.getElementById(id)
  obj.addEventListener('click', () => {
    window.open(url)
  })
}

// Using previous function to open my personal links
open_link('personalchannel', 'https://t.me/diegoaep')
open_link('bluesky', 'https://bsky.app/profile/diegoaep07.bsky.social')
open_link('mygithub', 'https://github.com/astrodev07')
// open_link('ytchannel', 'https://youtube.com/@diegoaep07')
open_link('emailink', 'mailto:diegoaep07@proton.me')
open_link('instagram', 'https://www.instagram.com/diego.alejandroep')

// Dark and Light mode management
let changeMode = document.getElementById('change-mode')
changeMode.addEventListener(
  'click',
  () => {
    if (document.body.className == 'dark-mode') {
      document.body.className = 'white-mode'
      changeMode.innerHTML = '🌕'
    } 
    else {
      document.body.className = 'dark-mode'
      changeMode.innerHTML = '☀️'
    }
  }
)

// Displaying a Motivatioal Quote
let motivQuotDiv = document.getElementById('motivationalQuote')
let quote = randomQuote(jsonQuotes)
motivQuotDiv.innerHTML = `<hr/><h3>A nice Quote:</h3>"<b>${quote.quote}</b>"<br/>${quote.author}<br/><br/><hr/>`