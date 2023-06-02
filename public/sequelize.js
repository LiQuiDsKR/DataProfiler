let fileName;
let select;

document.querySelectorAll('#profile_list tr').forEach((el) => {
    el.addEventListener('click', function () {
        fileName = el.querySelector('td').textContent;
        select = undefined;
        getdata();
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
            getdata();
        });
        let td = document.createElement('td');
        td.textContent = profile;
        row.appendChild(td);
        
        tbody.appendChild(row);
    });
}

async function getdata(){
    console.log(fileName,"선택됨");
    const state = document.querySelector('#state');
    state.innerHTML='';
    state.append(`${fileName}의 전체정보`);

    const res = await axios.get(`profiles/data/${fileName}`);
    const datas = res.data.datas;
    const cores = res.data.cores;
    const tasks = res.data.tasks;

    const task_div = document.querySelector('#core');
    task_div.innerHTML = 'select core : ';
    tasks.map(function(task){
        let button = document.createElement('button');
        button.className = 'btn btn-info me-2';
        button.textContent = task.core;
        button.addEventListener('click', function(){
            updateChart('task', task.core);
            const coreDiv = document.getElementById('core');
            const coreBtns = coreDiv.getElementsByClassName('btn');
            for (let i = 0; i < coreBtns.length; i++) {
                coreBtns[i].className = "btn btn-info me-2";
            }
            const taskDiv = document.getElementById('task');
            const taskBtns = taskDiv.getElementsByClassName('btn');
            for (let i = 0; i < taskBtns.length; i++) {
                taskBtns[i].className = "btn btn-success me-2";
            }
            this.className = "btn btn-secondary me-2";
        });
        task_div.appendChild(button);
    });

    const core_div = document.querySelector('#task');
    core_div.innerHTML = 'select task : ';
    cores.map(function(core){
        let button = document.createElement('button');
        button.className = 'btn btn-success me-2';
        button.textContent = core.task;
        button.addEventListener('click', function(){
            updateChart('core', core.task);
            const coreDiv = document.getElementById('core');
            const coreBtns = coreDiv.getElementsByClassName('btn');
            for (let i = 0; i < coreBtns.length; i++) {
                coreBtns[i].className = "btn btn-info me-2";
            }
            const taskDiv = document.getElementById('task');
            const taskBtns = taskDiv.getElementsByClassName('btn');
            for (let i = 0; i < taskBtns.length; i++) {
                taskBtns[i].className = "btn btn-success me-2";
            }
            this.className = "btn btn-secondary me-2";
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
        row.textContent = data.task+"\t";
        div.appendChild(row);
        row = document.createElement('span');
        row.textContent = data.usaged+"\t";
        div.appendChild(row);
        row = document.createElement('br');
        div.appendChild(row);
    });
    
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

let chart;
let chart_type = 'line';
let labels = [];
let minData = [];
let maxData = [];
let avgData = [];

const btnline = document.getElementById('line');
const btnbar = document.getElementById('bar');
const btnpolarArea = document.getElementById('polarArea');

btnline.addEventListener('click', function () { 
    chart_type = 'line'; updateChart(null,null);
    btnline.className="btn btn-secondary"; btnbar.className="btn btn-primary"; btnpolarArea.className="btn btn-primary";
})
btnbar.addEventListener('click', function () {
    chart_type = 'bar'; updateChart(null,null);
    btnline.className="btn btn-primary"; btnbar.className="btn btn-secondary"; btnpolarArea.className="btn btn-primary";
});
btnpolarArea.addEventListener('click', function () {
    chart_type = 'polarArea'; updateChart(null,null);
    btnline.className="btn btn-primary"; btnbar.className="btn btn-primary"; btnpolarArea.className="btn btn-secondary";
 });

async function updateChart(type, choose_name){

    const profiler = document.getElementById('profiler').getContext('2d');
    if (chart) {
        chart.destroy();
    }

    if(type == 'core'){
        select = choose_name;
        const res = await axios.get(`profiles/taskdata/${fileName}/${select}`);
        const datas = res.data;

        labels = [];
        minData = [];
        maxData = [];
        avgData = [];
        datas.forEach((data) => {
            labels.push(data.core);
            minData.push(data.min_usaged);
            maxData.push(data.max_usaged);
            avgData.push(data.avg_usaged);
        });
        console.log(datas);

        const state = document.querySelector('#state');
        state.innerHTML='';
        state.append(`${fileName}의 ${select} 정보`);

    }else if(type == 'task'){
        select = choose_name;
        const res = await axios.get(`profiles/coredata/${fileName}/${select}`);
        const datas = res.data;

        labels = [];
        minData = [];
        maxData = [];
        avgData = [];
        datas.forEach((data) => {
            labels.push(data.task);
            minData.push(data.min_usaged);
            maxData.push(data.max_usaged);
            avgData.push(data.avg_usaged);
        });

        const state = document.querySelector('#state');
        state.innerHTML='';
        state.append(`${fileName}의 ${select} 정보`);

    }
    if(fileName==undefined || select==undefined) return;

    chart = new Chart(profiler, {
        type: `${chart_type}`,
        data: {
          labels: labels,
          datasets: [{
            label: 'Min',
            data: minData,
            borderColor: 'rgba(0, 0, 255, 0.5)',
            backgroundColor: 'rgba(0, 0, 255, 0.5)',
          }, {
            label: 'Max',
            data: maxData,
            borderColor: 'rgba(255, 0, 0, 1)',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
          }, {
            label: 'Avg',
            data: avgData,
            borderColor: 'rgba(100, 255, 30, 1)',
            backgroundColor: 'rgba(100, 255, 30, 0.5)',
          }]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: `${fileName}의 ${select} 정보`,
              font: {
                size: 30
              }
            }
          }
        },
    });
    
}

