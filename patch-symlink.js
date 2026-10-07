const fs = require('fs');
const path = require('path');

const origSymlinkSync = fs.symlinkSync;
fs.symlinkSync = function (target, dest, type) {
  try {
    return origSymlinkSync.call(fs, target, dest, type);
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      try {
        const resolvedTarget = path.resolve(path.dirname(dest), target);
        if (fs.existsSync(resolvedTarget)) {
          const stat = fs.statSync(resolvedTarget);
          if (stat.isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            fs.cpSync(resolvedTarget, dest, { recursive: true });
          } else {
            fs.copyFileSync(resolvedTarget, dest);
          }
          return;
        }
      } catch (copyErr) {
        console.warn('Symlink polyfill copy failed:', copyErr.message);
      }
    }
    throw err;
  }
};

const origSymlink = fs.symlink;
fs.symlink = function (target, dest, type, cb) {
  if (typeof type === 'function') {
    cb = type;
    type = undefined;
  }
  try {
    fs.symlinkSync(target, dest, type);
    if (cb) cb(null);
  } catch (err) {
    if (cb) cb(err);
    else throw err;
  }
};

if (fs.promises && fs.promises.symlink) {
  fs.promises.symlink = async function (target, dest, type) {
    return fs.symlinkSync(target, dest, type);
  };
}
