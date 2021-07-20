fetch('/settings').then(response => {
  return response.json();
}).then(result => {
  document.getElementById("userid").value = result.user_ids;
  document.getElementById("serie").value = result.serie_folder;
  document.getElementById("movie").value = result.movie_folder;
  let el = document.getElementById("form");
  el.addEventListener("submit", () => {
  console.log("save clicked")  
  let settings = {
      user_ids:document.getElementById("userid").value,
      serie_folder:document.getElementById("serie").value,
      movie_folder:document.getElementById("movie").value,
    };
   fetch('/settings', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(settings)
    }).then((res)=>{
     if(res.status === 200){
       alert("Saved!🥳");
     } else {
       throw new Error(`Response falied with status code ${res.status}`);
     }
   }).catch(err=>{
     alert(`Something went wrong😑:\n ${err}`);
   }); 
});
});





