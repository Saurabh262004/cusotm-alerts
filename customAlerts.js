// the css is important please don't just pickup the script...

let customAlert;

class Alert {
  constructor(inputs) {
    this.params = inputs;
    console.log(this.params);
  
    let
    LU = inputs.lengthUnit,
    main = document.createElement('div'),
    alert = document.createElement('span'),
    alert_txt = document.createElement('p'),
    btn_container = document.createElement('span');
  
    main.className = 'CustomAlert container';
    main.id = 'ca-main';
    alert_txt.className = 'CustomAlert alert-txt';
    alert_txt.innerHTML = this.params.alert_txt;
    btn_container.className = 'CustomAlert btn-container';

    alert.className = 'CustomAlert alert in';
    alert.id = inputs.id;
    if (inputs.roundedCorners) {
      alert.style.borderRadius = '0.5vw';
    }
    alert.style.width = inputs.size.width + LU;
    alert.style.height = inputs.size.height + LU;
    alert.style.top = inputs.position.y + LU;
    alert.style.left = inputs.position.x + LU;

    for (let i = 0; i < Object.keys(inputs.buttons).length; i++) {
      let btn = document.createElement('button'),
      btn_name = inputs.buttons['button'+(i+1)];
      btn.className = 'CustomAlert btn in ' + btn_name;
      btn.id = 'btn_'+(i+1);
      btn.setAttribute('onclick', "customAlert.resolveAlert('"+btn_name+"')");
      if (inputs.roundedCorners) {
        btn.setAttribute('style', 'border-radius: 0.7vw;')
      }
      btn.innerHTML = btn_name;
      btn_container.appendChild(btn);
    }
  
    let root = document.querySelector(':root');
    root.style.setProperty('--alertColor', inputs.bgColor);
    root.style.setProperty('--textColor', inputs.textColor);
  
    alert.appendChild(alert_txt);
    alert.appendChild(btn_container);
    main.appendChild(alert);
    console.log(main);
    this.DOM = main;
  }
}

class CustomAlertClass {
  constructor() {
    if (customAlert) {
      throw new Error('CustomAlertClass already has an instance');
    }
    this.alerts = [];
    this.alert_ids = [];
    this.results = [];
    this.active = false;
  }

  new = (size, position, bgColor, textColor, buttons, roundedCorners, id, lengthUnit, alert_txt, textSize) => {
    let rawInputs = [size, position, bgColor, textColor, buttons, roundedCorners, id, lengthUnit, alert_txt, textSize];
    if (!this.check(rawInputs)) {
      return false;
    }

    let inputs = this.processInputs(rawInputs);

    this.alerts.push(new Alert(inputs));
    this.results.push(null);
    this.alert_ids.push(inputs.id);
  }

  check = (rawInputs) => {
    let
    inp = rawInputs,
    success = true,
    lengthUnits = ['em', 'ex', 'ch', 'rem', 'lh', 'rlh', 'vw', 'vh', 'vmin', 'vmax', 'vb', 'vi', 'svw', 'svh', 'lvw', 'lvh', 'dvw', 'dvh', '%', 'px'];

    // size check
    if (!Array.isArray(inp[0])) {
      console.error('please provide an array with two values for width and height as size');
      success = false;
    } else if (inp[0].length !== 2) {
      console.error('size must contain only two integers');
      success = false;
    } else if (isNaN(inp[0][0]) || isNaN(inp[0][1])) {
      console.error('size must only contain integers');
      success = false;
    }

    // position check
    if (!Array.isArray(inp[1])) {
      console.error('please provide an array with two values for x and y as position');
      success = false;
    } else if (inp[1].length !== 2) {
      console.error('position must contain only two integers');
      success = false;
    } else if (isNaN(inp[1][0]) || isNaN(inp[1][1])) {
      console.error('position must only contain integers');
      success = false;
    }

    // bgColor check
    if (!this.colCheck(inp[2], true, false)[0]) {
      console.error('invalid bgColor');
      success = false;
    }

    // textColor check
    if (!this.colCheck(inp[3], true, false)[0]) {
      console.error('invalid textColor');
      success = false;
    }

    // buttons check
    if (!Array.isArray(inp[4])) {
      console.error('please provide an array of strings ');
      success = false;
    } else if (inp[4].length <= 0) {
      console.error('please provide at least one button');
      success = false;
    } else if (inp[4].length >= 4) {
      console.error('please provide less than 4 buttons');
      success = false;
    } else {
      for (let i = 0; i < inp[4].length; i++) {
        if (inp[4][i] === undefined || inp[4][i] === NaN || inp[4][i] === null || this.replace_space(inp[4][i].toString(), '') === '') {
          console.error('please provide a valid button name at index ' + i + ' in button array');
          success = false;
        }
      }
    }

    // id check
    if (inp[6] === undefined || inp[6] === NaN || inp[6] === null || this.replace_space(inp[6].toString(), '') === '') {
      console.error('plase provide a valid id');
      success = false;
    }
    let ch = document.getElementById(inp[6]);
    if (ch !== undefined && ch !== null && ch.length >= 1) {
      console.error("one or more elements are using the id '"+inp[6]+"' please change the id for the alert");
      success = false;
    }
    for (let i = 0; i < this.alert_ids.length; i++) {
      if (inp[6] === this.alert_ids[i]) {
        console.error('an alert with similar id has been found, please change the id for the alert');
        success = false;
      }
    }

    // lengthUnit check
    if (!this.includes(inp[7].toLowerCase(), lengthUnits)[0]) {
      console.error('please provide a valid lengthUnit for css');
      success = false;
    }

    // alert_txt check
    if (inp[8] === undefined || inp[8] === NaN || inp[8] === null || this.replace_space(inp[8].toString(), '') === '') {
      console.error('please provide a valid alert text');
      success = false;
    }

    // textSize check
    let successLog = [],
    txtSizeUnitSuccess = false;
    for (let i = 0; i < lengthUnits.length; i++) {
      if (inp[9].slice(inp[9].length-lengthUnits[i].length, inp[9].length).toLowerCase() === lengthUnits[i]) {
        successLog.push(lengthUnits[i]);
        txtSizeUnitSuccess = true;
      }
    }
    if (successLog.length > 1) {
      for (let i = 0; i < successLog.length; i++) {
        for (let j = i; j < successLog.length; j++) {
          if (successLog[i].length < successLog[j].length) {
            let temp = successLog[i];
            successLog[i] = successLog[j];
            successLog[j] = temp;
          }
        }
      }
    }
    if (!txtSizeUnitSuccess) {
      success = false;
      console.error('please provide a valid text size unit from this list' + lengthUnits);
    } else {
      let num = inp[9].slice(0, inp[9].length-successLog[0].length);
      if (!num == parseInt(num)) {
        success = false;
        console.error('please provide a valid decimal number in the textSize');
      }
    }

    return success;
  }

