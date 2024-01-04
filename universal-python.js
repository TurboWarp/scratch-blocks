/* eslint-env node */

// There are a lot of different ways that people can install python, and there is no
// universal name that they use for the actual executable. We can already assume
// that there is a working Node.js environment, so this script can figure it out.

var child_process = require('child_process');
var _which = require('which');

function which(command) {
  return _which.sync(command, {
    nothrow: true
  });
}

function run(command, args) {
  console.log('universal-python: running ' + command + ' with arguments ' + args.join(', '));
  var subprocess = child_process.spawn(command, args, {
    windowsHide: true,
    shell: false,
    stdio: 'inherit'
  });
  subprocess.on('exit', function(code) {
    console.log('universal-python: exited with code ' + code);
    process.exit(code);
  });
  process.on('SIGINT', function() {
    subprocess.kill('SIGINT');
  });
}

var argv = process.argv.slice(2);

// Linux distributions, macOS, and Microsoft Store install python 3 as python3
// This is the happy path
var python3 = which('python3');
if (python3) {
  run(python3, argv);
} else {
  // Windows installers from python.org install the py launcher
  var py = which('py');
  if (py) {
    run(py, ['-3'].concat(argv));
  } else {
    // Sometimes it only gets installed as "python"
    // Don't know what version it will be, but 2 and 3 both work so it doesn't matter
    var python = which('python');
    if (python) {
      run(python, argv);
    } else {
      // Some weird systems might only have python 2 installed as python2
      var python2 = which('python2');
      if (python2) {
        run(python2, argv);
      } else {
        console.log("Could not find any python executables on your PATH environment variable");
        process.exit(1);
      }
    }
  }
}
