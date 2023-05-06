export function mapJson(text) {
    var res = ""
    fetch('https://cloud-abfinal-proj.s3.amazonaws.com/mook.json',{
        method: 'GET',
        headers: {
            'Accept': 'application/json',

        },

    }).then(response => response.json())
    .then(data => {
        res = data[text]
        console.log(res)
    })
    .catch(error => {
        console.log(error)
        return error
    });
}