  processInputs = (rawInputs) => {
    let inp = rawInputs,
    inputs = {};

    inputs.buttons = {};

    inputs.size = {
      width : inp[0][0],
      height : inp[0][1]
    };

    inputs.position = {
      x : inp[1][0],
      y : inp[1][1]
    };

    for (let i = 0; i < inp[4].length; i++) {
      inputs.buttons["button"+(i+1)] = inp[4][i].toString();
    }

    if (inp[5] !== true) {
      inputs.roundedCorners = false;
    } else inputs.roundedCorners = inp[5];

    inputs.bgColor = this.colCheck(inp[2], false, true)[1];
    inputs.textColor = this.colCheck(inp[3], false, true)[1];
    inputs.id = inp[6].toString();
    inputs.lengthUnit = inp[7].toLowerCase();
    inputs.alert_txt = inp[8].toString();
    inputs.textSize = inp[9].toLowerCase();

    return inputs;
  }

  alert = (alert_id) => {
    if (this.alert_ids.length < 1) {
      console.error('no custom alerts set, please set a custom alert');
      return false;
    }

    if (this.active) {
      console.error('cannot show multiple alerts at once!');
      return false;
    }

    let id_location = false;
    for (let i = 0; i < this.alert_ids.length; i++) {
      if (alert_id === this.alert_ids[i]) {
        id_location = i;
      }
    }

    if (id_location === false) {
      console.error('could not find an alert with id ' + alert_id + ', please check for spelling errors');
      return false;
    }

    document.getElementsByTagName('body')[0].appendChild(this.alerts[id_location].DOM);
    this.active = true;
  }

  resolveAlert = (result) => {
    if (!this.active) {
      console.error('no alerts are being displayed at the current time');
      return false;
    }

    let alert = document.getElementsByClassName('CustomAlert alert')[0],
    index = this.includes(alert.id, this.alert_ids)[1];
    this.results[index] = result;

    window.setTimeout(()=>{document.getElementById('ca-main').remove()}, 200);
    this.active = false;
  }

  getResult = (alert_id) => {
    let inc = this.includes(alert_id, this.alert_ids);

    if (!inc[0]) {
      console.error('cannot find an alert with the id ' + alert_id);
      return undefined;
    }

    if (this.results[inc[1]] === null) {
      console.error('no result found for the alert');
      return undefined;
    }

    return this.results[inc[1]];
  }

  getcss = () => {
    let head = document.getElementsByTagName('head')[0],
    thisFile = document.currentScript.src,
    thisLocation = thisFile.substring(0, thisFile.lastIndexOf('/')+1),
    link = document.createElement('link');
    link.rel = 'styleSheet';
    link.type = 'text/css';
    link.href = thisLocation+'customAlerts.css';
    head.appendChild(link);
  }

  includes = (element, array) => {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === element) {
        return [true, i];
      }
    }

    return [false];
  }

  replace_space = (str, replacer) => {
    let new_str = '';
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ' ') {
        new_str += replacer;
      } else {
        new_str += str[i];
      }
    }

    return new_str;
  }

  colCheck = (color, check, process) => {
    let hashLess = (color[0].toString() === '#') ? color.toString().slice(1) : color.toString(),
    out = '#';

    if (check) {
      if (hashLess.length !== 3 && hashLess.length !== 6) {
        return [false];
      } else {
        for (let i = 0; i < hashLess.length; i++) {
          if (isNaN(parseInt(hashLess[i], 16))) {
            return [false];
          }
        }
      }
    }

    if (process) {
      switch (hashLess.length) {
        case 3 : {
          for (let i = 0; i < 3; i++) {
            out += hashLess[i] + hashLess[i];
          }
        }; break;
        case 6 : {
          out += hashLess.toLowerCase();
        }
      }
      return [true, out.toLowerCase()];
    }

    return [true];
  }
}

const test = () => {
  customAlert.new([25, 25], [37.5, 10], "#c28af0", "111", ['yes', 'no', 'huh?'], true, 'test-1', '%', 'This is a test alert?', '1em');
  customAlert.alert('test-1');
}

customAlert = new CustomAlertClass();
customAlert.getcss();
