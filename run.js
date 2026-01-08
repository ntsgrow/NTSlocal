const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3000;
const DOWNLOADS = path.join(os.homedir(), "Downloads");
const DATA_FILE = path.join(os.homedir(), "Desktop", "data.txt");

let clients = {}; // ip -> { firstSeen, lastSeen }
let uploads = [];

function log(text) {
  fs.appendFileSync(DATA_FILE, `[${new Date().toLocaleString()}] ${text}\n`);
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "NTSlocal activity log\n\n");
}

function safeName(filePath) {
  if (!fs.existsSync(filePath)) return filePath;
  let ext = path.extname(filePath);
  let base = path.basename(filePath, ext);
  let dir = path.dirname(filePath);
  let i = 1;
  while (fs.existsSync(path.join(dir, `${base} (${i})${ext}`))) i++;
  return path.join(dir, `${base} (${i})${ext}`);
}

const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NTSlocal</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{
  margin:0;
  font-family:Inter,Arial,sans-serif;
  background:#121212;
  color:#e0e0e0;
}
header{
  padding:18px 30px;
  background:#1c1c1c;
  border-bottom:1px solid #333;
  font-size:20px;
  font-weight:600;
}
.container{
  display:flex;
  height:calc(100vh - 65px);
}
.main{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
}
.upload-box{
  background:#1e1e1e;
  padding:40px;
  border:2px dashed #555;
  border-radius:10px;
  text-align:center;
  width:360px;
}
.upload-box.drag{
  border-color:#aaa;
}
.upload-box h2{
  margin:0 0 10px;
  font-weight:500;
}
.upload-box input{
  margin-top:15px;
}
progress{
  width:100%;
  height:8px;
  margin-top:15px;
}
.speed{
  margin-top:10px;
  font-size:13px;
  color:#aaa;
}
.sidebar{
  width:260px;
  background:#1c1c1c;
  border-left:1px solid #333;
  padding:20px;
}
.sidebar h3{
  margin-top:0;
  font-size:15px;
  font-weight:600;
}
ul{
  padding-left:18px;
  margin:0;
}
li{
  font-size:13px;
  margin-bottom:6px;
  color:#ccc;
}
small{color:#888}
</style>
</head>
<body>

<header>NTSlocal</header>

<div class="container">
  <div class="main">
    <div class="upload-box" id="box">
      <h2>Import File</h2>
      <small>Drag & drop or select any file</small><br>
      <input type="file" id="file" multiple>
      <progress id="p" value="0" max="100"></progress>
      <div class="speed" id="speed"></div>
    </div>
  </div>

  <div class="sidebar">
    <h3>Connected Users</h3>
    <ul id="users"></ul>
    <hr>
    <h3>Recent Uploads</h3>
    <ul id="history"></ul>
  </div>
</div>

<script>
const box = document.getElementById("box");

box.ondragover = e => { e.preventDefault(); box.classList.add("drag"); };
box.ondragleave = () => box.classList.remove("drag");
box.ondrop = e => {
  e.preventDefault();
  box.classList.remove("drag");
  [...e.dataTransfer.files].forEach(send);
};

file.onchange = () => [...file.files].forEach(send);

function refresh(){
  fetch("/info").then(r=>r.json()).then(d=>{
    users.innerHTML="";
    d.users.forEach(u=>{
      let li=document.createElement("li");
      li.textContent=u;
      users.appendChild(li);
    });
    history.innerHTML="";
    d.uploads.forEach(f=>{
      let li=document.createElement("li");
      li.textContent=f;
      history.appendChild(li);
    });
  });
}
setInterval(refresh, 5000);
refresh();

function send(f){
  let x=new XMLHttpRequest();
  let d=new FormData();
  d.append("file",f);

  let startTime = Date.now();

  x.upload.onprogress = e=>{
    if(e.lengthComputable){
      p.value=(e.loaded/e.total)*100;
      let seconds = (Date.now()-startTime)/1000;
      let speed = e.loaded/seconds;
      speed = speed>1024*1024
        ? (speed/1024/1024).toFixed(2)+" MB/s"
        : (speed/1024).toFixed(2)+" KB/s";
      speedDiv.textContent="Speed: "+speed;
    }
  };

  x.onload = ()=>{
    p.value=0;
    speedDiv.textContent="";
    refresh();
  };

  x.open("POST","/upload");
  x.send(d);
}
</script>

</body>
</html>
`;

http.createServer((req,res)=>{
  const ip = req.socket.remoteAddress.replace("::ffff:","");
  if (!clients[ip]) {
    clients[ip] = { firstSeen: Date.now(), lastSeen: Date.now() };
    log(`CONNECTED ${ip}`);
  }
  clients[ip].lastSeen = Date.now();

  if(req.method==="GET" && req.url==="/"){
    res.writeHead(200,{"Content-Type":"text/html"});
    res.end(html);
  }

  if(req.method==="GET" && req.url==="/info"){
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify({
      users:Object.keys(clients),
      uploads:uploads.slice(-8).reverse()
    }));
  }

  if(req.method==="POST" && req.url==="/upload"){
    let data=[];
    req.on("data",c=>data.push(c));
    req.on("end",()=>{
      let buf=Buffer.concat(data);
      let match=buf.toString().match(/filename="(.+?)"/);
      if(!match) return res.end();

      let name=match[1];
      let start=buf.indexOf("\r\n\r\n")+4;
      let end=buf.lastIndexOf("\r\n------");
      let filePath=safeName(path.join(DOWNLOADS,name));
      fs.writeFileSync(filePath,buf.slice(start,end));

      uploads.push(name+" - "+new Date().toLocaleTimeString());
      log(`UPLOAD ${ip} -> ${name}`);
      res.end("OK");
    });
  }
}).listen(PORT,"0.0.0.0",()=>{
  console.log("NTSlocal running on port",PORT);
});

// disconnect checker
setInterval(()=>{
  const now = Date.now();
  for (let ip in clients) {
    if (now - clients[ip].lastSeen > 15000) {
      log(`DISCONNECTED ${ip}`);
      delete clients[ip];
    }
  }
}, 5000);
