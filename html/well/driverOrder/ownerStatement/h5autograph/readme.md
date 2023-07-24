# 功能描述
    
    签名，然后输出签名图片base64。
    [参考](https://www.jianshu.com/p/e6d8351b6483)
    输出图片分有背景色和无背景色，根据需求使用。
    若需要带背景色，需调用libs下的html2canvas.min.js和bluebird.core.min.js文件。

# 依赖的模块

    无

# 快速使用

## 方法一

/**
 * 无背景色
 */
zknightH5autographGetImg()

## 方法二

/**
 * 有背景色
 * background处设置背景色
 */
zknightH5autographGetBackGroundImg()

# 特别说明

    页面加载完毕后，方可调用。