let footer = document.getElementById('footer-text')
footer.innerHTML = 'Diego Enríquez<br/> Copyright© ' + new Date().getFullYear()
let events = (id, url) => {
  let obj = document.getElementById(id)
  obj.addEventListener('click', () => {
    window.open(url)
  })
}
events('degcodechannel', 'https://t.me/degcode')
events('twitterlink', 'https://www.x.com/astrodev0703')
events('bluesky', 'https://bsky.app/profile/diegoaep07.bsky.social')
events('mygithub', 'https://github.com/astrodev07')
events('ytchannel', 'https://youtube.com/@astrodev07')
events('emailink', 'mailto:diegoaep07@proton.me')
events(
  'instagram',
  'https://www.instagram.com/diego.alejandroep'
)
let changeMode = document.getElementById('change-mode')
changeMode.addEventListener(
  'click',
  () => {
    if (document.body.className == 'dark-mode') {
      document.body.className = 'white-mode'
      changeMode.innerHTML = 'Dark Mode'
    } 
    else {
      document.body.className = 'dark-mode'
      changeMode.innerHTML = 'White Mode'
    }
  }
)

let last_publication_on_degcode_container = document.getElementById('degCodeLast')
/*let getTheLastPost = () => {

}*/

let motivQuotDiv = document.getElementById('motivationalQuote')
let quote = randomQuote(jsonQuotes)
motivQuotDiv.innerHTML = `<hr/><br/>"<b>${quote.quote}</b>"<br/>${quote.author}<br/><br/><hr/>`