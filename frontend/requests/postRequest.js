function post(url, obj) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...obj
            }) 
        })

        .then(response => response.json())
        .then(data => resolve(data))
        .catch((error) => {
            console.error('Error:', error);
            resolve(error)
        });
    })
}