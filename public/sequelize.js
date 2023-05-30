document.querySelectorAll('#profile_list tr').forEach((el) => {
    el.addEventListener('click', function () {
        const profile = el.querySelector('td').textContent;
        getdata(profile);
    });
});


document.getElementById('profile_form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const files = document.querySelector('#input_profile').files;
    let profiles = [];
    let is_error = false;
    if(!files){
        return alert('파일을 등록하세요');
    }
    const filePromises = Array.from(files).map((file) => {
        if (file.name.split(".").pop().toLowerCase() === 'txt') {
            return new Promise((resolve, reject) => {
                readTextFile(file, (data) => {
                    profiles.push(data);
                    resolve();
                });
            });
        } else {
            alert(".txt파일만 입력해주세요");
            is_error = true;
        }
    });

    await Promise.all(filePromises);

    console.log(profiles);

    if(!is_error){
        const response = await fetch('/profiles',{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(profiles)
        });

        if (response.ok) {
            response.json().then(data => {
                getList();
                alert(data.message);
            });
        } else {
            console.error('파일 전송 중 오류가 발생하였습니다.');
        }
    }
});

async function getList(){
    const res = await axios.get('profiles');
    const profiles = res.data;

    const tbody = document.querySelector('#profile_list tbody');
    tbody.innerHTML = '';

    profiles.map(function(profile){
        const row = document.createElement('tr');
        row.addEventListener('click',() =>{
            getdata(profile);
        });
        let td = document.createElement('td');
        td.textContent = profile;
        row.appendChild(td);
        
        tbody.appendChild(row);
    });
}

async function getdata(fileName){
    console.log(fileName,"선택됨");
    const state = document.querySelector('#state');
    state.innerHTML='';
    state.append(`${fileName}의 전체정보`);

    const res = await axios.get(`profiles/data/${fileName}`);
    const datas = res.data.datas;
    const cores = res.data.cores;
    const tesks = res.data.tesks;

    const tesk_div = document.querySelector('#core');
    tesk_div.innerHTML = '';
    tesks.map(function(tesk){
        let button = document.createElement('button');

        button.textContent = tesk.core;
        button.addEventListener('click', async function(){
            const res = await axios.get(`profiles/coredata/${fileName}/${tesk.core}`);
            const datas = res.data;

            const div = document.querySelector('#data');
            div.innerHTML = '';
        
            datas.map(function(data){
                let row = document.createElement('span');
                row.textContent = data.tesk+"\t";
                div.appendChild(row);
                row = document.createElement('span');
                row.textContent = data.usaged+"\t";
                div.appendChild(row);
                row = document.createElement('br');
                div.appendChild(row);
            });

            const state = document.querySelector('#state');
            state.innerHTML='';
            state.append(`${fileName}의 ${tesk.core} 정보`);
        });
        tesk_div.appendChild(button);
    });

    const core_div = document.querySelector('#tesk');
    core_div.innerHTML = '';
    cores.map(function(core){
        let button = document.createElement('button');
        button.textContent = core.tesk;
        button.addEventListener('click', async function(){
            const res = await axios.get(`profiles/teskdata/${fileName}/${core.tesk}`);
            const datas = res.data;

            const div = document.querySelector('#data');
            div.innerHTML = '';

            datas.map(function(data){
                let row = document.createElement('span');
                row.textContent = data.core+"\t";
                div.appendChild(row);
                row = document.createElement('span');
                row.textContent = data.usaged+"\t";
                div.appendChild(row);
                row = document.createElement('br');
                div.appendChild(row);
            });

            const state = document.querySelector('#state');
            state.innerHTML='';
            state.append(`${fileName}의 ${core.tesk} 정보`);

        });
        core_div.appendChild(button);
    });


    const div = document.querySelector('#data');
    div.innerHTML = '';

    datas.map(function(data){
        let row = document.createElement('span');
        row.textContent = data.core+"\t";
        div.appendChild(row);
        row = document.createElement('span');
        row.textContent = data.tesk+"\t";
        div.appendChild(row);
        row = document.createElement('span');
        row.textContent = data.usaged+"\t";
        div.appendChild(row);
        row = document.createElement('br');
        div.appendChild(row);
    });
    
}

async function get_coredata(fileName, cores){
    
}

async function get_teskdata(fileName, tesks){

}


function readTextFile(file, save) {
    const reader = new FileReader();
  
    reader.onload = async function(event) {
        const contents = event.target.result;
        let line_parse = contents.split("\n");
        const parse = [[file.name]];
        for(let i=0; i<line_parse.length; i++){
            parse.push(line_parse[i].trim().split(/\t| |,|\//));
        }
        save(parse);
    };

    reader.onerror = function(event){
        console.error("잘못된 파일");
    }

    reader.readAsText(file, 'UTF-8');

}