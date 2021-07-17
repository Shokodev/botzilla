let loading = true;
fetch('/settings').then(response => {
    return response.json();
  }).then(result => {
    document.getElementById("userid").setAttribute('placeholder', result.user_ids);
    document.getElementById("serie").setAttribute('placeholder', result.serie_folder);
    document.getElementById("movie").setAttribute('placeholder', result.movie_folder);
    loading = false;
    console.log(result)
});



