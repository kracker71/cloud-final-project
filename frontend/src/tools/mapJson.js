export async function mapJson() {
    // var res = ""
    // fetch('https://mmtqpi1os7.execute-api.us-east-1.amazonaws.com/default/getMook',{
    //     method: 'post',
    // }).then(response => response.json())
    // .then(data => {
    //     console.log(data)
    //     res = data[text]
    //     console.log(res)
    // })
    // .catch(error => {
    //     console.log(error)
    //     return error
    // });

    const res = await fetch('https://mmtqpi1os7.execute-api.us-east-1.amazonaws.com/default/getMook',{
        method: 'post',
    })
    console.log(res)
    return res
}

mapJson()


