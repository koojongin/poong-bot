const onLoad = async () => {
    await loadDictionarys();
}

async function loadDictionarys(){
    const response = await fetch('/dictionary');
    const {dictionarys} = await response.json();
    const element = `<div>${dictionarys.map((dictionary)=>{
        const {createdAt,title,userId,content} = dictionary;
        return `<div>${title}: ${content} <span>${userId}</span></div>`
    }).join('')}</div>`;
    document.querySelector('body').innerHTML = element;
}
document.addEventListener('DOMContentLoaded',onLoad);
