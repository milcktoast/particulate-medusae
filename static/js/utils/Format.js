var Format = App.Format = {};

Format.number = function (val) {
  var chars = ('' + val).split('');
  var str = '';
  var index;

  for (var i = 0, il = chars.length; i < il; i ++) {
    index = il - i - 1;
    str += chars[i];
    if (index % 3 === 0 && index > 0) {
      str += ',';
    }
  }

  return str;
};

Format.absoluteLength = function (val, length) {
  val = '' + val;
  while (val.length < length) {
    val = '0' + val;
  }
  return val;
};
