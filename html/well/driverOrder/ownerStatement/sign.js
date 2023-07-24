const MIME_TYPE = "image/png";
// 宽高可以自适应，直接通过JS获取屏幕宽高，或者只获取宽度
const canvasWidth = 800, canvasHeight = 600;
const FONT = "'Helvetica Neue', Helvetica, 'Microsoft YaHei', STXihei, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif";
(function () {
  init("#user_sign")
  writeFont('#contact', '王静', '510228198207050018', '豫GE5092','company', '2022.3.1')
})()


// canvas.toDataURL() 获取图片的Base64编码

/**
 * 初始化
 */
function init(selector) {
  let x, y
  const canvas = $(selector)
  const ctx = canvas.getContext("2d")
  canvas.onmousedown = function (event) {
    x = event.clientX - this.offsetLeft
    y = event.clientY - this.offsetTop
    document.onmousemove = function(event) {
      const x1 = event.clientX - canvas.offsetLeft
      const y1 = event.clientY - canvas.offsetTop
      draw(x, y, x1, y1, ctx)
      x = x1
      y = y1
    }
  }
  document.onmouseup = function () {
    this.onmousemove = null
  }
}


/**
 * 保存签名
 */
function sign(selector) {
  let canvas = $(selector)
  let imgURL = canvas.toDataURL(MIME_TYPE)
  cut(imgURL).then((data) => {
    //测试
    $('#result').src = data
    const signImg = new Image()
    signImg.src = data
    signImg.onload = function() {
      // 在这边校验长宽，比如长宽大小都不到100，则判定签名无效，返回
      console.info('width =', signImg.width, ',height =', signImg.height)
      // 此处考虑如何将获取到的Base64编码转移到合同页面
      const ctx = $('#contact').getContext('2d')
      ctx.clearRect(canvasWidth - 200, canvasHeight - 200, 200, 200)
      ctx.drawImage(signImg, canvasWidth - 200, canvasHeight - 200, 180, 180)
    }
  }).catch(e => {
    console.error(e)
  })
}

/**
 * 清空画布
 */
function clean(selector) {
  const canvas = $(selector)
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * 初始化文本
 */
function writeFont(selector, name, ID, carID,company, signDate) {
  const MARGIN_LEFT = 20, MARGIN_TOP = 20, LINE_HEIGHT = 36, FIRST_LINE_HEIGHT = 60
  const canvas = $(selector)
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  // 标题
  ctx.font = '40px ' + FONT
  let width = getStrWidth(ctx, '声明')
  ctx.fillText('声明', (canvasWidth - width) / 2 , MARGIN_TOP)
  // 内容
  ctx.font = '26px ' + FONT
  const line1 = `      本人（姓名：${name}，身份证：${ID}），在此申明，车号：${carID}为本人所有，为符合当地运营要求，挂靠在${company}。`
  const line1s = autoSplitStr(ctx, line1)
  for(let i = 0; i < line1s.length; i++) {
    ctx.fillText(line1s[i], MARGIN_LEFT , MARGIN_TOP + LINE_HEIGHT * i + FIRST_LINE_HEIGHT)
  }
  const line2 = `特此说明。`
  ctx.fillText(line2, MARGIN_LEFT , MARGIN_TOP + FIRST_LINE_HEIGHT + (line1s.length + 1) * LINE_HEIGHT)
  const line3 = `姓       名：${name}`
  ctx.fillText(line3, MARGIN_LEFT , MARGIN_TOP + FIRST_LINE_HEIGHT + (line1s.length + 3) * LINE_HEIGHT)
  const line4 = `身份证号：${ID}`
  ctx.fillText(line4, MARGIN_LEFT , MARGIN_TOP + FIRST_LINE_HEIGHT + (line1s.length + 4) * LINE_HEIGHT)
  const line5 = `日       期：${signDate}`
  ctx.fillText(line5, MARGIN_LEFT , MARGIN_TOP + FIRST_LINE_HEIGHT + (line1s.length + 5) * LINE_HEIGHT)

  ctx.font = 'normal bold  26px ' + FONT
  ctx.lineWidth = 10
  const line6 = `签字处：`
  const sWidth = getStrWidth(ctx, line6)
  ctx.fillText(line6, canvasWidth - 200 - sWidth , canvasHeight - 100 - (26 / 2))
}
function saveImg(selector)
{
	const canvas = $(selector);
	let image =  new  Image();
	image.src =  canvas.toDataURL({format: 'image/png', quality:1, width:800, height:600});
	var url = image.src;
	//url = image.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
	console.log(url)
	window.open(url);
}
function autoSplitStr(ctx, str) {
  const MAX_WIDTH = canvasWidth - 60
  const lines = []
  let lastPos = 0
  let lineWidth = 0
  for(let i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width
    if (lineWidth >= MAX_WIDTH) {
      lines.push(str.substring(lastPos, i))
      lastPos = i
      lineWidth = 0
    }
  }
  if (lastPos < str.length) {
    lines.push(str.substring(lastPos, str.length))
  }
  return lines
}


/**
 * 绘画
 */
 function draw(startX, startY, endX, endY, ctx) {
  ctx.beginPath()
  ctx.globalAlpha = 1
  ctx.lineWidth = 8
  ctx.strokeStyle = "red"
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.closePath()
  ctx.stroke()
}

/**
 * 剪切图片，去除图片的空白区域
 */
function cut(base64)  {
  const img = new Image()
  img.src = base64
  return new Promise((resolve, reject) => {
      img.onload = function () {
      try {
        //创建处理画布对象
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height
        //绘制
        ctx.drawImage(img, 0, 0)
        //读取图片数据
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let lOffset = canvas.width, rOffset = 0, tOffset = canvas.height, bOffset = 0;
        for (let i = 0; i < canvas.width; i++) {
          for (let j = 0; j < canvas.height; j++) {
            let pos = (i + canvas.width * j) * 4
            if (imgData[pos] == 255 || imgData[pos + 1] == 255 || imgData[pos + 2] == 255 || imgData[pos + 3] == 255) {
              // 找到有色彩的最下端
              bOffset = Math.max(j, bOffset)
              // 找到有色彩的最右端
              rOffset = Math.max(i, rOffset)
              // 找到有色彩的最上端
              tOffset = Math.min(j, tOffset)
              // 找到有色彩的最左端
              lOffset = Math.min(i, lOffset)
            }
          }
        }
        lOffset++
        rOffset++
        tOffset++
        bOffset++
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        //创建处理后画布对象
        canvas.width = rOffset - lOffset
        canvas.height = bOffset - tOffset
        ctx.drawImage(img, lOffset, tOffset, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL())
      } catch(e) {
        reject(e)
      }
      }
  })
}

function $(selector) {
  return document.querySelector(selector)
}

function getStrWidth(ctx, str) {
  var lineWidth = 0
  for (let code of str) {
    lineWidth += ctx.measureText(code).width
  }
  return lineWidth
}