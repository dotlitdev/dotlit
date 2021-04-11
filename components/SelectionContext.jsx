import React from 'react'

// SelectedCell is the hast node corresponding to the cell.

export default React.createContext({
    fs: {},
    file: {},
    src: '',
    selectedCell: null,
    setSelectedCell: ()=>{},
    setSrc: () => {},
});
