let fileName="";
let select="";

const profileList = document.querySelectorAll('#profile_list tr td:first-child');
profileList.forEach((el) => {
    el.addEventListener('click', function () {
        fileName = el.textContent;
        profileList.forEach((otherEl) => {
            otherEl.style.setProperty("background-color", "white");
        });
        this.style.setProperty("background-color", "#888888");
        select = undefined;
        if (chart) {
            chart.destroy();
        }
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
        const td = document.createElement('td');
        td.textContent = profile;
        td.className= 'text-center fw-semibold';
        td.addEventListener('click',function(){
            fileName = profile;
            const profileList = document.querySelectorAll('#profile_list tr td:first-child');
            profileList.forEach((otherEl) => {
                otherEl.style.setProperty("background-color", "white");
            });
            this.style.setProperty("background-color", "#888888");
            if (chart) {
                chart.destroy();
            }
            getdata();
        });
        if(profile==fileName) td.style.setProperty("background-color", "#888888");
        row.appendChild(td);
        const td2 = document.createElement('td');
        const btndrop = document.createElement('button');
        btndrop.textContent="삭제";
        btndrop.className="btn btn-danger";
        btndrop.addEventListener('click',function(){ deleteTable(`${profile}`); });
        td2.appendChild(btndrop);
        row.appendChild(td2);
        
        tbody.appendChild(row);
    });
}

async function deleteTable(name){
    await axios.delete(`profiles/drop/${name}`);
    if(fileName==name && chart) {
        chart.destroy();
        const task_div = document.querySelector('#core');
        task_div.innerHTML="";
        const core_div = document.querySelector('#task');
        core_div.innerHTML = '';
        fileName = "";
    };
    setTimeout(getList,50);
}

async function getdata(){

    const res = await axios.get(`profiles/data/${fileName}`);
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
const btn3d = document.getElementById('threeD');

const btnCoreDeviation = document.getElementById('coreDeviation');
const btnTaskDeviation = document.getElementById('taskDeviation');

btnline.addEventListener('click', function () { 
    chart_type = 'line';
    btnline.className="btn btn-secondary";
    btnbar.className="btn btn-primary";
    btnpolarArea.className="btn btn-primary";
    btn3d.className="btn btn-primary";
    btnCoreDeviation.className = "btn btn-primary";
    btnTaskDeviation.className = "btn btn-primary";

    if(fileName.length!=0) updateChart(null,null);
})
btnbar.addEventListener('click', function () {
    chart_type = 'bar';
    btnline.className="btn btn-primary";
    btnbar.className="btn btn-secondary";
    btnpolarArea.className="btn btn-primary";
    btn3d.className="btn btn-primary";
    btnCoreDeviation.className = "btn btn-primary";
    btnTaskDeviation.className = "btn btn-primary";

    if(fileName.length!=0) updateChart(null,null);
});
btnpolarArea.addEventListener('click', function () {
    chart_type = 'polarArea';
    btnline.className="btn btn-primary";
    btnbar.className="btn btn-primary";
    btnpolarArea.className="btn btn-secondary";
    btn3d.className="btn btn-primary";
    btnCoreDeviation.className = "btn btn-primary";
    btnTaskDeviation.className = "btn btn-primary";

    if(fileName.length!=0) updateChart(null,null);
 });
btn3d.addEventListener('click', function () {
    chart_type = '3d';
    btnline.className="btn btn-primary";
    btnbar.className="btn btn-primary";
    btnpolarArea.className="btn btn-primary";
    btn3d.className="btn btn-secondary";
    btnCoreDeviation.className = "btn btn-primary";
    btnTaskDeviation.className = "btn btn-primary";

    if(fileName.length != 0) draw3DPlot();
});
btnCoreDeviation.addEventListener('click', function () {
    chart_type = 'coreDeviation';
    btnline.className = "btn btn-primary";
    btnbar.className = "btn btn-primary";
    btnpolarArea.className = "btn btn-primary";
    btn3d.className = "btn btn-primary";
    btnCoreDeviation.className = "btn btn-secondary";
    btnTaskDeviation.className = "btn btn-primary";
    
    if (fileName.length !== 0) drawCoreDeviationChart();
});
btnTaskDeviation.addEventListener('click', function () {
    chart_type = 'taskDeviation';

    btnline.className = "btn btn-primary";
    btnbar.className = "btn btn-primary";
    btnpolarArea.className = "btn btn-primary";
    btn3d.className = "btn btn-primary";
    btnCoreDeviation.className = "btn btn-primary";
    btnTaskDeviation.className = "btn btn-secondary";

    if (fileName.length !== 0) drawTaskDeviationChart();
});

async function updateChart(type, choose_name){
    document.getElementById("profilerChart").style.display = "block";
    document.getElementById("profilerPlot").style.display = "none";

    document.getElementById("core").style.display = "block";
    document.getElementById("task").style.display = "block";


    const profiler = document.getElementById('profilerChart').getContext('2d');
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

async function draw3DPlot() {
    if (!fileName) return;

    document.getElementById("profilerChart").style.display = "none";
    document.getElementById("profilerPlot").style.display = "block";

    document.getElementById("core").style.display = "none";
    document.getElementById("task").style.display = "none";


    const res = await axios.get(`profiles/data/${fileName}`);
    const datas = res.data.datas;

    if (!datas || datas.length === 0) {
        alert("해당 테이블에 데이터가 없습니다.");
        return;
    }

    const plotDiv = document.getElementById('profilerChart');
    plotDiv.innerHTML = '';

    const x = [], y = [], z = [];

    datas.forEach(row => {
        x.push(row.core);
        y.push(row.task);
        z.push(row.usaged);
    });

    const trace = {
        x, y, z,
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            size: 5,
            color: z,
            colorscale: 'Viridis'
        }
    };

    const layout = {
        margin: { l: 0, r: 0, b: 0, t: 40 },
        title: `${fileName}의 3D 차트`,
        scene: {
            xaxis: { title: 'Core' },
            yaxis: { title: 'Task' },
            zaxis: { title: 'Usage' }
        }
    };

    Plotly.newPlot('profilerPlot', [trace], layout);
}

async function drawCoreDeviationChart() {
    document.getElementById("profilerChart").style.display = "block";
    document.getElementById("profilerPlot").style.display = "none";
    document.getElementById("core").style.display = "none";
    document.getElementById("task").style.display = "none";

    const ctx = document.getElementById('profilerChart').getContext('2d');
    if (chart) chart.destroy();

    const res = await axios.get(`/profiles/deviation/core/${fileName}`);
    const datas = res.data;

    const labels = datas.map(d => d.core);
    const deviations = datas.map(d => d.stddev_usaged);

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Core별 Usage 표준편차',
                data: deviations,
                backgroundColor: 'rgba(255, 159, 64, 0.6)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${fileName}의 Core별 사용량 변동성 (표준편차)`,
                    font: { size: 24 }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function drawTaskDeviationChart() {
    document.getElementById("profilerChart").style.display = "block";
    document.getElementById("profilerPlot").style.display = "none";
    document.getElementById("core").style.display = "none";
    document.getElementById("task").style.display = "none";

    const ctx = document.getElementById('profilerChart').getContext('2d');
    if (chart) chart.destroy();

    const res = await axios.get(`/profiles/deviation/task/${fileName}`);
    const datas = res.data;

    const labels = datas.map(d => d.task);
    const deviations = datas.map(d => d.stddev_usaged);

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Task별 Usage 표준편차',
                data: deviations,
                backgroundColor: 'rgba(153, 102, 255, 0.6)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${fileName}의 Task별 사용량 변동성 (표준편차)`,
                    font: { size: 24 }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}