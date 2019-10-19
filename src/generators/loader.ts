
const glob = require('glob');
const path = require('path');

export default (dir: string): any => {
  const rtn = {};
  glob.sync(`${dir}/*.js`).forEach((file: string) => {
    const mod = require(path.resolve(file));
    const pathObj = path.parse(file);
    if(pathObj.name !== 'index') {
      if(!mod) {
        console.log('invalid script')
      }
      Object.assign(rtn, mod);
    }
  });
  return rtn;
};
