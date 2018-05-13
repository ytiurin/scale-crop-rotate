function nextSpin() {
  deg = ++deg > 360 ? 0 : deg;
  spinner.style.transform = `rotate3d(0,0,1,${deg}deg)`
  requestAnimationFrame(nextSpin);
}

var spinner = document.createElement('div');
spinner.setAttribute('style', 'background:red;height:60px;position:fixed;right:20px;top:20px;width:60px;');
document.body.append(spinner);
var deg = 0;

nextSpin();
