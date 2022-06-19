// initially, because it's on every change 
// a commit will mostly be for a single
// file at a time the immediate exception 
// being when a file with output files 
// is edited, in which case the commit 
// includes those files.

export const fn = async () => {
  const now = (new Date()).toISOString()

  const fs = lit.lfs 
  const dir = lit.location.root
  const git = lit.git
  const FILE = 0, WORKDIR = 2, STAGE = 3

  const unstaged = row => {
    return row[WORKDIR] !== row[STAGE]
  }

  // get/list unstaged files
  const status = await git.statusMatrix({ fs,dir})
  const files = status
                .filter( unstaged )
                .map(row => row[FILE])

  // stage everything
  await git.add({fs, dir, filepath: '.'})

  // message 
  const message = `Commit ${lit.location.src}

at ${now} includes the following ${files.length} files:
${files.map(f=> "- " + f).join('\n')}`

  // return message

  // commit
  const sha = await git.commit({fs, dir,
    message,
    author: {
      name: 'dotlitbot',
      email: 'bot@dotlit.org'
    }
  })
  return `Committed ${sha.slice(0,6)} 
${message}`
}