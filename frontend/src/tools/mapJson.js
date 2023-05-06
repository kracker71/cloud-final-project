export async function mapJson() {

    const res = await fetch('https://mmtqpi1os7.execute-api.us-east-1.amazonaws.com/default/getMook',{
        method: 'post',
    })
    return res
}

mapJson()


