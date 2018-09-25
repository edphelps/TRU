

function leftpad1(_str, _len, _ch) {
  let str = String(_str);
  let ch = _ch;
  const len = _len - str.length;

  let i = -1;

  if (!ch && ch !== 0)
    ch = ' ';


  while (++i < len) {
    str = ch + str;
  }

  return str;
}

console.log(leftpad1("test", 10, 0));
