// Function to open a link(url) when a button(id) is clicked
let open_link = (id, url) => {
  let obj = document.getElementById(id)
  obj.addEventListener('click', () => {
    window.open(url)
  })
}

// Using previous function to open my personal links
open_link('personalBlog', '/blog/')
open_link('personalchannel', 'https://t.me/diegoaep07')
open_link('bluesky', 'https://bsky.app/profile/diegoaep07.github.io')
open_link('mygithub', 'https://github.com/diegoaep07')
// open_link('ytchannel', 'https://youtube.com/@diegoaep07')
open_link('emailink', 'mailto:diegoaep07@proton.me')
open_link('instagram', 'https://www.instagram.com/diego.alejandroep')
