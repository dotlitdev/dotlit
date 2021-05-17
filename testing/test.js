module.exports = async (meta) => {
  return `Hello world! From .lit and Nodejs ${process.env.NODE_VERSION} (${process.platform} ${process.arch}) thanks to RunKit. At ${new Date()}`
}