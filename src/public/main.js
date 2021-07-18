let loading = true;

fetch('/settings').then(response => {
  return response.json();
}).then(result => {
  document.getElementById("userid").value = result.user_ids;
  document.getElementById("serie").value = result.serie_folder;
  document.getElementById("movie").value = result.movie_folder;
  loading = false;
});
let el = document.getElementById("form");
el.addEventListener("submit", () => {
  console.log("save clicked")  
  let settings = {
      user_ids:document.getElementById("userid").value,
      serie_folder:document.getElementById("serie").value,
      movie_folder:document.getElementById("movie").value,
    };
   fetch('/settings',{
    method: 'POST',
    body: settings 
   }).then(()=>{
     alert("Saved!🥳");
   }).catch(err=>{
     alert(`Something went wrong😑:\n ${err}`);
   }); 
});




