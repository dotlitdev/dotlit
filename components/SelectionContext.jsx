import React from 'react'

// SelectedCell is the hast node corresponding to the cell.

export default React.createContext({
    src: '',
    selectedCell: null,
    setSelectedCell: ()=>{},
    setSrc: () => {},
});