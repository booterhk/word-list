/*
 * @Author       : hekai
 * @Date         : 2021-04-09 17:20:03
 * @FilePath     : \word-card\server\readline.js
 * @Description  :
 */
//引入
var fs = require("fs");
var readline = require("readline");

//调用方法
var path = "./src/word.txt";
// const all = 'your [jʌŋ] pron. 你的；你们的'
// const indexFirst = all.indexOf(' ', 1)
// const indexSecond = all.indexOf(' ', 2)
// console.log('index',all, indexFirst, indexSecond)
read_file(path, function(data) {
    console.log('read_file',data)
    fs.writeFile('./src/word-list.json', JSON.stringify(data), err => {
        console.log('写入完成')
    })
});

//定义读取方法
function read_file(path, callback) {
  var fRead = fs.createReadStream(path);
  var objReadline = readline.createInterface({
    input: fRead,
  });
  var arr = new Array();
  objReadline.on("line", function(line) {
    const item = line.trimEnd()
    const indexFirst = item.indexOf('[')
    const indexSecond = item.indexOf(']')
    // console.log('index',item, indexFirst, indexSecond)
    // item.splice(0, index)
    // item.splice(index, item.indexOf(' '))
    arr.push({word: item.slice(0, indexFirst-1), pronunciation: item.slice(indexFirst, indexSecond+1), explain: item.slice(indexSecond+2, item.length)});
  });
  objReadline.on("close", function() {
    callback(arr);
  });
}
