
const info = {
  text: `Hello world! From .lit and Nodejs (${process.platform} ${process.arch}) thanks to RunKit.`,
  cwd: process.cwd(),
  env: process.env,
  
}
module.exports = async (meta) => {
  return 42
}