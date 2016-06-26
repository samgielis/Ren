// GRAPH API USAGE
var examplelink = 'https://graph.facebook.com/215470341909937?fields=hours,posts&access_token=598705273637123|dbc712e90e18085b86aeab6cba2069f6';
var images = '215470341909937_346703552119948?fields=message,full_picture';
var secret = 'dbc712e90e18085b86aeab6cba2069f6';
var secretsecret = atob(secret);
secret = btoa(secretsecret);
var renFB;
FB.api(
    examplelink,
    function (response) {
		if (response && !response.error){
			console.log(response);
		}
    }
);